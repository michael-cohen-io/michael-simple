import Link from "next/link";

import { resume } from "@/content/resume";
import { companies } from "@/content/work";
import { RESUME } from "@/lib/site";
import { companyViews, monthLabel } from "@/lib/work";

import { SectionHeading } from "../typography/heading";
import { WorkAccordion } from "./WorkAccordion";
import { WorkTimeline } from "./WorkTimeline";

// Derived once, when the module is evaluated during the build: a content
// mistake throws here and fails the build rather than shipping a blank section.
const work = companyViews(companies);

export default function Work() {
  return (
    <section
      aria-labelledby="work-heading"
      className="flex flex-col w-full gap-2"
    >
      <SectionHeading id="work-heading">Work Experience</SectionHeading>
      <p className="text-sm font-light">
        Prefer a one-pager?{" "}
        <Link
          href="/resume"
          className="underline underline-offset-4 decoration-primary/60 hover:decoration-primary"
        >
          Read the résumé
        </Link>{" "}
        or{" "}
        <a
          href={RESUME.href}
          download={RESUME.download}
          className="underline underline-offset-4 decoration-primary/60 hover:decoration-primary"
        >
          download the PDF
        </a>{" "}
        (updated {monthLabel(resume.updated)}).
      </p>
      {/* Both layouts are in the HTML; CSS shows the one that fits. */}
      <WorkAccordion companies={work} className="md:hidden" />
      <WorkTimeline companies={work} className="hidden md:block" />
    </section>
  );
}
