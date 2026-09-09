import { Company, WorkEntry } from "@prisma/client";

export type WorkEntryWithInfo = WorkEntry & { company: Company };

/**
 * Month labels are formatted on the server (in UTC) and passed to the client
 * as strings, so no Date object crosses the RSC boundary and the visitor's
 * timezone cannot change what is displayed.
 */
type MonthRange = {
  /** e.g. "Aug 2024" */
  startLabel: string;
  /** e.g. "Dec 2023", or "Present" for an ongoing role */
  endLabel: string;
  /** `YYYY-MM`, for `<time dateTime>` */
  startMonth: string;
  /** `YYYY-MM`, or null for an ongoing role */
  endMonth: string | null;
};

export type WorkEntryView = Omit<
  WorkEntry,
  "startDate" | "endDate" | "createdAt"
> &
  MonthRange;

export type CompanyWithInfo = Omit<Company, "createdAt"> &
  MonthRange & {
    workEntries: WorkEntryView[];
  };
