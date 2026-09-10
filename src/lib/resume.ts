import type { Company } from "@/content/types";
import type { MonthRange } from "@/lib/types";
import { companyViews } from "@/lib/work";

/** One dated block on the résumé: a role, or a whole company folded into one. */
export type ResumeBlock = MonthRange & {
  company: string;
  url: string;
  role: string;
  /** null when the block stands for the whole company. */
  team: string | null;
  bullets: string[];
};

/**
 * The work history as the one-page résumé shows it. Companies and roles
 * marked `resume: false` are left out, a role's `resume.bullets` replace its
 * site bullets, and a company with `resume.role` collapses to one block over
 * its remaining tenure. Order and dates come from the same helper as the
 * site, so the two can never disagree, and the same content mistakes fail
 * the build here too.
 */
export function resumeBlocks(companies: Company[]): ResumeBlock[] {
  const kept = companies
    .filter((company) => company.resume !== false)
    .map((company) => ({
      ...company,
      entries: company.entries
        .filter((entry) => entry.resume !== false)
        .map((entry) => ({
          ...entry,
          bullets: entry.resume ? entry.resume.bullets : entry.bullets,
        })),
    }));
  for (const company of kept) {
    if (company.entries.length === 0) {
      throw new Error(
        `${company.name}: every role is marked resume: false in content/work.ts; mark the company instead`,
      );
    }
  }
  if (kept.length === 0) throw new Error("Every company is marked resume: false in content/work.ts");

  const byName = new Map(kept.map((company) => [company.name, company]));
  return companyViews(kept).flatMap((view): ResumeBlock[] => {
    const company = byName.get(view.name)!;
    const url = company.url;
    if (company.resume) {
      const { role, bullets } = company.resume;
      const { startLabel, endLabel, startIso, endIso } = view;
      return [{ company: view.name, url, role, team: null, bullets, startLabel, endLabel, startIso, endIso }];
    }
    return view.entries.map(({ role, team, bullets, startLabel, endLabel, startIso, endIso }) => ({
      company: view.name,
      url,
      role,
      team,
      bullets,
      startLabel,
      endLabel,
      startIso,
      endIso,
    }));
  });
}
