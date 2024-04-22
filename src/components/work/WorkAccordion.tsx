"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CompanyWithInfo } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export function WorkAccordion({
  companies,
  workItemDescriptionComponentMap,
}: {
  companies: CompanyWithInfo[];
  workItemDescriptionComponentMap: any;
}) {
  return (
    <Accordion type="single" collapsible>
      {companies.map((company, index) => (
        <AccordionItem key={index} value={company.name}>
          <AccordionTrigger>{company.name}</AccordionTrigger>
          <AccordionContent asChild>
            <Card className="h-80 flex flex-col">
              <CardHeader>
                <CardTitle className="text-foreground text-xl">
                  {company.url ? (
                    <Link href={company.url} className="text-primary">{company.name}</Link>
                  ) : (
                    company.name
                  )}
                </CardTitle>
                <CardDescription>
                  {formatDate(company.startDate)} -{" "}
                  {formatDate(company.endDate)}
                </CardDescription>
                <Separator />
              </CardHeader>
              <CardContent className="h-full overflow-y-auto p-4">
                {company.workEntries.map((work, index) => (
                  <div key={index}>
                    <h2 className="font-semibold text-foreground text-lg underline">
                      {work.team}
                    </h2>
                    <h4 className="font-semibold text-sm text-primary">
                      {work.role}
                    </h4>
                    <p className="text-sm text-muted-foreground pb-1">
                      {formatDate(work.startDate)} - {formatDate(work.endDate)}
                    </p>
                    <div className="text-sm">
                      {workItemDescriptionComponentMap[work.id]}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
