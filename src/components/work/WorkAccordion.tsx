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

  return (
    <Timeline>
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
