/**
 * View models for the Work section.
 *
 * They are built on the server from the database rows (see
 * components/work/work.tsx) so the components only ever deal with plain
 * strings: every date is formatted there, in UTC, and no Date object reaches
 * the render tree where a visitor's timezone could shift it by a month.
 */
export type MonthRange = {
  /** e.g. "Aug 2024" */
  startLabel: string;
  /** e.g. "Dec 2023", or "Present" for an ongoing role */
  endLabel: string;
  /** `YYYY-MM`, for `<time dateTime>` */
  startIso: string;
  /** `YYYY-MM`, or null for an ongoing role */
  endIso: string | null;
};

/** One role held at a company. */
export type EntryView = MonthRange & {
  id: number;
  team: string;
  role: string;
  /** Markdown; `\n` sequences separate paragraphs. */
  description: string;
};

/** A company with its roles, newest first, and the span they cover. */
export type CompanyView = MonthRange & {
  name: string;
  url: string | null;
  image: string;
  imageDark: string | null;
  entries: EntryView[];
};
