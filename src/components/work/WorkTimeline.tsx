"use client";
import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CompanyWithInfo } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

export function WorkTimeline({
  companies,
  workItemDescriptionComponentMap,
}: {
  companies: CompanyWithInfo[];
  workItemDescriptionComponentMap: any;
}) {
  const [activeCard, setActiveCard] = useState<CompanyWithInfo | null>(null);
  return (
    <div className="py-12 flex gap-2">
      <Carousel
        opts={{
          align: "start",
        }}
        orientation="vertical"
        className={cn("", activeCard ? "w-1/3" : "w-full")}
      >
        <CarouselContent className="-mt-2 h-80">
          {companies.map((company, index) => {
            return (
              <CarouselItem
                key={index}
                className="pt-2 basis-1/4"
                onClick={() => setActiveCard(company)}
              >
                <div className="p-1">
                  <Card className="hover:bg-muted cursor-pointer">
                    <CardHeader>
                      <CardTitle>{company.name}</CardTitle>
                      <CardDescription>
                        {formatDate(company.startDate)} -{" "}
                        {formatDate(company.endDate)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      {activeCard && (
        <Card className="w-2/3 h-80 flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex justify-between items-center">
              {activeCard.name}
              <Button
                variant="ghost"
                onClick={() => setActiveCard(null)}
                className="text-foreground hover:text-muted-foreground p-1 h-6 w-6 cursor-pointer"
              >
                <X />
              </Button>
            </CardTitle>
            <CardDescription>
              {formatDate(activeCard.startDate)} -{" "}
              {formatDate(activeCard.endDate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full overflow-y-auto p-4">
            {activeCard.workEntries.map((work, index) => (
              <div key={index}>
                <h2 className="font-semibold text-lg">{work.team}</h2>
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
      )}
    </div>
  );
}
