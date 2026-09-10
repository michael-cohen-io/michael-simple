/**
 * A company named in the hero, linked to its site. Underlined at rest, not
 * only on hover, so the link reads as one without colour and on touch
 * screens; the inline padding widens the tap target without moving text.
 */
function Employer({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="py-2 font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
    >
      {children}
    </a>
  );
}

/**
 * The hero: one sentence saying who and what. The résumé link lives in the
 * Work section and the email in Connect, so nothing is repeated up here.
 * Everything here is plain markup rendered on the server.
 */
export default function About() {
  return (
    <div className="flex w-full flex-col gap-6 px-1 xl:px-0">
      {/* Light weight and a prose measure keep the blurb from being the
          heaviest thing on the page; the chip and the pink names carry it.
          md:leading-8 is the 2rem line-height text-2xl always had here: under
          Tailwind 3 the responsive font size reset it, so leading-snug only
          ever applied on phones. */}
      <p className="max-w-prose text-pretty text-xl font-light leading-snug md:text-2xl md:leading-8">
        {/* The chip is sized relative to the sentence so it reads as a word
            in it rather than the heaviest thing on the screen. */}
        <code className="whitespace-nowrap rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-[0.8em] font-semibold">
          Hello, World!
        </code>{" "}
        I&apos;m Michael Cohen, a Member of Technical Staff at{" "}
        <Employer href="https://www.anthropic.com">Anthropic</Employer>,
        currently on the Agentic Systems team building{" "}
        <Employer href="https://claude.com/blog/claude-managed-agents">
          Claude Managed Agents
        </Employer>
        .
      </p>
    </div>
  );
}
