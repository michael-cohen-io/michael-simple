import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import type { CompanyView } from "@/lib/types";
import { cn } from "@/lib/utils";

import {
  CompanyLogo,
  CompanySiteLink,
  DateRange,
  WorkEntryList,
} from "./work-entries";

/**
 * The work history: one timeline at every width, each company a collapsible
 * row, the most recent open by default and any number open at once.
 *
 * Every row is its own grid with the same columns, so the dots line up from
 * row to row: `[spine | content]` when the section is narrow and
 * `[date | spine | content]` once it is wide enough (a container query on the
 * list, not the viewport, so the layout follows the space it is given). The
 * date is a real grid cell that moves between the two layouts; the spine is
 * a cell spanning every row rather than an absolutely positioned line.
 *
 * Rows: 1 = header (dot, logo, name, chevron), 2 = date (narrow only),
 * 3 = the panel with the roles. Closed panels stay in the DOM (keepMounted)
 * so the whole history prints, and so a reader without JavaScript still
 * gets the first company.
 */
export function WorkHistory({
  companies,
  className,
}: {
  companies: CompanyView[];
  className?: string;
}) {
  return (
    <Accordion
      multiple
      defaultValue={companies.slice(0, 1).map((company) => company.name)}
      render={<ol />}
      className={cn("@container", className)}
    >
      {companies.map((company) => (
        <AccordionItem
          key={company.name}
          value={company.name}
          render={<li />}
          className="group grid grid-cols-[auto_1fr] gap-x-4 border-0 @2xl:grid-cols-[10rem_auto_1fr]"
        >
          {/* The date range: under the name when narrow, in its own column when wide. */}
          <p className="col-start-2 row-start-2 text-sm font-semibold text-muted-foreground @2xl:col-start-1 @2xl:row-start-1 @2xl:self-center @2xl:whitespace-nowrap @2xl:text-right">
            <DateRange {...company} />
          </p>
          {/* The dot and the line down to the next row. A closed row is only as
              tall as its header, so the spine keeps a minimum height that
              leaves a stretch of line between one dot and the next; the last
              row has no line and no extra height. */}
          <div
            aria-hidden="true"
            className="col-start-1 row-start-1 row-end-4 flex min-h-16 w-4 flex-col items-center group-last:min-h-0 @2xl:col-start-2"
          >
            <span className="flex h-12 shrink-0 items-center">
              <span className="size-2 rounded-full bg-primary ring-4 ring-background" />
            </span>
            <span className="w-px flex-1 bg-border group-last:hidden" />
          </div>
          <AccordionTrigger
            headerClassName="col-start-2 row-start-1 @2xl:col-start-3"
            className="gap-3 py-2 text-lg font-semibold"
          >
            <span className="flex items-center gap-3">
              <CompanyLogo company={company} />
              <span>{company.name}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent
            keepMounted
            panelClassName="col-start-2 row-start-3 @2xl:col-start-3 print:block! print:h-auto!"
            className="pb-8 pt-3 group-last:pb-0"
          >
            <Card>
              <CompanySiteLink company={company} className="mb-3" />
              <WorkEntryList entries={company.entries} />
            </Card>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
