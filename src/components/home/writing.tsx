import { writing } from "@/content/writing";

import { SectionHeading } from "../typography/heading";

/** A small play mark for talks and videos; articles get none. */
function PlayMark() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-3.5 shrink-0 text-primary"
    >
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}

/**
 * Writing and talks: the evidence under the hero sentence. One row per
 * piece from content/writing.ts, the title linked, the venue and one line
 * of summary under it. No dates, by design; the list is curated, not a
 * feed.
 */
export default function Writing() {
  return (
    <section aria-labelledby="writing-heading" className="flex w-full flex-col gap-2">
      <SectionHeading id="writing-heading">Writing &amp; Talks</SectionHeading>
      <ul className="divide-y">
        {writing.map((piece) => (
          <li key={piece.url} className="flex flex-col gap-1 py-3 first:pt-1 last:pb-0">
            <span className="flex items-center gap-2">
              {piece.kind !== "article" && <PlayMark />}
              <a
                href={piece.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1 font-semibold underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
              >
                {piece.title}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {piece.venue}
            </span>
            <p className="max-w-prose text-sm text-muted-foreground">{piece.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
