import type { Month } from "./types";

/**
 * Writing and talks: the public work behind the work history. Rendered
 * under it on the site, into llms.txt and into resume.json, from this one
 * list, newest first. Each piece is a title, where it appeared, and when.
 */
export type Piece = {
  title: string;
  /** Where the piece lives. */
  url: string;
  /** The publication, event or channel, as it should read on the page. */
  venue: string;
  /** When it appeared, as YYYY-MM. */
  date: Month;
  /** "article", "talk" or "video"; talks and videos show a play mark. */
  kind: "article" | "talk" | "video";
};

export const writing: Piece[] = [
  {
    title: "How to get to production faster with Claude Managed Agents",
    url: "https://claude.com/code-with-claude/session/ldn-how-to-get-to-production-faster-with-claude-managed-agents",
    venue: "Code with Claude, London",
    date: "2026-05",
    kind: "talk",
  },
  {
    title: "New in Claude Managed Agents: outcomes, multiagent orchestration, dreaming and webhooks",
    url: "https://claude.com/blog/new-in-claude-managed-agents",
    venue: "Claude blog",
    date: "2026-05",
    kind: "article",
  },
  {
    title: "Scaling Managed Agents: Decoupling the brain from the hands",
    url: "https://www.anthropic.com/engineering/managed-agents",
    venue: "Anthropic Engineering",
    date: "2026-04",
    kind: "article",
  },
];
