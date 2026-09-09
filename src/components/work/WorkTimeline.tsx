import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineItem,
  TimelineSpine,
  TimelineTime,
  TimelineTitle,
} from "@/components/timeline/timeline";
import { Card } from "@/components/ui/card";
import type { CompanyView } from "@/lib/types";

import { CompanyLogo, DateRange, WorkEntryList } from "./work-entries";

/** The wide layout: one timeline item per company with a card of its roles. */
export function WorkTimeline({
  companies,
  className,
}: {
  companies: CompanyView[];
  className?: string;
}) {
  return (
    <Timeline className={className}>
      {companies.map((company) => (
        <TimelineItem key={company.name}>
          <TimelineTime>
            <DateRange {...company} />
          </TimelineTime>
          <TimelineSpine />
          <TimelineHeader>
            <CompanyLogo company={company} />
            <TimelineTitle>{company.name}</TimelineTitle>
          </TimelineHeader>
          <TimelineContent>
            <Card>
              <WorkEntryList entries={company.entries} />
            </Card>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
