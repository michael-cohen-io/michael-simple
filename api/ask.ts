// POST /api/ask: the "Ask Claude About Me" box (src/components/ask/ask.tsx).
// A Vercel Function, the one piece of server code on the site. It answers
// from the page's Markdown twin, through a Claude Managed Agent when one is
// provisioned (ASK_AGENT_ID and ASK_ENVIRONMENT_ID; see scripts/ask-setup.ts)
// and otherwise through a single Claude API call over the same text.
//
// The answer streams: the response is `text/event-stream`, one server-sent
// event per step (src/lib/ask-stream.ts lists them): `delta` as the model
// writes, `message` for each finished message, `tool` and `effects` as the
// agent restyles the page (Party Mode), `done` with the session to continue
// on, or `error` with an RFC 9457 problem document. Anything wrong with the
// request itself (body, limits, configuration) is a problem document with
// its own status, before any stream starts, like the middleware's 404.
//
// Limits: questions are capped at 300 characters; each function instance
// allows 5 questions a minute per address and 400 a day in total, and a
// Managed Agents session carries a hard spend cap. These are in-memory,
// so they hold per instance, not globally; a Vercel Firewall rate-limit
// rule on /api/ask is the durable version.

import { readFile } from "node:fs/promises";
import path from "node:path";

import Anthropic from "@anthropic-ai/sdk";

import { ASK_PROBLEMS, type AskProblemCode } from "../src/lib/ask-api.js";
import { askAgent, askModel, type AskEvent } from "../src/lib/ask-stream.js";
import { MAX_QUESTION_LENGTH } from "../src/lib/ask.js";
import { validateEffects, validateRuns } from "../src/lib/party.js";
import { SITE_URL } from "../src/lib/site.js";

const PER_MINUTE = 5;
const PER_DAY = 400;
// Under the function's 120 s (vercel.json): a full-page rewrite is a long tool call.
const DEADLINE_MS = 110_000;

const recent = new Map<string, number[]>();
let answeredToday = 0;
let day = new Date().toISOString().slice(0, 10);

type ProblemBody = { type: "about:blank"; title: string; status: number; detail: string; code: AskProblemCode };

// Status and title come from the contract (src/lib/ask-api.ts), which is
// also what openapi.json documents; only the detail is written here.
function problemBody(code: AskProblemCode, detail: string): ProblemBody {
  const { status, title } = ASK_PROBLEMS[code];
  return { type: "about:blank", title, status, detail, code };
}

function problem(code: AskProblemCode, detail: string): Response {
  const body = problemBody(code, detail);
  return new Response(JSON.stringify(body), {
    status: body.status,
    headers: { "content-type": "application/problem+json", "cache-control": "no-store" },
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

/** The problem document for a failure after the stream has started. */
function upstreamProblem(error: unknown): ProblemBody {
  if (error instanceof Anthropic.RateLimitError) {
    return problemBody("upstream_rate_limited", "The agent is busy; try again in a moment.");
  }
  const detail = error instanceof Error ? error.message : "Unknown error";
  console.error(JSON.stringify({ event: "ask_failed", detail }));
  return problemBody("upstream_failed", "The agent could not answer; try again.");
}

/** The events as a server-sent-events body: `event: <type>` then the JSON. */
function sse(events: AsyncGenerator<AskEvent>): Response {
  const encoder = new TextEncoder();
  const frame = (type: string, data: unknown) => encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await events.next();
        if (done) return controller.close();
        controller.enqueue(frame(value.type, value));
        if (value.type === "done") controller.close();
      } catch (error) {
        controller.enqueue(frame("error", upstreamProblem(error)));
        controller.close();
      }
    },
    cancel() {
      // The browser went away: stop the turn's stream rather than run it out.
      void events.return(undefined);
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  let body: { question?: unknown; sessionId?: unknown; party?: unknown; runs?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return problem("invalid_body", "Send a JSON body with a `question` string.");
  }
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) return problem("missing_question", "`question` must be a non-empty string.");
  if (question.length > MAX_QUESTION_LENGTH) {
    return problem("question_too_long", `Keep the question under ${MAX_QUESTION_LENGTH} characters.`);
  }
  const sessionId =
    typeof body.sessionId === "string" && /^sesn_[A-Za-z0-9_-]+$/.test(body.sessionId) ? body.sessionId : null;
  // What Party Mode has active in this browser, so the agent's tool result
  // reports the true state (the visitor may have switched it off locally).
  const checkedParty = body.party === undefined ? { effects: {} } : validateEffects(body.party);
  if ("error" in checkedParty) return problem("invalid_party", `party: ${checkedParty.error}`);
  const party = checkedParty.effects;
  // The page's visible text runs, for the tool's list_text step.
  const checkedRuns = validateRuns(body.runs);
  if ("error" in checkedRuns) return problem("invalid_runs", checkedRuns.error);
  const runs = checkedRuns.runs;

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(address)) {
    return problem("rate_limited", "Slow down a little: 5 questions a minute. Try again shortly.");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return problem("not_configured", "Asking is not set up on this deployment yet.");
  }
  const client = new Anthropic({ timeout: DEADLINE_MS, maxRetries: 1 });
  const agentId = process.env.ASK_AGENT_ID;
  const environmentId = process.env.ASK_ENVIRONMENT_ID;
  if (!agentId || !environmentId) return sse(askModel(client, question, context));

  const turn = (id: string | null) =>
    askAgent(client, {
      question,
      sessionId: id,
      active: party,
      runs,
      context,
      agentId,
      environmentId,
      deadlineMs: DEADLINE_MS,
      workspace: process.env.ASK_WORKSPACE,
      onSession: (created, url) => console.log(JSON.stringify({ event: "ask_session", sessionId: created, console: url })),
    });

  // A remembered session that is gone (deleted, archived) or that no longer
  // takes messages (paused at its budget) fails before its first event; the
  // turn then starts over on a fresh session.
  async function* resilient(): AsyncGenerator<AskEvent> {
    const first = turn(sessionId);
    let started = false;
    try {
      for await (const event of first) {
        started = true;
        yield event;
      }
    } catch (error) {
      const stale = error instanceof Anthropic.NotFoundError || error instanceof Anthropic.BadRequestError;
      if (!sessionId || started || !stale) throw error;
      yield* turn(null);
    }
  }
  return sse(resilient());
}

export function GET(): Response {
  return problem("method_not_allowed", "POST a JSON body with a `question`.");
}
