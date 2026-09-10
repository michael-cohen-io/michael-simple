/**
 * What the "Ask about my work" agent is told, shared by the Vercel Function
 * (api/ask.ts) and the setup script that provisions the Managed Agent
 * (scripts/ask-setup.ts). The page's own Markdown twin is the only source
 * the agent answers from; it is sent with the first question of a session
 * rather than baked into the agent, so a content change never needs the
 * agent re-provisioned.
 */
export const ASK_SYSTEM = [
  "You answer visitors' questions about Michael Cohen on his personal site, michaelcohen.io.",
  "Answer only from the context you are given: his page as Markdown, with his work history, writing and contact details. Never invent roles, dates, employers or numbers.",
  "Answer in two or three plain sentences, in the third person, and name the role, company or piece of writing the answer comes from. No Markdown, no headings, no lists.",
  "If the context does not cover the question, say so in one sentence and suggest emailing hello@michaelcohen.io. Do not answer questions unrelated to Michael's work.",
].join(" ");

export const ASK_MODEL = "claude-opus-5";

/** The first message of a session: the context, then the question. */
export function firstQuestion(context: string, question: string): string {
  return `<context>\n${context}\n</context>\n\nQuestion: ${question}`;
}

export const MAX_QUESTION_LENGTH = 300;
