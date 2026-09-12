// POST /api/ask: the "Ask about my work" box (src/components/ask/ask.tsx).
// A Vercel Function, the one piece of server code on the site. It answers
// from the page's Markdown twin, through a Claude Managed Agent when one is
// provisioned (ASK_AGENT_ID and ASK_ENVIRONMENT_ID; see scripts/ask-setup.ts)
// and otherwise through a single Claude API call over the same text. Every
// error is an RFC 9457 problem document, like the middleware's 404.
//
// The agent turn follows the Managed Agents client patterns: one session per
// visitor thread (its id, `sesn_…`, goes back to the browser and returns with
// the next question), the event stream opened before the message is sent, and
// the turn read as finished on `session.status_idle` only when its stop reason
// asks nothing of the client, or on `session.status_terminated`. When it asks
// something (`requires_action`), it is the agent's one custom tool,
// `restyle_page` (Party Mode, src/lib/party.ts): the input is validated here,
// the agent gets a `user.custom_tool_result` saying what is active, and the
// effects ride back to the browser with the answer, which applies them.
//
// Limits: questions are capped at 300 characters; each function instance
// allows 5 questions a minute per address and 400 a day in total, and a
// Managed Agents session carries a hard spend cap. These are in-memory,
// so they hold per instance, not globally; a Vercel Firewall rate-limit
// rule on /api/ask is the durable version.

import { readFile } from "node:fs/promises";
import path from "node:path";

import Anthropic from "@anthropic-ai/sdk";

import { ASK_MODEL, ASK_SYSTEM, MAX_QUESTION_LENGTH, firstQuestion } from "../src/lib/ask.js";
import { PARTY_TOOL, mergeEffects, validateEffects, validateRuns, type Effects } from "../src/lib/party.js";
import { SITE_URL } from "../src/lib/site.js";

const PER_MINUTE = 5;
const PER_DAY = 400;
// Under the function's 120 s (vercel.json): a full-page rewrite is a long tool call.
const DEADLINE_MS = 110_000;

const recent = new Map<string, number[]>();
let answeredToday = 0;
let day = new Date().toISOString().slice(0, 10);

function problem(status: number, title: string, detail: string, code: string): Response {
  return new Response(JSON.stringify({ type: "about:blank", title, status, detail, code }), {
    status,
    headers: { "content-type": "application/problem+json", "cache-control": "no-store" },
  });
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

/** True if this address may ask now; records the ask if so. */
function allow(address: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    answeredToday = 0;
  }
  if (answeredToday >= PER_DAY) return false;
  const now = Date.now();
  const stamps = (recent.get(address) ?? []).filter((t) => now - t < 60_000);
  if (stamps.length >= PER_MINUTE) return false;
  stamps.push(now);
  recent.set(address, stamps);
  answeredToday += 1;
  return true;
}

/** The page as Markdown: bundled with the function, or fetched from the site. */
async function context(): Promise<string> {
  try {
    return await readFile(path.join(process.cwd(), "public", "index.md"), "utf8");
  } catch {
    const response = await fetch(`${SITE_URL}/index.md`, { headers: { accept: "text/markdown" } });
    if (!response.ok) throw new Error(`index.md: ${response.status}`);
    return response.text();
  }
}

/** The session's trace in the Console; `default` assumes the key's workspace. */
function consoleUrl(sessionId: string): string {
  return `https://platform.claude.com/workspaces/${process.env.ASK_WORKSPACE ?? "default"}/sessions/${sessionId}`;
}

