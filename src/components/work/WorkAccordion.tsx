"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CompanyWithInfo } from "@/lib/types";
import { acronym, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function WorkAccordion({
  companies,
  workItemDescriptionComponentMap,
}: {
  companies: CompanyWithInfo[];
  workItemDescriptionComponentMap: any;
}) {
  const { theme } = useTheme();
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
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      theme === "dark" && company.imageDark
                        ? company.imageDark
                        : company.image
                    }
                  />
                  <AvatarFallback>{acronym(company.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span>{company.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(company.startDate)} - {formatDate(company.endDate)}
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
                  <CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        {work.role}
                      </span>
                      <p className="text-xs">
                        {formatDate(work.startDate)} - {formatDate(work.endDate)}
                      </p>
                    </div>
                  </CardDescription>
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
              {formatDate(company.startDate)} - {formatDate(company.endDate)}
            </TimelineTime>
            <Avatar className="h-8 w-8 ml-8">
              <AvatarImage
                src={
                  theme === "dark" && company.imageDark
                    ? company.imageDark
                    : company.image
                }
              />
              <AvatarFallback>{acronym(company.name)}</AvatarFallback>
            </Avatar>
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
                    <CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">
                          {work.role}
                        </span>
                        <p className="text-xs">
                          {formatDate(work.startDate)} - {formatDate(work.endDate)}
                        </p>
                      </div>
                    </CardDescription>
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
