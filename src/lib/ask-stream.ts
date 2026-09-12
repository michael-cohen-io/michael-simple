import type Anthropic from "@anthropic-ai/sdk";

import { ASK_MODEL, ASK_SYSTEM, firstQuestion } from "./ask";
import { PARTY_TOOL, mergeEffects, validateEffects, type Effects } from "./party";

/**
 * The two ways a question gets answered, as async generators of the events
 * the browser renders as they happen (api/ask.ts turns them into
 * server-sent events; src/components/ask/ask.tsx consumes them):
 *
 * - `delta`: a piece of the answer as the model writes it (a preview; the
 *   next `message` is the authoritative text and replaces what was shown).
 * - `message`: the complete text of one agent message.
 * - `tool`: the agent called its page tool; text said before it was
 *   narration and is dropped.
 * - `effects`: one validated Party Mode call, applied by the page at once.
 * - `done`: the turn is over; `sessionId` is the session to continue on, or
 *   null when it must not be reused.
 *
 * `askAgent` is one turn of a Managed Agents session and follows the
 * platform's client patterns: stream first, then send; break on idle only
 * when the stop reason asks nothing of the client, answering its custom
 * tool calls otherwise; a session that hit its budget or ran out of retries
 * is not handed back. The client is injected so the loop can be tested
 * against a fake stream.
 */

export type AskEvent =
  | { type: "delta"; text: string }
  | { type: "message"; text: string }
  | { type: "tool"; name: string; listText: boolean }
  | { type: "effects"; effects: Effects }
  | { type: "done"; sessionId: string | null; backend: "agent" | "messages" };

export type AskAgentOptions = {
  question: string;
  sessionId: string | null;
  /** What Party Mode has active in the browser. */
  active: Effects;
  /** The page's visible text runs, for the tool's `list_text` step. */
  runs: string[];
  /** The page as Markdown, sent with the first question of a session. */
  context: () => Promise<string>;
  agentId: string;
  environmentId: string;
  /** Milliseconds before the turn is abandoned with whatever has arrived. */
  deadlineMs: number;
  /** Called with a session's id and Console trace link when one is created. */
  onSession?: (sessionId: string, consoleUrl: string) => void;
  workspace?: string;
};

export function consoleUrl(sessionId: string, workspace = "default"): string {
  return `https://platform.claude.com/workspaces/${workspace}/sessions/${sessionId}`;
}

type ToolCall = { id: string; name: string; input: unknown };
type ToolResult = Anthropic.Beta.Sessions.BetaManagedAgentsUserCustomToolResultEventParams;

/** Answers one custom tool call: what to send back, and the effects it applied. */
export function answerToolCall(
  call: ToolCall,
  active: Effects,
  runs: string[],
): { result: ToolResult; effects?: Effects; listText: boolean } {
  const reply = (text: string, isError = false): ToolResult => ({
    type: "user.custom_tool_result",
    custom_tool_use_id: call.id,
    ...(isError ? { is_error: true } : {}),
    content: [{ type: "text", text }],
  });
  if (call.name !== PARTY_TOOL.name) return { result: reply(`Unknown tool ${call.name}.`, true), listText: false };
  const checked = validateEffects(call.input);
  if ("error" in checked) return { result: reply(`Nothing applied: ${checked.error}`, true), listText: false };
  if (checked.listText) {
    // The runs as the browser sent them with this question: what the
    // visitor sees now, replacements included.
    const listed = runs.length
      ? runs.map((run, i) => `${i + 1}. ${run}`).join("\n")
      : "(the browser sent no text; the page may not be loaded yet)";
    return { result: reply(`${runs.length} text runs on the page now:\n${listed}`), listText: true };
  }
  const next = mergeEffects(active, checked.effects);
  const summary = { ...next, replace: next.replace ? `${next.replace.length} pairs` : undefined };
  return { result: reply(`Applied. Active now: ${JSON.stringify(summary)}`), effects: checked.effects, listText: false };
}