/** One turn of a Managed Agents session; a new session when none is given. */
async function askAgent(
  client: Anthropic,
  question: string,
  sessionId: string | null,
  active: Effects,
  runs: string[],
): Promise<{ answer: string; sessionId: string | null; effects: Effects[] }> {
  const agentId = process.env.ASK_AGENT_ID!;
  const environmentId = process.env.ASK_ENVIRONMENT_ID!;
  let id = sessionId;
  let text = question;
  if (!id) {
    const session = await client.beta.sessions.create({
      agent: agentId,
      environment_id: environmentId,
      title: "michaelcohen.io: ask",
      // One dollar per session, in cents: a hard cap the platform enforces.
      budget: { type: "limit", max_list_cost: { amount: "100", currency: "USD" } },
    });
    id = session.id;
    text = firstQuestion(await context(), question);
    console.log(JSON.stringify({ event: "ask_session", sessionId: id, console: consoleUrl(id) }));
  }

  // Stream first, then send: the stream buffers from the moment it opens,
  // so nothing the agent emits after the message lands is missed.
  const stream = await client.beta.sessions.events.stream(id);
  await client.beta.sessions.events.send(id, {
    events: [{ type: "user.message", content: [{ type: "text", text }] }],
  });

  const parts: string[] = [];
  const effects: Effects[] = [];
  let pending: { id: string; name: string; input: unknown }[] = [];
  let reusable = true;
  const timer = setTimeout(() => stream.controller.abort(), DEADLINE_MS);
  try {
    for await (const event of stream) {
      if (event.type === "agent.message") {
        for (const block of event.content) if (block.type === "text") parts.push(block.text);
      } else if (event.type === "agent.custom_tool_use") {
        // Text said before a tool call is narration ("I'll grab the page's
        // text first"); the answer is what the agent says after the last one.
        parts.length = 0;
        pending.push({ id: event.id, name: event.name, input: event.input });
      } else if (event.type === "session.status_terminated") {
        reusable = false;
        break;
      } else if (event.type === "session.status_idle") {
        // Idle is the end of the turn unless the agent is waiting on this
        // client, which means a custom tool call to answer; the session
        // resumes on the same stream once the results are sent. A session
        // that hit its budget or ran out of retries is done: the next
        // question starts a fresh one.
        if (event.stop_reason.type === "requires_action") {
          if (pending.length === 0) break;
          const results = pending.map((call) => {
            if (call.name !== PARTY_TOOL.name) {
              return { type: "user.custom_tool_result" as const, custom_tool_use_id: call.id, is_error: true,
                content: [{ type: "text" as const, text: `Unknown tool ${call.name}.` }] };
            }
            const checked = validateEffects(call.input);
            if ("error" in checked) {
              return { type: "user.custom_tool_result" as const, custom_tool_use_id: call.id, is_error: true,
                content: [{ type: "text" as const, text: `Nothing applied: ${checked.error}` }] };
            }
            if (checked.listText) {
              // The runs as the browser sent them with this question: what the
              // visitor sees now, replacements included.
              const listed = runs.length
                ? runs.map((run, i) => `${i + 1}. ${run}`).join("\n")
                : "(the browser sent no text; the page may not be loaded yet)";
              return { type: "user.custom_tool_result" as const, custom_tool_use_id: call.id,
                content: [{ type: "text" as const, text: `${runs.length} text runs on the page now:\n${listed}` }] };
            }
            effects.push(checked.effects);
            active = mergeEffects(active, checked.effects);
            const summary = { ...active, replace: active.replace ? `${active.replace.length} pairs` : undefined };
            return { type: "user.custom_tool_result" as const, custom_tool_use_id: call.id,
              content: [{ type: "text" as const, text: `Applied. Active now: ${JSON.stringify(summary)}` }] };
          });
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
  if (parts.length === 0 && effects.length === 0) throw new Error("The agent did not answer in time.");
  // Effects that landed before the deadline are worth showing even if the
  // closing sentence did not arrive.
  const answer = parts.join("\n").trim() || "Done.";
  return { answer, sessionId: reusable ? id : null, effects };
}

/** One Claude API call over the same context, until the agent is provisioned. */
async function askModel(client: Anthropic, question: string): Promise<string> {
  const response = await client.messages.create({
    model: ASK_MODEL,
    max_tokens: 600,
    output_config: { effort: "low" },
    system: [
      { type: "text", text: ASK_SYSTEM },
      { type: "text", text: `<context>\n${await context()}\n</context>`, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: question }],
  });
  if (response.stop_reason === "refusal") throw new Error("The model declined to answer that.");
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export async function POST(request: Request): Promise<Response> {
  let body: { question?: unknown; sessionId?: unknown; party?: unknown; runs?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return problem(400, "Bad Request", "Send a JSON body with a `question` string.", "invalid_body");
  }
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) return problem(400, "Bad Request", "`question` must be a non-empty string.", "missing_question");
  if (question.length > MAX_QUESTION_LENGTH) {
    return problem(400, "Bad Request", `Keep the question under ${MAX_QUESTION_LENGTH} characters.`, "question_too_long");
  }
  const sessionId =
    typeof body.sessionId === "string" && /^sesn_[A-Za-z0-9_-]+$/.test(body.sessionId) ? body.sessionId : null;
  // What Party Mode has active in this browser, so the agent's tool result
  // reports the true state (the visitor may have switched it off locally).
  const checkedParty = body.party === undefined ? { effects: {} } : validateEffects(body.party);
  if ("error" in checkedParty) return problem(400, "Bad Request", `party: ${checkedParty.error}`, "invalid_party");
  const party = checkedParty.effects;
  // The page's visible text runs, for the tool's list_text step.
  const checkedRuns = validateRuns(body.runs);
  if ("error" in checkedRuns) return problem(400, "Bad Request", checkedRuns.error, "invalid_runs");
  const runs = checkedRuns.runs;

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(address)) {
    return problem(429, "Too Many Requests", "Slow down a little: 5 questions a minute. Try again shortly.", "rate_limited");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return problem(503, "Not Configured", "Asking is not set up on this deployment yet.", "not_configured");
  }
  const client = new Anthropic({ timeout: DEADLINE_MS, maxRetries: 1 });
  const useAgent = Boolean(process.env.ASK_AGENT_ID && process.env.ASK_ENVIRONMENT_ID);

  try {
    if (useAgent) {
      let result: Awaited<ReturnType<typeof askAgent>>;
      try {
        result = await askAgent(client, question, sessionId, party, runs);
      } catch (error) {
        // A remembered session that is gone (deleted, archived) or that no
        // longer takes messages (paused at its budget): start over.
        const stale = error instanceof Anthropic.NotFoundError || error instanceof Anthropic.BadRequestError;
        if (!sessionId || !stale) throw error;
        result = await askAgent(client, question, null, party, runs);
      }
      return json({ ...result, backend: "agent" });
    }
    return json({ answer: await askModel(client, question), sessionId: null, effects: [], backend: "messages" });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return problem(503, "Busy", "The agent is busy; try again in a moment.", "upstream_rate_limited");
    }
    const detail = error instanceof Error ? error.message : "Unknown error";
    console.error(JSON.stringify({ event: "ask_failed", detail }));
    return problem(502, "No Answer", "The agent could not answer; try again.", "upstream_failed");
  }
}

export function GET(): Response {
  return problem(405, "Method Not Allowed", "POST a JSON body with a `question`.", "method_not_allowed");
}
