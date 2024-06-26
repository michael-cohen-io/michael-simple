import MarkDownTextWithLinebreaks from "@/components/typography/markdown";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CompanyWithInfo } from "@/lib/types";
import { WorkAccordion } from "./WorkAccordion";
import { H1 } from "../typography/heading";

async function fetchWorkData(): Promise<CompanyWithInfo[]> {
  const companies = await prisma.company.findMany({
    include: {
      workEntries: {
        orderBy: {
          startDate: "desc",
        },
        where: {
          visible: true,
        },
      },
    },
  });
  // Add a computed field to each company
  const enhanced = companies
    .filter((c) => c.workEntries.length > 0)
    .map((company) => {
      const startDate = company.workEntries.reduce(
        (earliestDate, currentTeam) => {
          const currentStartDate = new Date(currentTeam.startDate);
          return currentStartDate < earliestDate
            ? currentStartDate
            : earliestDate;
        },
        new Date(company.workEntries[0].startDate),
      );

      const endDate = company.workEntries.some((team) => team.endDate === null)
        ? undefined
        : company.workEntries.reduce((latestDate, currentTeam) => {
            if (currentTeam.endDate === null) {
              return latestDate;
            }
            const currentEndDate = new Date(currentTeam.endDate);
            return currentEndDate > latestDate ? currentEndDate : latestDate;
          }, new Date(0));

      return {
        startDate,
        endDate,
        ...company,
      };
    });
  return enhanced.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
}

function workItemDescriptionComponent(workItem: any) {
  return <MarkDownTextWithLinebreaks text={workItem.description} />;
}

export default async function Work() {
  const companies = await fetchWorkData();

  const workItemDescriptionComponentMap = companies
    .flatMap((c) => c.workEntries)
    .reduce(
      (acc: any, workItem: { id: any }) => ({
        ...acc,
        [workItem.id]: workItemDescriptionComponent(workItem),
      }),
      {},
    );
  return (
    <div className="flex flex-col w-full gap-2">
      <H1>Work Experience</H1>
      <div className="text-sm font-light">
        are you oldschool? read on at{" "}
        <Button
          variant="ghost"
          size="sm"
          className="px-1 -translate-x-1 md:-translate-x-0 md:p-2"
          asChild
        >
          <Link href="/MichaelCohenResume.pdf">MichaelCohenResume.pdf</Link>
        </Button>
      </div>
      <WorkAccordion
        companies={companies}
        workItemDescriptionComponentMap={workItemDescriptionComponentMap}
      />
    </div>
  );
}
