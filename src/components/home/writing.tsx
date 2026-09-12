import { writing, type Piece } from "@/content/writing";
import { monthLabel } from "@/lib/work";

import { SectionHeading } from "../typography/heading";

/** Newest first; `YYYY-MM` strings order correctly as text. */
const pieces = [...writing].sort((a, b) => b.date.localeCompare(a.date));

/** What kind of thing each row is: a page of text, or something to watch. */
function KindMark({ kind }: { kind: Piece["kind"] }) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "size-4 text-muted-foreground",
  };
  if (kind === "article") {
    return (
      <svg {...common}>
        <title>Article</title>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <title>{kind === "video" ? "Video" : "Talk"}</title>
      <circle cx="12" cy="12" r="10" />
      <path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Writing and talks: the public work behind the work history. One row per
 * piece from content/writing.ts, newest first: a mark for its kind, the
 * title linked, and where and when it appeared.
 */
export default function Writing() {
  return (
    <section aria-labelledby="writing-heading" className="flex w-full flex-col gap-2">
      <SectionHeading id="writing-heading">Writing &amp; Talks</SectionHeading>
      <ul className="divide-y">
        {pieces.map((piece) => (
          <li key={piece.url} className="flex gap-3 py-3 first:pt-1 last:pb-0">
            {/* The mark is centred on the title's first line: the link's
                own padding plus one line of text is 2rem tall, so is this box. */}
            <span className="flex h-8 shrink-0 items-center">
              <KindMark kind={piece.kind} />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="sr-only">{piece.kind === "article" ? "Article:" : piece.kind === "video" ? "Video:" : "Talk:"}</span>
              <a
                href={piece.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit py-1 font-semibold underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
              >
                {piece.title}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {piece.venue} · <time dateTime={piece.date}>{monthLabel(piece.date)}</time>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
