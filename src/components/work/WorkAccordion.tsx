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
import { acronym, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
                <CardTitle className="text-foreground text-xl flex gap-2 items-center">
                  <Avatar>
                    <AvatarImage src={company.image} />
                    <AvatarFallback>{acronym(company.name)}</AvatarFallback>
                  </Avatar>
                  {company.description ? (
                    <HoverCard>
                      <HoverCardTrigger
                        href={company.url ?? undefined}
                        className="text-primary"
                      >
                        {company.name}
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarImage src={company.image} />
                            <AvatarFallback>
                              {acronym(company.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">
                              {company.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {company.description}
                            </p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    <>
                      {company.url ? (
                        <Link href={company.url} className="text-primary">
                          {company.name}
                        </Link>
                      ) : (
                        company.name
                      )}
                    </>
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
