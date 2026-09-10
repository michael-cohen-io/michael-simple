// Provisions the Managed Agent behind /api/ask, once. Run it by hand with
// ANTHROPIC_API_KEY set:
//
//   bun scripts/ask-setup.ts
//
// It creates a cloud environment with no networking (the agent needs no
// tools; the page's Markdown is sent with the first question) and the
// agent itself, then prints the two IDs to put in the Vercel project as
// ASK_ENVIRONMENT_ID and ASK_AGENT_ID. Agents are versioned: to change the
// prompt later, update the agent (`ant beta:agents update`), do not create
// another one.

import Anthropic from "@anthropic-ai/sdk";

import { ASK_MODEL, ASK_SYSTEM } from "@/lib/ask";

const client = new Anthropic();

const environment = await client.beta.environments.create({
  name: "michaelcohen.io ask",
  config: { type: "cloud", networking: { type: "unrestricted" } },
});

const agent = await client.beta.agents.create({
  name: "michaelcohen.io ask",
  description: "Answers visitors' questions about Michael Cohen from his site's own Markdown.",
  model: ASK_MODEL,
  system: ASK_SYSTEM,
  tools: [],
});

console.log(`ASK_ENVIRONMENT_ID=${environment.id}`);
console.log(`ASK_AGENT_ID=${agent.id}   # version ${agent.version}`);
