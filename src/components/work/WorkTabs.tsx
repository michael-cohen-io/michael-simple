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
import { cn, formatDate } from "@/lib/utils";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export function WorkTabs({
  companies,
  workItemDescriptionComponentMap,
}: {
  companies: CompanyWithInfo[];
  workItemDescriptionComponentMap: any;
}) {
  const [tab, setTab] = React.useState<string | null>(null);
  return (
    <Tabs orientation="vertical" className="h-80 justify-center" value={tab}>
      <TabsList
        className={cn(tab !== null ? "h-80 w1/3 md:w-1/4" : "w-2/3 h-fit")}
      >
        {companies.map((company, index) => (
          <div className="px-4 w-full items-center flex flex-col" key={index}>
            <TabsTrigger
              value={company.name}
              onClick={() => setTab(company.name)}
            >
              {company.name}
            </TabsTrigger>
            {index != companies.length - 1 && <Separator />}
          </div>
        ))}
      </TabsList>
      {companies.map((company, index) => (
        <TabsContent value={company.name} key={index} asChild>
          <Card className="w-2/3 md:w-3/4 h-80 flex flex-col">
            <CardHeader>
              <CardTitle className="flex text-foreground text-xl justify-between items-center">
                {company.name}
                <Button
                  variant="ghost"
                  onClick={() => setTab(null)}
                  className="text-foreground hover:text-muted-foreground p-1 h-6 w-6 cursor-pointer"
                >
                  <X />
                </Button>
              </CardTitle>
              <CardDescription>
                {formatDate(company.startDate)} - {formatDate(company.endDate)}
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
        </TabsContent>
      ))}
    </Tabs>
  );
}
