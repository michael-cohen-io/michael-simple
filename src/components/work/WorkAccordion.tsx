import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CompanyView } from "@/lib/types";

import {
  CompanyLogo,
  CompanySiteLink,
  DateRange,
  WorkEntryList,
} from "./work-entries";

/**
 * The narrow layout: one collapsible panel per company, at most one open at a
 * time and the most recent open by default. Everything inside is rendered on
 * the server; only the Radix accordion itself runs on the client.
 */
export function WorkAccordion({
  companies,
  className,
}: {
  companies: CompanyView[];
  className?: string;
}) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={companies[0]?.name}
      className={className}
    >
      {companies.map((company) => (
        <AccordionItem key={company.name} value={company.name}>
          <AccordionTrigger>
            <span className="flex items-center gap-3 text-left">
              <CompanyLogo company={company} />
              <span className="flex flex-col items-start gap-1">
                <span className="text-lg font-semibold">{company.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  <DateRange {...company} />
                </span>
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-1">
            {/* The trigger is a button, so the company's site is linked here. */}
            <CompanySiteLink company={company} className="mb-3" />
            <WorkEntryList entries={company.entries} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
