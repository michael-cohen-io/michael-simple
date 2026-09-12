"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { useId, useRef, useState } from "react";

import {
  PartyLayer,
  collectRuns,
  usePartyMode,
} from "@/components/party/party";
import { isActive, mergeEffects, type Effects } from "@/lib/party";

type Answer = {
  answer: string;
  sessionId: string | null;
  backend: "agent" | "messages";
  effects?: Effects[];
};
type Problem = { title?: string; detail?: string; code?: string };

type State =
  | { kind: "idle" }
  | { kind: "asking"; question: string }
  | { kind: "answered"; question: string; answer: Answer }
  | { kind: "failed"; question: string; message: string };

const EXAMPLES = [
  "What did Michael build at Anthropic?",
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

/** Claude's mark: the official geometry (the path Simple Icons publishes for it), in the current colour. */
function ClaudeMark({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"
      />
    </svg>
  );
}

/** A chevron for the section's trigger, the same one the accordion draws. */
function Chevron({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * "Ask Claude about me": a question box under the hero, folded shut until
 * the visitor opens it. The answer comes from
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
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        // The page's visible text goes along, so the agent can list and rewrite it.
        body: JSON.stringify({
          question: trimmed,
          sessionId,
          party,
          runs: collectRuns(),
        }),
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
      if (!response.ok)
        throw new Error(
          body.detail ?? body.title ?? `Request failed (${response.status}).`,
        );
      setSessionId(body.sessionId);
      if (body.effects?.length)
        setParty(body.effects.reduce(mergeEffects, party));
      setState({ kind: "answered", question: trimmed, answer: body });
    } catch (error) {
      setState({
        kind: "failed",
        question: trimmed,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="flex w-full flex-col"
      data-party-static
    >
      <PartyLayer effects={party} />
      <Collapsible.Root defaultOpen={false} className="flex flex-col">
        <h2 id={`${id}-heading`} className="text-base font-semibold">
          <Collapsible.Trigger className="group/ask flex w-full items-center justify-between py-2 text-left outline-hidden transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            Ask Claude about me
            <Chevron className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none group-data-[panel-open]/ask:rotate-180" />
          </Collapsible.Trigger>
        </h2>
        <Collapsible.Panel className="-mx-1 h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
          <div className="flex flex-col gap-3 p-1">
            <form
              className="flex gap-2"
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
                placeholder="What did Michael build at Anthropic?"
                disabled={state.kind === "asking"}
                className="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-hidden placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={state.kind === "asking"}
                aria-label={
                  state.kind === "asking" ? "Asking Claude…" : "Ask Claude"
                }
                title="Ask Claude"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground outline-hidden transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
              >
                <ClaudeMark
                  className={
                    state.kind === "asking"
                      ? "size-5 animate-spin [animation-duration:2.5s] motion-reduce:animate-pulse"
                      : "size-5"
                  }
                />
              </button>
            </form>
            {state.kind === "asking" && (
              <p className="text-sm text-muted-foreground" role="status">
                Asking the agent…
              </p>
            )}
            {state.kind === "answered" && (
              <div
                className="flex flex-col gap-2 rounded-lg bg-muted p-4 text-sm"
                role="status"
              >
                <p className="font-medium text-muted-foreground">
                  {state.question}
                </p>
                <p className="whitespace-pre-wrap">{state.answer.answer}</p>
                <p className="text-xs text-muted-foreground">
                  {state.answer.backend === "agent"
                    ? "Powered by Claude Managed Agents."
                    : "Powered by Claude."}
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
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="py-1">{state.kind === "idle" ? "Try:" : "Ask next:"}</span>
                {(isActive(party) ? PARTY_EXAMPLES : EXAMPLES)
                  .filter(
                    (example) =>
                      state.kind === "idle" || example !== state.question,
                  )
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
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    </section>
  );
}