export async function* askAgent(client: Anthropic, options: AskAgentOptions): AsyncGenerator<AskEvent> {
  let id = options.sessionId;
  let text = options.question;
  let active = options.active;
  if (!id) {
    const session = await client.beta.sessions.create({
      agent: options.agentId,
      environment_id: options.environmentId,
      title: "michaelcohen.io: ask",
      // One dollar per session, in cents: a hard cap the platform enforces.
      budget: { type: "limit", max_list_cost: { amount: "100", currency: "USD" } },
    });
    id = session.id;
    text = firstQuestion(await options.context(), options.question);
    options.onSession?.(id, consoleUrl(id, options.workspace));
  }

  // Stream first, then send: the stream buffers from the moment it opens,
  // so nothing the agent emits after the message lands is missed. Deltas
  // preview the text while the model writes it.
  const stream = await client.beta.sessions.events.stream(id, { event_deltas: ["agent.message"] });
  await client.beta.sessions.events.send(id, {
    events: [{ type: "user.message", content: [{ type: "text", text }] }],
  });

  let answered = false;
  let pending: ToolCall[] = [];
  let reusable = true;
  const timer = setTimeout(() => stream.controller.abort(), options.deadlineMs);
  try {
    for await (const event of stream) {
      if (event.type === "event_delta") {
        if (event.delta.type === "content_delta" && event.delta.content.type === "text") {
          yield { type: "delta", text: event.delta.content.text };
        }
      } else if (event.type === "agent.message") {
        const message = event.content
          .filter((block): block is Anthropic.Beta.Sessions.BetaManagedAgentsTextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n");
        answered = true;
        yield { type: "message", text: message };
      } else if (event.type === "agent.custom_tool_use") {
        pending.push({ id: event.id, name: event.name, input: event.input });
      } else if (event.type === "session.status_terminated") {
        reusable = false;
        break;
      } else if (event.type === "session.status_idle") {
        // Idle is the end of the turn unless the agent is waiting on this
        // client, which means custom tool calls to answer; the session
        // resumes on the same stream once the results are sent. A session
        // that hit its budget or ran out of retries is done: the next
        // question starts a fresh one.
        if (event.stop_reason.type === "requires_action") {
          if (pending.length === 0) break;
          const results: ToolResult[] = [];
          for (const call of pending) {
            const answer = answerToolCall(call, active, options.runs);
            // Text said before a tool call is narration ("I'll grab the
            // page's text first"); the answer is what comes after the last one.
            yield { type: "tool", name: call.name, listText: answer.listText };
            if (answer.effects) {
              active = mergeEffects(active, answer.effects);
              answered = true;
              yield { type: "effects", effects: answer.effects };
            }
            results.push(answer.result);
          }
          pending = [];
          await client.beta.sessions.events.send(id, { events: results });
          continue;
        }
        if (event.stop_reason.type !== "end_turn") reusable = false;
        break;
      } else if (event.type === "session.error") {
        throw new Error(event.error.message);
      }
    }
  } finally {
    clearTimeout(timer);
  }
  if (!answered) throw new Error("The agent did not answer in time.");
  yield { type: "done", sessionId: reusable ? id : null, backend: "agent" };
}

/** One Claude API call over the same context, streamed, until the agent is provisioned. */
export async function* askModel(
  client: Anthropic,
  question: string,
  context: () => Promise<string>,
): AsyncGenerator<AskEvent> {
  const stream = client.messages.stream({
    model: ASK_MODEL,
    max_tokens: 600,
    output_config: { effort: "low" },
    system: [
      { type: "text", text: ASK_SYSTEM },
      { type: "text", text: `<context>\n${await context()}\n</context>`, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: question }],
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield { type: "delta", text: event.delta.text };
    }
  }
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal") throw new Error("The model declined to answer that.");
  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  yield { type: "message", text };
  yield { type: "done", sessionId: null, backend: "messages" };
}
