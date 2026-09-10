import { CONTACT_EMAIL } from "@/lib/site";

/**
 * Everything on the résumé PDF that is not the work history. The history
 * itself comes from ./work.ts, curated by the `resume` fields there, so the
 * PDF (public/MichaelCohenResume.pdf, built by scripts/build-resume.tsx on
 * every `bun run build`) can never drift from the site.
 *
 * This file is public, like the PDF: no phone number, no street address.
 */
export type Resume = {
  name: string;
  location: string;
  email: string;
  /** Shown without its scheme; linked with it. */
  site: string;
  /** `when` is the label on the PDF; `graduated` is the same month as YYYY-MM for resume.json. */
  education: { school: string; degree: string; when: string; graduated: string }[];
  skills: { label: string; items: string[] }[];
};

export const resume: Resume = {
  name: "Michael Cohen",
  location: "New York, NY",
  email: CONTACT_EMAIL,
  site: "https://michaelcohen.io",
  education: [
    {
      school: "University of Florida",
      degree: "B.S. in Computer Science Engineering",
      when: "December 2017",
      graduated: "2017-12",
    },
  ],
  skills: [
    {
      label: "Languages & Frameworks",
      items: ["Python", "Java", "TypeScript", "React", "NodeJS", "Elixir", "Solidity", "Go"],
    },
    {
      label: "Expertise",
      items: [
        "Distributed Systems",
        "Backend Development",
        "Frontend Development",
        "Full Stack Web Development",
        "Mobile Applications (iOS / Android)",
        "Cloud & Serverless Architecture",
        "Smart Contract Development",
      ],
    },
  ],
};
