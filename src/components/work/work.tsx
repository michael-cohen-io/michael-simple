import MarkDownTextWithLinebreaks from "@/components/typography/markdown";
import prisma from "@/lib/prisma";
import { CompanyWithInfo, WorkEntryView } from "@/lib/types";
import { formatDate, monthKey } from "@/lib/utils";
import { WorkAccordion } from "./WorkAccordion";
import { H1 } from "../typography/heading";

function monthRange(startDate: Date, endDate?: Date | null) {
  return {
    startLabel: formatDate(startDate),
    endLabel: formatDate(endDate),
    startMonth: monthKey(startDate),
    endMonth: endDate ? monthKey(endDate) : null,
  };
}

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

      return { company, startDate, endDate };
    })
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  // Format every date here, on the server, so the client component only ever
  // receives strings (see MonthRange in lib/types.ts).
  return enhanced.map(({ company, startDate, endDate }) => {
    const { createdAt: _companyCreatedAt, workEntries, ...rest } = company;
    return {
      ...rest,
      ...monthRange(startDate, endDate),
      workEntries: workEntries.map((entry): WorkEntryView => {
        const {
          startDate,
          endDate,
          createdAt: _entryCreatedAt,
          ...entryRest
        } = entry;
        return { ...entryRest, ...monthRange(startDate, endDate) };
      }),
    };
  });
}

function workItemDescriptionComponent(workItem: WorkEntryView) {
  return <MarkDownTextWithLinebreaks text={workItem.description} />;
}

export default async function Work() {
  const companies = await fetchWorkData();

  const workItemDescriptionComponentMap = companies
    .flatMap((c) => c.workEntries)
    .reduce(
      (acc: Record<number, React.ReactNode>, workItem) => ({
        ...acc,
        [workItem.id]: workItemDescriptionComponent(workItem),
      }),
      {},
    );
  return (
    <div className="flex flex-col w-full gap-2">
      <H1>Work Experience</H1>
      <p className="text-sm font-light">
        Prefer the classic format?{" "}
        <a
          href="/MichaelCohenResume.pdf"
          download="Michael Cohen - Resume.pdf"
          className="underline underline-offset-4 decoration-primary/60 hover:decoration-primary"
        >
          Download résumé (PDF)
        </a>
      </p>
      <WorkAccordion
        companies={companies}
        workItemDescriptionComponentMap={workItemDescriptionComponentMap}
      />
    </div>
  );
}
