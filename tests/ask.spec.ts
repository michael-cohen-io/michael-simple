import { expect, test } from "@playwright/test";

import { GET, POST } from "../api/ask";
import { PARTY_TOOL, mergeEffects, validateEffects, validateRuns } from "../src/lib/party";

// The function is exercised without a network: everything before the
// Claude call (body validation, the rate limit, the not-configured case).

const post = (body: unknown, address = "203.0.113.7") =>
  POST(
    new Request("https://www.michaelcohen.io/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": address },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

test("rejects bad bodies with a problem document", async () => {
  for (const [body, code] of [
    ["not json", "invalid_body"],
    [{}, "missing_question"],
    [{ question: "   " }, "missing_question"],
    [{ question: "x".repeat(301) }, "question_too_long"],
  ] as const) {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(((await response.json()) as { code: string }).code).toBe(code);
  }
  expect(GET().status).toBe(405);
});

test("says so when no key is configured, and rate-limits an address", async () => {
  const key = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const first = await post({ question: "What did he build?" }, "198.51.100.1");
    expect(first.status).toBe(503);
    expect(((await first.json()) as { code: string }).code).toBe("not_configured");

    let last: Response | undefined;
    for (let i = 0; i < 6; i += 1) last = await post({ question: "again?" }, "198.51.100.2");
    expect(last!.status).toBe(429);
    expect(((await last!.json()) as { code: string }).code).toBe("rate_limited");
  } finally {
    if (key) process.env.ANTHROPIC_API_KEY = key;
  }
});

// Party Mode's catalog: the tool input the agent sends is validated before
// anything reaches the browser, and a bad call applies nothing.
test("validates restyle_page input against the catalog and merges turns", () => {
  const good = validateEffects({
    scheme: "party",
    hue: 199.6,
    confetti: true,
    motion: { headings: "dance" },
    text: "lowercase",
    font: "comic",
    replace: [{ from: "Work Experience", to: "Expérience" }],
    banner: "  Party  ",
  });
  expect(good).toEqual({
    listText: false,
    effects: {
      scheme: "party",
      hue: 200,
      confetti: true,
      motion: { headings: "dance" },
      text: "lowercase",
      font: "comic",
      replace: [{ from: "Work Experience", to: "Expérience" }],
      banner: "Party",
    },
  });
  for (const bad of [
    "party",
    { scheme: "neon" },
    { hue: 400 },
    { motion: { body: "dance" } },
    { motion: { headings: "explode" } },
    { replace: [{ from: "", to: "x" }] },
    { replace: [{ from: "a", to: "b".repeat(1001) }] },
    { banner: "x".repeat(121) },
    { css: "body { display: none }" },
  ]) {
    expect(validateEffects(bad)).toHaveProperty("error");
  }
  expect(PARTY_TOOL.input_schema.properties.scheme.enum).toContain("party");
  expect(validateEffects({ list_text: true })).toEqual({ effects: {}, listText: true });
  expect(validateRuns(undefined)).toEqual({ runs: [] });
  expect(validateRuns([" Work Experience ", "Work Experience", "", "x"])).toEqual({ runs: ["Work Experience", "x"] });
  expect(validateRuns([1])).toHaveProperty("error");
  expect(validateRuns(["y".repeat(1001)])).toHaveProperty("error");

  const first = { scheme: "party" as const, hue: 200, motion: { headings: "dance" as const }, banner: "Hi" };
  const second = { motion: { links: "spin" as const }, banner: "", replace: [{ from: "a", to: "b" }] };
  expect(mergeEffects(mergeEffects({}, first), second)).toEqual({
    scheme: "party",
    hue: 200,
    motion: { headings: "dance", links: "spin" },
    replace: [{ from: "a", to: "b" }],
  });
  expect(mergeEffects({ scheme: "party", hue: 200 }, { reset: true, font: "mono" })).toEqual({ font: "mono" });
});

// The tool round, against a fake session stream. `askAgent` is the loop
// that answers the agent's custom tool calls (Party Mode) and decides when
// a turn is over and whether the session can be reused; it is exercised
// here with the events the platform would send, in the order it sends them.

import type Anthropic from "@anthropic-ai/sdk";
import { askAgent, answerToolCall, type AskEvent } from "../src/lib/ask-stream";

type Sent = { events: unknown[] };

/**
 * A client whose stream is a script: `turns` is a list of event batches; the
 * first batch plays after the question is sent, each following batch after
 * the next `events.send` (a tool result). Records everything sent.
 */
function fakeClient(turns: unknown[][], options: { sessionId?: string; createFails?: boolean } = {}) {
  const sent: Sent[] = [];
  let turn = 0;
  let waiting: (() => void) | null = null;
  const stream = {
    controller: { abort: () => {} },
    async *[Symbol.asyncIterator]() {
      for (;;) {
        const batch = turns[turn];
        if (!batch) return;
        for (const event of batch) yield event;
        turn += 1;
        if (turn >= turns.length) return;
        // The session resumes once the tool results for this turn are sent:
        // the question is one send, each turn's results one more.
        while (sent.length < turn + 1) await new Promise<void>((resolve) => (waiting = resolve));
      }
    },
  };
  const client = {
    beta: {
      sessions: {
        create: async () => {
          if (options.createFails) throw new Error("create failed");
          return { id: options.sessionId ?? "sesn_new" };
        },
        events: {
          stream: async () => stream,
          send: async (_id: string, body: Sent) => {
            sent.push(body);
            waiting?.();
            return {};
          },
        },
      },
    },
  };
  return { client: client as unknown as Anthropic, sent };
}

