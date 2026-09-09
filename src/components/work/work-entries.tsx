import MarkDownTextWithLinebreaks from "@/components/typography/markdown";
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

/**
 * Company mark. When a dark variant exists both are in the HTML and CSS picks
 * one, so the right mark shows in either theme before any JavaScript runs.
 * The marks are SVGs, which next/image would pass through untouched anyway,
 * so plain <img> tags keep them out of the client bundle.
 */
export function CompanyLogo({
  company,
  className,
}: {
  company: Pick<CompanyView, "image" | "imageDark">;
  className?: string;
}) {
  const base = cn("h-8 w-8 shrink-0 rounded-full", className);
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={company.image}
        width={32}
        height={32}
        alt=""
        loading="lazy"
        className={cn(base, company.imageDark && "dark:hidden")}
      />
      {company.imageDark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={company.imageDark}
          width={32}
          height={32}
          alt=""
          loading="lazy"
          className={cn(base, "hidden dark:block")}
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
        <li key={entry.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
          <h4 className="text-base font-medium leading-none tracking-tight">
            {entry.team}
          </h4>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{entry.role}</span>
            <span className="text-xs">
              <DateRange {...entry} />
            </span>
          </div>
          <div className="text-sm">
            <MarkDownTextWithLinebreaks text={entry.description} />
          </div>
        </li>
      ))}
    </ul>
  );
}
