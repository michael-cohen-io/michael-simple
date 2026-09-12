import { MAX_QUESTION_LENGTH } from "./ask";
import { MAX_RUNS, MAX_RUN_LENGTH, PARTY_TOOL } from "./party";

/**
 * The contract of POST /api/ask, in one place, so the function (api/ask.ts)
 * and the site's API description (scripts/build-llms.tsx, which writes
 * public/openapi.json and public/llms.txt) cannot drift: the function
 * answers only with the problem codes listed here (its `problem()` takes an
 * `AskProblemCode`), and the generator documents exactly these codes,
 * request fields and event types. scripts/check-paths.ts fails the build if
 * a function path is missing from openapi.json or a documented path does
 * not exist.
 */

export const ASK_PATH = "/api/ask";

/** Every problem document the function can answer with, by its stable `code`. */
export const ASK_PROBLEMS = {
  invalid_body: { status: 400, title: "Bad Request", when: "The body is not JSON, or has no `question` string." },
  missing_question: { status: 400, title: "Bad Request", when: "`question` is empty." },
  question_too_long: { status: 400, title: "Bad Request", when: `\`question\` is over ${MAX_QUESTION_LENGTH} characters.` },
  invalid_party: { status: 400, title: "Bad Request", when: "`party` is not a valid set of Party Mode effects." },
  invalid_runs: { status: 400, title: "Bad Request", when: "`runs` is not an array of strings within the limits." },
  method_not_allowed: { status: 405, title: "Method Not Allowed", when: "The method is not POST." },
  rate_limited: { status: 429, title: "Too Many Requests", when: "More than 5 questions a minute from one address, or the day's allowance is spent." },
  not_configured: { status: 503, title: "Not Configured", when: "The deployment has no API key." },
  upstream_rate_limited: { status: 503, title: "Busy", when: "The model or agent platform is rate limited; sent as an `error` event." },
  upstream_failed: { status: 502, title: "No Answer", when: "The agent did not answer; sent as an `error` event." },
} as const;

export type AskProblemCode = keyof typeof ASK_PROBLEMS;

/** The server-sent events of a streamed answer, in the order they can appear. */
export const ASK_EVENTS = {
  delta: "A piece of the answer as the model writes it: `{ text }`. A preview; the next `message` is the authoritative text and replaces it.",
  message: "The complete text of one agent message: `{ text }`.",
  tool: "The agent called its page tool (Party Mode): `{ name, listText }`. Text said before it was narration; the answer follows.",
  effects: "One validated Party Mode change, `{ effects }`, in the shape of the `party` request field; apply it at once.",
  done: "The turn is over: `{ sessionId, backend }`. Send `sessionId` back with the next question to keep the thread; `null` means start fresh. `backend` is `agent` (Claude Managed Agents) or `messages` (a single Claude API call).",
  error: "The turn failed after the stream started: a problem document with one of the `upstream_*` codes.",
} as const;

/** Party Mode's effects, as the browser reports them and the `effects` event carries them. */
const effectsSchema = (() => {
  const { list_text: _listText, ...properties } = PARTY_TOOL.input_schema.properties;
  void _listText;
  return { type: "object", description: "Party Mode effects (src/lib/party.ts): every field optional.", properties, additionalProperties: false };
})();

/** The JSON body of a question. */
export const ASK_REQUEST_SCHEMA = {
  type: "object",
  required: ["question"],
  properties: {
    question: { type: "string", minLength: 1, maxLength: MAX_QUESTION_LENGTH, description: "The question, in plain text." },
    sessionId: {
      type: ["string", "null"],
      pattern: "^sesn_[A-Za-z0-9_-]+$",
      description: "The `sessionId` from the last `done` event, to continue the thread; omit or null for a new one.",
    },
    party: { ...effectsSchema, description: "What Party Mode has active in this browser, so the agent composes on it. Optional." },
    runs: {
      type: "array",
      maxItems: MAX_RUNS,
      items: { type: "string", maxLength: MAX_RUN_LENGTH },
      description: "The page's visible text runs, for the agent's `list_text` step (how it translates or rewrites the page). Optional; a plain question needs none.",
    },
  },
  additionalProperties: false,
} as const;

/** The problem document the function sends, before the stream or as an `error` event. */
export const ASK_PROBLEM_SCHEMA = {
  type: "object",
  description: "RFC 9457 problem details with a stable `code`.",
  required: ["type", "title", "status", "detail", "code"],
  properties: {
    type: { type: "string", enum: ["about:blank"] },
    title: { type: "string" },
    status: { type: "integer" },
    detail: { type: "string", description: "What went wrong and what to do next." },
    code: { type: "string", enum: Object.keys(ASK_PROBLEMS) },
  },
} as const;

export { effectsSchema as ASK_EFFECTS_SCHEMA };
