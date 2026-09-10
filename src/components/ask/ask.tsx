"use client";

import { useId, useRef, useState } from "react";

type Answer = { answer: string; sessionId: string | null; backend: "agent" | "messages" };
type Problem = { title?: string; detail?: string; code?: string };

type State =
  | { kind: "idle" }
  | { kind: "asking"; question: string }
  | { kind: "answered"; question: string; answer: Answer }
  | { kind: "failed"; question: string; message: string };

const EXAMPLES = [
  "What did you build at Anthropic?",
  "What is the brain / hands split?",
  "What did you work on at OpenSea?",
];

/**
 * "Ask about my work": a question box under the hero. The answer comes from
 * /api/ask, a Vercel Function that runs a Claude Managed Agent grounded on
 * this page's own Markdown twin (or, until the agent is provisioned, a
 * single Claude API call over the same text). Follow-up questions reuse
 * the agent's session so it keeps the thread. On a host without the
 * function (a local static build), the box says so.
 */
export default function Ask() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || state.kind === "asking") return;
    setState({ kind: "asking", question: trimmed });
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ question: trimmed, sessionId }),
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
      setState({ kind: "answered", question: trimmed, answer: body });
    } catch (error) {
      setState({ kind: "failed", question: trimmed, message: error instanceof Error ? error.message : String(error) });
    }
  };

  return (
    <section aria-labelledby={`${id}-heading`} className="flex w-full flex-col gap-3">
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
      {state.kind === "idle" && (
        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Try:</span>
          {EXAMPLES.map((example) => (
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
        </p>
      )}
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
            {state.answer.backend === "agent"
              ? "Answered by a Claude agent on Claude Managed Agents, grounded on this page. Ask a follow-up; it keeps the thread."
              : "Answered by Claude, grounded on this page."}
          </p>
        </div>
      )}
      {state.kind === "failed" && (
        <p className="text-sm text-muted-foreground" role="alert">
          {state.message}
        </p>
      )}
    </section>
  );
}
