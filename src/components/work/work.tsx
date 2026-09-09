import prisma from "@/lib/prisma";
import type { CompanyView, MonthRange } from "@/lib/types";
import { formatDate, monthKey } from "@/lib/utils";

import { H1 } from "../typography/heading";
import { WorkAccordion } from "./WorkAccordion";
import { WorkTimeline } from "./WorkTimeline";

function monthRange(start: Date, end: Date | null): MonthRange {
  return {
    startLabel: formatDate(start),
    endLabel: formatDate(end),
    startIso: monthKey(start),
    endIso: end ? monthKey(end) : null,
  };
}

/** Companies newest first, each with its visible roles newest first. */
async function fetchCompanies(): Promise<CompanyView[]> {
  const companies = await prisma.company.findMany({
    select: {
      name: true,
      url: true,
      image: true,
      imageDark: true,
      workEntries: {
        select: {
          id: true,
          team: true,
          role: true,
          description: true,
          startDate: true,
          endDate: true,
        },
        where: { visible: true },
        orderBy: { startDate: "desc" },
      },
    },
  });

  return companies
    .filter((company) => company.workEntries.length > 0)
    .map(({ workEntries, ...company }): CompanyView => {
      const starts = workEntries.map((entry) => entry.startDate.getTime());
      const ends = workEntries.map((entry) => entry.endDate);
      // A still-open role means the whole tenure is still open.
      const end = ends.every((date): date is Date => date !== null)
        ? new Date(Math.max(...ends.map((date) => date.getTime())))
        : null;
      return {
        ...company,
        ...monthRange(new Date(Math.min(...starts)), end),
        entries: workEntries.map(({ startDate, endDate, ...entry }) => ({
          ...entry,
          ...monthRange(startDate, endDate),
        })),
      };
    })
    .sort((a, b) => b.startIso.localeCompare(a.startIso));
}

export default async function Work() {
  const companies = await fetchCompanies();
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
      {/* Both layouts are in the HTML; CSS shows the one that fits. */}
      <WorkAccordion companies={companies} className="md:hidden" />
      <WorkTimeline companies={companies} className="hidden md:block" />
    </div>
  );
}
