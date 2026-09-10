"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { SITE_URL } from "@/lib/site";
import { getServerView, getView, subscribe } from "@/lib/view-store";

type Files = { markdown: string; llms: string };

const host = new URL(SITE_URL).host;

/** A line as it would be typed into a terminal: the prompt in the accent. */
function Command({ children }: { children: string }) {
  return (
    <p className="text-muted-foreground">
      <span className="select-none text-primary">$ </span>
      {children}
    </p>
  );
}

/**
 * The page as an agent gets it: the Markdown that `/` returns for
 * `Accept: text/markdown`, then the llms.txt index, fetched from this same
 * site the first time the switch is flipped (they are files in the export,
 * so nothing is duplicated in the HTML). Hidden, and empty, until then.
 */
export default function AgentView() {
  const view = useSyncExternalStore(subscribe, getView, getServerView);
  const [files, setFiles] = useState<Files | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (view !== "agent" || files) return;
    let cancelled = false;
    Promise.all([fetch("/index.md"), fetch("/llms.txt")])
      .then(async ([markdown, llms]) => {
        if (!markdown.ok || !llms.ok) throw new Error("not ok");
        const next = { markdown: await markdown.text(), llms: await llms.text() };
        if (!cancelled) setFiles(next);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [view, files]);

  if (view !== "agent") return null;

  return (
    <section
      aria-label="The page as an agent receives it"
      className="agent-view flex w-full flex-col gap-6 font-mono text-[13px] leading-relaxed"
    >
      <div className="flex flex-col gap-1">
        <Command>{`curl -H "Accept: text/markdown" https://${host}/`}</Command>
        <p className="text-muted-foreground">
          <span className="text-primary">200</span> text/markdown; charset=utf-8 · Vary: Accept
        </p>
      </div>
      {failed ? (
        <p>Could not load /index.md from this host.</p>
      ) : files ? (
        <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted p-4">{files.markdown}</pre>
      ) : (
        <p className="text-muted-foreground">Fetching…</p>
      )}
      <div className="flex flex-col gap-1">
        <Command>{`curl https://${host}/llms.txt`}</Command>
        {files && <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted p-4">{files.llms}</pre>}
      </div>
      <div className="flex flex-col gap-1">
        <Command>{`curl -H "Accept: application/json" https://${host}/anything-else`}</Command>
        <p className="text-muted-foreground">
          <span className="text-primary">404</span> application/problem+json, with a code, a hint and every
          resource on the site. Also served:{" "}
          <a href="/resume.json" className="underline underline-offset-4">/resume.json</a>,{" "}
          <a href="/openapi.json" className="underline underline-offset-4">/openapi.json</a>,{" "}
          <a href="/MichaelCohenResume.pdf" className="underline underline-offset-4">/MichaelCohenResume.pdf</a>.
        </p>
      </div>
    </section>
  );
}
