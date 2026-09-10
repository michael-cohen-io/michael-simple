import { Markdown } from "@/components/typography/markdown";
import type { CompanyView, EntryView, MonthRange } from "@/lib/types";
import { cn } from "@/lib/utils";

/** "Aug 2024 – Present", each month a <time> with a YYYY-MM dateTime. */
export function DateRange({
  startLabel,
  endLabel,
  startIso,
  endIso,
}: MonthRange) {
  return (
    <>
      <time dateTime={startIso}>{startLabel}</time>
      {" – "}
      {endIso ? <time dateTime={endIso}>{endLabel}</time> : endLabel}
    </>
  );
}

/** Says the link leaves the site; every external link on the page does this. */
function NewTab() {
  return <span className="sr-only"> (opens in new tab)</span>;
}

/** The company name, linked to its site when the row has one. */
export function CompanyName({
  company,
}: {
  company: Pick<CompanyView, "name" | "url">;
}) {
  if (!company.url) return <>{company.name}</>;
  return (
    <a
      href={company.url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline-offset-4 hover:underline"
    >
      {company.name}
      <NewTab />
    </a>
  );
}

/** The company's site as a small "anthropic.com" line; nothing without a URL. */
export function CompanySiteLink({
  company,
  className,
}: {
  company: Pick<CompanyView, "name" | "url">;
  className?: string;
}) {
  if (!company.url) return null;
  return (
    <p className={cn("text-xs", className)}>
      <a
        href={company.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block py-2 text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
      >
        {new URL(company.url).hostname.replace(/^www\./, "")}
        <NewTab />
      </a>
    </p>
  );
}

/**
 * Company mark. When a dark variant exists both are in the HTML and CSS picks
 * one, so the right mark shows in either theme before any JavaScript runs.
 * On paper the light mark is always the one shown; its print utilities are
 * important because the dark: rules are more specific. The marks are SVGs,
 * which next/image would pass through untouched anyway, so plain <img> tags
 * keep them out of the client bundle.
 */
export function CompanyLogo({
  company,
  className,
}: {
  company: Pick<CompanyView, "name" | "image" | "imageDark">;
  className?: string;
}) {
  const base = cn("h-8 w-8 shrink-0 rounded-full", className);
  if (!company.image) {
    // No mark for this company: its initial in a muted circle, so every row
    // keeps the same shape.
    return (
      <span
        aria-hidden="true"
        className={cn(
          base,
          "inline-flex items-center justify-center bg-muted text-xs font-semibold text-muted-foreground",
        )}
      >
        {company.name.charAt(0)}
      </span>
    );
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={company.image}
        width={32}
        height={32}
        alt=""
        loading="lazy"
        className={cn(base, company.imageDark && "dark:hidden print:block!")}
      />
      {company.imageDark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={company.imageDark}
          width={32}
          height={32}
          alt=""
          loading="lazy"
          className={cn(base, "hidden dark:block print:hidden!")}
        />
      )}
    </>
  );
}

/**
 * The roles held at one company, newest first, separated by rules. The first
 * and last items drop their outer padding so the list sits flush against
 * whatever contains it.
 */
export function WorkEntryList({ entries }: { entries: EntryView[] }) {
  return (
    <ul className="divide-y">
      {entries.map((entry) => (
        <li
          key={`${entry.role} ${entry.startIso}`}
          className="space-y-2 py-4 first:pt-0 last:pb-0"
        >
          <h4 className="text-base font-medium leading-none tracking-tight">
            {entry.team}
          </h4>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{entry.role}</span>
            <span className="text-xs">
              <DateRange {...entry} />
            </span>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {entry.bullets.map((bullet, index) => (
              <li key={index}>
                <Markdown>{bullet}</Markdown>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
