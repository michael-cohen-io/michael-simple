"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import {
  Card,
  CardDescription,
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

export function MobileWorkAccordion({
  companies,
  workItemDescriptionComponentMap,
}: {
  companies: CompanyWithInfo[];
  workItemDescriptionComponentMap: any;
}) {
  const { theme } = useTheme();

  return (
    <Accordion type="single" collapsible>
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
