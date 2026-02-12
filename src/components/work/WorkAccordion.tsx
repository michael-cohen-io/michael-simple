"use client";

import { CompanyWithInfo } from "@/lib/types";
import { MobileWorkAccordion } from "./MobileWorkAccordion";
import { WorkTimeline } from "./WorkTimeline";

export function WorkAccordion({
  companies,
  workItemDescriptionComponentMap,
}: {
  companies: CompanyWithInfo[];
  workItemDescriptionComponentMap: Record<number, React.ReactNode>;
}) {
  return (
    <>
      <div className="md:hidden">
        <MobileWorkAccordion
          companies={companies}
          workItemDescriptionComponentMap={workItemDescriptionComponentMap}
        />
      </div>
      <div className="hidden md:block">
        <WorkTimeline
          companies={companies}
          workItemDescriptionComponentMap={workItemDescriptionComponentMap}
        />
      </div>
    </>
  );
}
