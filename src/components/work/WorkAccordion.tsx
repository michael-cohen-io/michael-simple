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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function WorkAccordion({
  companies,
  workItemDescriptionComponentMap,
}: {
  companies: CompanyWithInfo[];
  workItemDescriptionComponentMap: any;
}) {
  const [openSections, setOpenSections] = React.useState<string[]>([
    companies[0].name,
  ]);
  const { theme } = useTheme();

  const handleValueChange = (value: string[]) => {
    setOpenSections(value);
  };
  return (
    <Accordion
      type="multiple"
      defaultValue={[companies[0].name]}
      onValueChange={handleValueChange}
    >
      {companies.map((company, index) => (
        <AccordionItem key={index} value={company.name}>
          <AccordionTrigger>
            <div className="flex w-full items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={
                    theme === "dark" && company.imageDark
                      ? company.imageDark
                      : company.image
                  }
                />
                <AvatarFallback>{acronym(company.name)}</AvatarFallback>
              </Avatar>
              <div className="flex justify-between items-center w-full">
                {company.name}
                {openSections.filter((v) => v == company.name).length > 0 && (
                  <div className="text-xs hover:text-muted-foreground text-muted-foreground/80 px-2">
                    {formatDate(company.startDate)} -{" "}
                    {formatDate(company.endDate)}
                  </div>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent asChild>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {company.workEntries.map((work, index) => (
                <Card key={index} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-foreground text-xl flex gap-2 items-center">
                      {work.team}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">
                          {work.role}
                        </span>
                        <p className="text-xs">
                          {formatDate(work.startDate)} -{" "}
                          {formatDate(work.endDate)}
                        </p>
                      </div>
                    </CardDescription>
                    <Separator />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {workItemDescriptionComponentMap[work.id]}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
