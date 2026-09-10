/**
 * Writing and talks: the public work behind the hero sentence. Rendered
 * under the hero on the site, and into index.md and llms.txt, from this one
 * list. Newest first, no dates on the page: a piece is listed because it is
 * still worth reading, not because of when it appeared.
 */
export type Piece = {
  title: string;
  /** Where the piece lives. */
  url: string;
  /** The publication, event or channel, as it should read on the page. */
  venue: string;
  /** One line: what it is and why it matters. */
  summary: string;
  /** "article", "talk" or "video"; talks and videos show a play mark. */
  kind: "article" | "talk" | "video";
};

export const writing: Piece[] = [
  {
    title: "Scaling Managed Agents: Decoupling the brain from the hands",
    url: "https://www.anthropic.com/engineering/managed-agents",
    venue: "Anthropic Engineering",
    summary:
      "The architecture of Claude Managed Agents: the model, the harness and the sandbox as separate parts, and why. Now the reference design for agent runtimes.",
    kind: "article",
  },
  {
    title: "New in Claude Managed Agents: outcomes, multiagent orchestration, dreaming and webhooks",
    url: "https://claude.com/blog/new-in-claude-managed-agents",
    venue: "Claude blog, Code with Claude 2026",
    summary: "The capabilities launched at Code with Claude 2026, every one of them with my hands on it.",
    kind: "article",
  },
  {
    title: "How to get to production faster with Claude Managed Agents",
    url: "https://claude.com/code-with-claude/session/ldn-how-to-get-to-production-faster-with-claude-managed-agents",
    venue: "Code with Claude, London, 2026",
    summary:
      "A session with Harrison Stall on taking an agent from prototype to production on the Managed Agents platform.",
    kind: "talk",
  },
];
