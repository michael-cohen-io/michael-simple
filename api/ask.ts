// POST /api/ask: the "Ask about my work" box (src/components/ask/ask.tsx).
// A Vercel Function, the one piece of server code on the site. It answers
// from the page's Markdown twin, through a Claude Managed Agent when one is
// provisioned (ASK_AGENT_ID and ASK_ENVIRONMENT_ID; see scripts/ask-setup.ts)
// and otherwise through a single Claude API call over the same text. Every
// error is an RFC 9457 problem document, like the middleware's 404.
//
// Limits: questions are capped at 300 characters; each function instance
// allows 5 questions a minute per address and 400 a day in total, and a
// Managed Agents session carries a hard spend cap. These are in-memory,
// so they hold per instance, not globally; a Vercel Firewall rate-limit
// rule on /api/ask is the durable version.

import { readFile } from "node:fs/promises";
import path from "node:path";

import Anthropic from "@anthropic-ai/sdk";

import { ASK_MODEL, ASK_SYSTEM, MAX_QUESTION_LENGTH, firstQuestion } from "../src/lib/ask";
import { SITE_URL } from "../src/lib/site";

const PER_MINUTE = 5;
const PER_DAY = 400;
const DEADLINE_MS = 50_000;

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

/** One turn of a Managed Agents session; a new session when none is given. */
async function askAgent(
  client: Anthropic,
  question: string,
  sessionId: string | null,
): Promise<{ answer: string; sessionId: string }> {
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
  }

  // Stream first, then send: the stream only carries events after it opens.
  const stream = await client.beta.sessions.events.stream(id);
  await client.beta.sessions.events.send(id, {
    events: [{ type: "user.message", content: [{ type: "text", text }] }],
  });

  const parts: string[] = [];
  const timer = setTimeout(() => stream.controller.abort(), DEADLINE_MS);
  try {
    for await (const event of stream) {
      if (event.type === "agent.message") {
        for (const block of event.content) if (block.type === "text") parts.push(block.text);
      } else if (event.type === "session.status_idle" || event.type === "session.status_terminated") {
        break;
      } else if (event.type === "session.error") {
        throw new Error(event.error.message);
      }
    }
  } finally {
    clearTimeout(timer);
  }
  if (parts.length === 0) throw new Error("The agent did not answer in time.");
  return { answer: parts.join("\n").trim(), sessionId: id };
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
  let body: { question?: unknown; sessionId?: unknown };
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
    typeof body.sessionId === "string" && /^sess_[A-Za-z0-9_-]+$/.test(body.sessionId) ? body.sessionId : null;

  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(address)) {
    return problem(429, "Too Many Requests", "Slow down a little: five questions a minute.", "rate_limited");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return problem(503, "Not Configured", "Asking is not set up on this deployment yet.", "not_configured");
  }
  const client = new Anthropic({ timeout: DEADLINE_MS, maxRetries: 1 });
  const useAgent = Boolean(process.env.ASK_AGENT_ID && process.env.ASK_ENVIRONMENT_ID);

  try {
    if (useAgent) {
      const result = await askAgent(client, question, sessionId);
      return json({ ...result, backend: "agent" });
    }
    return json({ answer: await askModel(client, question), sessionId: null, backend: "messages" });
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
