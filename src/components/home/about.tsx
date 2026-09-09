import { Download, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, RESUME } from "@/lib/site";

/** A company named in the hero, linked to its site. */
function Employer({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="font-semibold text-primary underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

/**
 * The hero: who, what, where and for whom, then the two things a visitor most
 * likely came to do. Everything here is plain markup rendered on the server.
 */
export default function About() {
  return (
    <div className="flex w-full flex-col gap-6 px-1 xl:px-0">
      {/* Light weight and a prose measure keep the blurb from being the
          heaviest thing on the page; the chip and the pink names carry it.
          md:leading-8 is the 2rem line-height text-2xl always had here: under
          Tailwind 3 the responsive font size reset it, so leading-snug only
          ever applied on phones. */}
      <p className="max-w-prose text-xl font-light leading-snug md:text-2xl md:leading-8">
        <code className="rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-base font-semibold md:text-lg">
          Hello, World!
        </code>{" "}
        I&apos;m Michael Cohen, a software engineer on the API team at{" "}
        <Employer href="https://www.anthropic.com">Anthropic</Employer>, based
        in Brooklyn, NY. Before that I led the Creator team at{" "}
        <Employer href="https://opensea.io">OpenSea</Employer> and built AWS
        Backup and Amazon Live at{" "}
        <Employer href="https://www.amazon.com">Amazon</Employer>.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <a href={RESUME.href} download={RESUME.download}>
            <Download aria-hidden="true" className="mr-2 h-4 w-4" />
            Download résumé (PDF)
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href={`mailto:${CONTACT_EMAIL}`}>
            <Mail aria-hidden="true" className="mr-2 h-4 w-4" />
            Email me
          </a>
        </Button>
      </div>
    </div>
  );
}
