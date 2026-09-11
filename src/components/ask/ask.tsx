"use client";

import { useId, useRef, useState } from "react";

import { PartyLayer, usePartyMode } from "@/components/party/party";
import { isActive, mergeEffects, type Effects } from "@/lib/party";

type Answer = { answer: string; sessionId: string | null; backend: "agent" | "messages"; effects?: Effects[] };
type Problem = { title?: string; detail?: string; code?: string };

type State =
  | { kind: "idle" }
  | { kind: "asking"; question: string }
  | { kind: "answered"; question: string; answer: Answer }
  | { kind: "failed"; question: string; message: string };

const EXAMPLES = [
  "What did you build at Anthropic?",
  "What is the brain / hands split?",
  "Activate Party Mode",
];

/** Once the page is in Party Mode, the suggestions turn into edits. */
const PARTY_EXAMPLES = [
  "Make everything dance",
  "Translate the page to French",
  "Lowercase all the letters",
  "Comic Sans, obviously",
];

/**
 * "Ask about my work": a question box under the hero. The answer comes from
 * /api/ask, a Vercel Function that runs a Claude Managed Agent grounded on
 * this page's own Markdown twin (or, until the agent is provisioned, a
 * single Claude API call over the same text). Follow-up questions reuse
 * the agent's session so it keeps the thread. On a host without the
 * function (a local static build), the box says so.
 *
 * The agent's one tool restyles this page (Party Mode, src/lib/party.ts):
 * the effects come back with the answer, merge into `party`, and
 * usePartyMode applies them; each question carries the active state so
 * the agent knows what it is composing on, and "Turn it off" clears it here.
 */
export default function Ask() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [party, setParty] = useState<Effects>({});
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  usePartyMode(party);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || state.kind === "asking") return;
    setState({ kind: "asking", question: trimmed });
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ question: trimmed, sessionId, party }),
      });
      const type = response.headers.get("content-type") ?? "";
      if (!type.includes("json")) {
        throw new Error(
          response.status === 404
            ? "Asking is not available on this host; it runs on michaelcohen.io."
            : `The answer did not come back (${response.status}).`,
        );
      }
      const body = (await response.json()) as Answer & Problem;
      if (!response.ok) throw new Error(body.detail ?? body.title ?? `Request failed (${response.status}).`);
      setSessionId(body.sessionId);
      if (body.effects?.length) setParty(body.effects.reduce(mergeEffects, party));
      setState({ kind: "answered", question: trimmed, answer: body });
    } catch (error) {
      setState({ kind: "failed", question: trimmed, message: error instanceof Error ? error.message : String(error) });
    }
  };

  return (
    <section aria-labelledby={`${id}-heading`} className="flex w-full flex-col gap-3" data-party-static>
      <PartyLayer effects={party} />
      <h2 id={`${id}-heading`} className="text-base font-semibold">
        Ask about my work
      </h2>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(input.current?.value ?? "");
        }}
      >
        <label htmlFor={`${id}-question`} className="sr-only">
          Your question
        </label>
        <input
          ref={input}
          id={`${id}-question`}
          name="question"
          type="text"
          maxLength={300}
          autoComplete="off"
          placeholder="What did you build at Anthropic?"
          disabled={state.kind === "asking"}
          className="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-hidden placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state.kind === "asking"}
          className="h-11 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground outline-hidden transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
        >
          {state.kind === "asking" ? "Asking…" : "Ask"}
        </button>
      </form>
      {state.kind === "asking" && (
        <p className="text-sm text-muted-foreground" role="status">
          Asking the agent…
        </p>
      )}
      {state.kind === "answered" && (
        <div className="flex flex-col gap-2 rounded-lg bg-muted p-4 text-sm" role="status">
          <p className="font-medium text-muted-foreground">{state.question}</p>
          <p className="whitespace-pre-wrap">{state.answer.answer}</p>
          <p className="text-xs text-muted-foreground">
            {state.answer.backend === "agent" ? "Powered by Claude Managed Agents." : "Powered by Claude."}
          </p>
        </div>
      )}
      {state.kind === "failed" && (
        <p className="text-sm text-muted-foreground" role="alert">
          {state.message}
        </p>
      )}
      {/* The suggestions stay under the answer, so a thread can keep going
          with one click; the one just asked steps aside. */}
      {state.kind !== "asking" && (
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{state.kind === "idle" ? "Try:" : "Ask next:"}</span>
          {(isActive(party) ? PARTY_EXAMPLES : EXAMPLES)
            .filter((example) => state.kind === "idle" || example !== state.question)
            .map((example) => (
            <button
              key={example}
              type="button"
              className="py-1 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary"
              onClick={() => {
                if (input.current) input.current.value = example;
                void ask(example);
              }}
            >
              {example}
            </button>
          ))}
          {isActive(party) && (
            <button
              type="button"
              className="py-1 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary"
              onClick={() => {
                setParty({});
                setState({ kind: "idle" });
              }}
            >
              Turn it off
            </button>
          )}
        </p>
      )}
    </section>
  );
}