const idle = (stop: string) => ({ type: "session.status_idle", stop_reason: { type: stop } });
const message = (text: string) => ({ type: "agent.message", content: [{ type: "text", text }] });
const delta = (text: string) => ({ type: "event_delta", event_id: "sevt_1", delta: { type: "content_delta", content: { type: "text", text } } });
const toolUse = (id: string, input: unknown) => ({ type: "agent.custom_tool_use", id, name: "restyle_page", input });

async function run(client: Anthropic, sessionId: string | null = null, active = {}, runs: string[] = []) {
  const events: AskEvent[] = [];
  const created: string[] = [];
  const generator = askAgent(client, {
    question: "Hello?",
    sessionId,
    active,
    runs,
    context: async () => "# Page",
    agentId: "agent_x",
    environmentId: "env_x",
    deadlineMs: 5_000,
    onSession: (id) => created.push(id),
  });
  for await (const event of generator) events.push(event);
  return { events, created };
}

test("streams a plain answer and hands the session back", async () => {
  const { client, sent } = fakeClient([[delta("Mich"), delta("ael."), message("Michael."), idle("end_turn")]]);
  const { events, created } = await run(client);
  expect(created).toEqual(["sesn_new"]);
  expect(events).toEqual([
    { type: "delta", text: "Mich" },
    { type: "delta", text: "ael." },
    { type: "message", text: "Michael." },
    { type: "done", sessionId: "sesn_new", backend: "agent" },
  ]);
  // The first question of a session carries the page as context.
  const first = sent[0].events[0] as { content: { text: string }[] };
  expect(first.content[0].text).toContain("<context>");
  expect(first.content[0].text).toContain("Question: Hello?");
});

test("answers a tool call, drops the narration before it, and applies its effects", async () => {
  const { client, sent } = fakeClient([
    [message("I'll restyle the page."), toolUse("sevt_a", { scheme: "party", hue: 200 }), idle("requires_action")],
    [message("Party on."), idle("end_turn")],
  ]);
  const { events } = await run(client, "sesn_existing", { text: "lowercase" });
  expect(events).toEqual([
    { type: "message", text: "I'll restyle the page." },
    { type: "tool", name: "restyle_page", listText: false },
    { type: "effects", effects: { scheme: "party", hue: 200 } },
    { type: "message", text: "Party on." },
    { type: "done", sessionId: "sesn_existing", backend: "agent" },
  ]);
  // A follow-up sends the bare question, and the tool result reports what is active.
  expect((sent[0].events[0] as { content: { text: string }[] }).content[0].text).toBe("Hello?");
  const result = sent[1].events[0] as { type: string; custom_tool_use_id: string; is_error?: boolean; content: { text: string }[] };
  expect(result.type).toBe("user.custom_tool_result");
  expect(result.custom_tool_use_id).toBe("sevt_a");
  expect(result.is_error).toBeUndefined();
  expect(result.content[0].text).toContain('"text":"lowercase"');
  expect(result.content[0].text).toContain('"hue":200');
});

test("refuses a bad tool call without applying anything, and lists the page's text on request", async () => {
  const { client, sent } = fakeClient([
    [toolUse("sevt_bad", { scheme: "neon" }), toolUse("sevt_list", { list_text: true }), idle("requires_action")],
    [message("Sorry, done."), idle("end_turn")],
  ]);
  const { events } = await run(client, "sesn_existing", {}, ["Work Experience", "Connect"]);
  expect(events.filter((e) => e.type === "effects")).toEqual([]);
  expect(events.filter((e) => e.type === "tool")).toEqual([
    { type: "tool", name: "restyle_page", listText: false },
    { type: "tool", name: "restyle_page", listText: true },
  ]);
  const [bad, list] = sent[1].events as { custom_tool_use_id: string; is_error?: boolean; content: { text: string }[] }[];
  expect(bad.is_error).toBe(true);
  expect(bad.content[0].text).toContain("Nothing applied");
  expect(list.is_error).toBeUndefined();
  expect(list.content[0].text).toContain("2 text runs");
  expect(list.content[0].text).toContain("1. Work Experience");
});

test("does not hand back a session that stopped for its budget or was terminated", async () => {
  const budget = fakeClient([[message("Half an answer."), idle("budget_reached")]]);
  expect((await run(budget.client, "sesn_b")).events.at(-1)).toEqual({ type: "done", sessionId: null, backend: "agent" });
  const terminated = fakeClient([[message("Bye."), { type: "session.status_terminated" }]]);
  expect((await run(terminated.client, "sesn_t")).events.at(-1)).toEqual({ type: "done", sessionId: null, backend: "agent" });
});

test("fails the turn on a session error or an empty turn", async () => {
  const errored = fakeClient([[{ type: "session.error", error: { message: "The API is currently rate limited." } }]]);
  await expect(run(errored.client, "sesn_e")).rejects.toThrow("rate limited");
  const empty = fakeClient([[idle("end_turn")]]);
  await expect(run(empty.client, "sesn_e")).rejects.toThrow("did not answer");
});

test("answerToolCall covers the three replies", () => {
  const unknown = answerToolCall({ id: "1", name: "other", input: {} }, {}, []);
  expect(unknown.result.is_error).toBe(true);
  const applied = answerToolCall({ id: "2", name: "restyle_page", input: { font: "mono" } }, { hue: 1 }, []);
  expect(applied.effects).toEqual({ font: "mono" });
  expect(applied.result.content?.[0]).toEqual({ type: "text", text: 'Applied. Active now: {"hue":1,"font":"mono"}' });
  const listed = answerToolCall({ id: "3", name: "restyle_page", input: { list_text: true } }, {}, []);
  expect(listed.listText).toBe(true);
  expect(listed.result.content?.[0]).toEqual({ type: "text", text: "0 text runs on the page now:\n(the browser sent no text; the page may not be loaded yet)" });
});
