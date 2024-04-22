import { Company, WorkEntry } from "@prisma/client";

export type WorkEntryWithInfo = WorkEntry & { company: Company };

export type CompanyWithInfo = Company & {
  startDate: Date;
  endDate?: Date;
  workEntries: WorkEntry[];
};
