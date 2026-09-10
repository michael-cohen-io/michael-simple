import { Download } from "lucide-react";
import type { Metadata } from "next";

import { Markdown } from "@/components/typography/markdown";
import { Button } from "@/components/ui/button";
import { resume } from "@/content/resume";
import { companies } from "@/content/work";
import { type ResumeBlock, resumeBlocks } from "@/lib/resume";
import { RESUME, SITE_NAME } from "@/lib/site";
import { monthLabel } from "@/lib/work";

export const metadata: Metadata = {
  title: "Résumé",
  description: `${SITE_NAME}'s résumé: work experience, education and skills, with a one-page PDF to download.`,
  alternates: { canonical: "/resume" },
};

// The same blocks the PDF is rendered from (scripts/build-resume.tsx), so the
// two can never disagree. Derived once, at build time.
const blocks = resumeBlocks(companies);
const updated = monthLabel(resume.updated);

/** "Aug 2024 – Present" with each month a <time>. */
function Dates({ block }: { block: ResumeBlock }) {
  return (
    <p className="shrink-0 text-sm text-muted-foreground">
      <time dateTime={block.startIso}>{block.startLabel}</time>
      {" – "}
      {block.endIso ? <time dateTime={block.endIso}>{block.endLabel}</time> : block.endLabel}
    </p>
  );
}

function Block({ block }: { block: ResumeBlock }) {
  return (
    <li className="space-y-1 print:break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="text-lg font-semibold leading-tight">
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
          >
            {block.company}
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        </h3>
        <Dates block={block} />
      </div>
      <p className="text-sm">
        <span className="font-semibold text-primary">{block.role}</span>
        {block.team && <span className="text-muted-foreground"> · {block.team}</span>}
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {block.bullets.map((bullet, index) => (
          <li key={index}>
            <Markdown>{bullet}</Markdown>
          </li>
        ))}
      </ul>
    </li>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-4 print:space-y-2">
      <h2 id={id} className="border-b pb-1 text-xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * The résumé as a page: the PDF's content in the site's chrome, printable
 * on one Letter sheet (the print rules in globals.css drop the header and
 * footer for this page). The PDF stays the download; this is the version
 * a link can point into and a crawler can read.
 */
export default function ResumePage() {
  return (
    <article data-resume className="flex flex-col gap-10 pt-8 md:pt-12 print:gap-4 print:pt-0">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold">Résumé</h2>
          <p className="text-sm text-muted-foreground">
            {resume.location} · {resume.email} · {resume.site.replace(/^https?:\/\//, "")}
            <span className="print:hidden"> · Updated {updated}</span>
          </p>
        </div>
        <Button asChild className="print:hidden">
          <a href={RESUME.href} download={RESUME.download}>
            <Download aria-hidden="true" className="mr-2 h-4 w-4" />
            Download PDF
          </a>
        </Button>
      </header>

      <Section id="resume-work" title="Work Experience">
        <ol className="space-y-6 print:space-y-3">
          {blocks.map((block) => (
            <Block key={`${block.company}-${block.startIso}-${block.team ?? ""}`} block={block} />
          ))}
        </ol>
      </Section>

      <Section id="resume-education" title="Education">
        <ul className="space-y-3">
          {resume.education.map((item) => (
            <li key={item.school} className="space-y-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-tight">{item.school}</h3>
                <p className="shrink-0 text-sm text-muted-foreground">{item.when}</p>
              </div>
              <p className="text-sm font-semibold text-primary">{item.degree}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="resume-skills" title="Skills">
        <dl className="space-y-2 text-sm">
          {resume.skills.map((group) => (
            <div key={group.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 font-semibold">{group.label}:</dt>
              <dd>{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <p className="text-sm text-muted-foreground print:hidden">
        Generated from the same content as the site; last updated {updated}.
      </p>
    </article>
  );
}
