import { Company, WorkEntry } from "@prisma/client";

export type WorkEntryWithInfo = WorkEntry & { company: Company };
