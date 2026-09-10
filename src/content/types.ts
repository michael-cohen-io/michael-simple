/**
 * The shape of the work history in ./work.ts. The file is the source of
 * truth: it is imported at build time and the page is rendered from it, so a
 * content change is a commit and a redeploy, nothing else.
 */

/** A month, written `YYYY-MM`. */
export type Month = string;

/**
 * How a role appears on the one-page resume PDF, which is generated from this
 * same file (see scripts/build-resume.tsx). Leave it out and the role is
 * copied to the PDF as is; `false` leaves it off; `{ bullets }` swaps in
 * shorter bullets for the PDF while the site keeps the full ones.
 */
export type EntryResume = false | { bullets: string[] };

/**
 * The same choice for a whole company. `{ role, bullets }` folds every role
 * there into one block under that title, spanning the company's tenure.
 */
export type CompanyResume = false | { role: string; bullets: string[] };

/** One role held at a company. */
export type Entry = {
  team: string;
  role: string;
  start: Month;
  /** null while the role is ongoing. */
  end: Month | null;
  /**
   * One bullet per item, each a short paragraph of Markdown. Inline links
   * (`[text](https://…)`) and emphasis are rendered; anything else is shown
   * as plain text.
   */
  bullets: string[];
  resume?: EntryResume;
};

export type Company = {
  name: string;
  /** The company's site, linked from its name. */
  url: string;
  /**
   * Path under public/ of the mark shown next to the name. Leave it out and
   * the company's initial is shown in its place.
   */
  logo?: string;
  /** A variant for the dark theme, when the light one does not read on it. */
  logoDark?: string;
  entries: Entry[];
  resume?: CompanyResume;
};
