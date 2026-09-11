/** A name set in the accent, without a link: it is a highlight, not a destination. */
function Highlight({ children }: { children: string }) {
  return <span className="font-semibold text-primary">{children}</span>;
}

/**
 * The hero: one sentence saying who and what. Anthropic is highlighted, not
 * linked; the product is linked to its announcement. The resume link lives
 * in the Work section and the email in Connect, so nothing is repeated up
 * here. Everything here is plain markup rendered on the server.
 */
export default function About() {
  return (
    <div className="flex w-full flex-col gap-6 px-1 xl:px-0">
      {/* Light weight, one size below the name at every width, and a prose
          measure keep the blurb from being the heaviest thing on the page;
          the chip and the pink names carry it. */}
      <p className="max-w-prose text-pretty text-xl font-light leading-snug md:leading-relaxed">
        {/* The chip is a word in the sentence: mono, the sentence's own
            weight, a shade of the page behind it. */}
        <code className="whitespace-nowrap rounded-md bg-muted px-[0.35rem] py-[0.15rem] font-mono text-[0.85em] font-normal">
          Hello, World!
        </code>{" "}
        I&apos;m Michael Cohen, a Member of Technical Staff at <Highlight>Anthropic</Highlight>, currently on
        the Agentic Systems team building{" "}
        <a
          href="https://claude.com/blog/claude-managed-agents"
          className="py-2 font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
        >
          Claude Managed Agents
        </a>
        .
      </p>
    </div>
  );
}
