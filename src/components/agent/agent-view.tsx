"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { SITE_URL } from "@/lib/site";
import { getServerView, getView, subscribe } from "@/lib/view-store";

const command = `curl ${SITE_URL}/llms.txt`;

/** Copies the command to the clipboard and says so for a moment. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => setCopied(true), () => setCopied(false));
      }}
      className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground outline-hidden transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/**
 * The page as an agent gets it: llms.txt, the one document that is also
 * what `/` returns for `Accept: text/markdown`, fetched from this same site
 * the first time the switch is flipped (it is a file in the export, so
 * nothing is duplicated in the HTML). Hidden, and empty, until then.
 */
export default function AgentView() {
  const view = useSyncExternalStore(subscribe, getView, getServerView);
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (view !== "agent" || text) return;
    let cancelled = false;
    fetch("/llms.txt")
      .then(async (response) => {
        if (!response.ok) throw new Error("not ok");
        const body = await response.text();
        if (!cancelled) setText(body);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [view, text]);

  if (view !== "agent") return null;

  return (
    <section
      aria-label="The page as an agent receives it"
      className="agent-view flex w-full flex-col gap-4 font-mono text-[13px] leading-relaxed"
    >
      <div className="flex items-center gap-3">
        <p className="min-w-0 break-all text-muted-foreground">
          <span className="select-none text-primary">$ </span>
          {command}
        </p>
        <CopyButton text={command} />
      </div>
      {failed ? (
        <p>Could not load /llms.txt from this host.</p>
      ) : text ? (
        <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted p-4">{text}</pre>
      ) : (
        <p className="text-muted-foreground">Fetching…</p>
      )}
      <p className="text-muted-foreground">
        The same document comes back from <span className="text-foreground">/</span> for{" "}
        <span className="text-foreground">Accept: text/markdown</span>. Also served:{" "}
        <a href="/resume.json" className="underline underline-offset-4">/resume.json</a>,{" "}
        <a href="/openapi.json" className="underline underline-offset-4">/openapi.json</a>,{" "}
        <a href="/MichaelCohenResume.pdf" className="underline underline-offset-4">/MichaelCohenResume.pdf</a>.
      </p>
    </section>
  );
}
