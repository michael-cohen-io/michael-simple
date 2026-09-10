import { companies } from "@/content/work";
import { RESUME } from "@/lib/site";
import { companyViews } from "@/lib/work";

import { SectionHeading } from "../typography/heading";
import { WorkHistory } from "./WorkHistory";

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
        <a
          href={RESUME.href}
          download={RESUME.download}
          className="py-2 underline underline-offset-4 decoration-primary/60 hover:decoration-primary"
        >
          Download the résumé (PDF)
        </a>
      </p>
      <WorkHistory companies={work} />
    </section>
  );
}
