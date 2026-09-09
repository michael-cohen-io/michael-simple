"use client";

import * as React from "react";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CompanyWithInfo, WorkEntryView } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineIcon,
  TimelineContent,
  TimelineTime,
} from "@/components/timeline/timeline";

/** "Aug 2024 – Present", each month wrapped in a <time> with a YYYY-MM dateTime. */
function DateRange({
  startLabel,
  endLabel,
  startMonth,
  endMonth,
}: Pick<
  WorkEntryView,
  "startLabel" | "endLabel" | "startMonth" | "endMonth"
>) {
  return (
    <>
      <time dateTime={startMonth}>{startLabel}</time>
      {" – "}
      {endMonth ? <time dateTime={endMonth}>{endLabel}</time> : endLabel}
    </>
  );
}

/**
 * Company mark. When a dark variant exists both are rendered and CSS picks one,
 * so the right mark shows regardless of hydration state or the system theme.
 * The logos are SVGs, which next/image passes through unoptimized.
 */
function CompanyLogo({
  company,
  className,
}: {
  company: CompanyWithInfo;
  className?: string;
}) {
  const base = cn("h-8 w-8 shrink-0 rounded-full", className);
  if (!company.imageDark) {
    return (
      <Image
        src={company.image}
        alt=""
        width={32}
        height={32}
        className={base}
      />
    );
  }
  return (
    <>
      <Image
        src={company.image}
        alt=""
        width={32}
        height={32}
        className={cn(base, "dark:hidden")}
      />
      <Image
        src={company.imageDark}
        alt=""
        width={32}
        height={32}
        className={cn(base, "hidden dark:block")}
      />
    </>
  );
}

function WorkEntryDescription({ work }: { work: WorkEntryView }) {
  return (
    <CardDescription className="flex items-center justify-between">
      <span className="font-semibold text-primary">{work.role}</span>
      <span className="text-xs">
        <DateRange {...work} />
      </span>
    </CardDescription>
  );
}

export function WorkAccordion({
  companies,
  workItemDescriptionComponentMap,
}: {
  companies: CompanyWithInfo[];
  workItemDescriptionComponentMap: Record<number, React.ReactNode>;
}) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <Accordion type="single" collapsible className="md:hidden">
        {companies.map((company, index) => (
          <AccordionItem key={index} value={company.name}>
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <CompanyLogo company={company} />
                <div className="flex flex-col items-start">
                  <span>{company.name}</span>
                  <span className="text-xs text-muted-foreground">
                    <DateRange {...company} />
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {company.workEntries.map((work, idx) => (
                <div key={idx} className="space-y-2 mt-2">
                  <CardTitle className="text-foreground text-lg">
                    {work.team}
                  </CardTitle>
                  <WorkEntryDescription work={work} />
                  <div className="text-sm pt-2">
                    {workItemDescriptionComponentMap[work.id]}
                  </div>
                  {idx < company.workEntries.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  return (
    <Timeline className="hidden md:flex">
      {companies.map((company, index) => (
        <TimelineItem key={index}>
          {index < companies.length - 1 && <TimelineConnector />}
          <TimelineHeader>
            <TimelineIcon />
            <TimelineTime>
              <DateRange {...company} />
            </TimelineTime>
            <CompanyLogo company={company} className="ml-8" />
            <TimelineTitle>{company.name}</TimelineTitle>
          </TimelineHeader>
          <TimelineContent>
            <Card className="flex flex-col">
              <CardHeader>
                {company.workEntries.map((work, idx) => (
                  <div key={idx} className="space-y-2">
                    <CardTitle className="text-foreground text-lg flex gap-2 items-center">
                      {work.team}
                    </CardTitle>
                    <WorkEntryDescription work={work} />
                    <CardContent className="px-0">
                      <div className="text-sm">
                        {workItemDescriptionComponentMap[work.id]}
                      </div>
                    </CardContent>
                    {idx < company.workEntries.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </CardHeader>
            </Card>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
