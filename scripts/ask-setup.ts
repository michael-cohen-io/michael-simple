// Provisions the Managed Agent behind /api/ask, and updates it later. The
// agent's configuration is version-controlled here and in src/lib/ask.ts
// (its model and system prompt, shared with the Claude API fallback), and
// synced with `create` once and `update` thereafter, the way `ant
// beta:agents create < agent.yaml` / `ant beta:agents update` would sync a
// YAML file. Run it by hand with ANTHROPIC_API_KEY set:
//
//   bun scripts/ask-setup.ts            # create the environment and the agent
//   ASK_AGENT_ID=agent_… bun scripts/ask-setup.ts update   # new agent version
//
// The environment is a cloud sandbox with no network egress: the agent has
// no tools, the page's Markdown arrives with the first question, and the
// Messages fallback runs on effort "low", which the agent mirrors. Create
// prints the two IDs to put in the Vercel project as ASK_ENVIRONMENT_ID and
// ASK_AGENT_ID. Agents are versioned and sessions take the latest version,
// so a prompt change is an update of the same agent, never a new one.

import Anthropic from "@anthropic-ai/sdk";

import { ASK_MODEL, ASK_SYSTEM } from "@/lib/ask";

const client = new Anthropic();

const agentConfig = {
  name: "michaelcohen.io ask",
  description: "Answers visitors' questions about Michael Cohen from his site's own Markdown.",
  model: { id: ASK_MODEL, effort: "low" as const },
  system: ASK_SYSTEM,
  tools: [],
};

if (process.argv[2] === "update") {
  const id = process.env.ASK_AGENT_ID;
  if (!id) throw new Error("Set ASK_AGENT_ID to the agent to update.");
  const current = await client.beta.agents.retrieve(id);
  // The version is an optimistic lock: the update fails if someone else moved it.
  const agent = await client.beta.agents.update(id, { ...agentConfig, version: current.version });
  console.log(`ASK_AGENT_ID=${agent.id}   # version ${current.version} -> ${agent.version}`);
} else {
  const environment = await client.beta.environments.create({
    name: "michaelcohen.io ask",
    config: { type: "cloud", networking: { type: "limited", allowed_hosts: [] } },
  });
  const agent = await client.beta.agents.create(agentConfig);
  console.log(`ASK_ENVIRONMENT_ID=${environment.id}`);
  console.log(`ASK_AGENT_ID=${agent.id}   # version ${agent.version}`);
}
