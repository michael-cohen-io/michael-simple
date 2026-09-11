// Provisions the Managed Agent behind /api/ask, and updates it later. The
// agent's configuration is version-controlled here and in src/lib/ask.ts
// (its model and system prompt, shared with the Claude API fallback), and
// synced with `create` once and `update` thereafter, the way `ant
// beta:agents create < agent.yaml` / `ant beta:agents update` would sync a
// YAML file. Run it by hand with ANTHROPIC_API_KEY set:
//
//   bun scripts/ask-setup.ts            # create the environment and the agent
//   ASK_AGENT_ID=agent_… ASK_ENVIRONMENT_ID=env_… bun scripts/ask-setup.ts update
//
// The agent has web search and web fetch, and nothing else: no bash, no
// files. Both tools are allowed only the domains this page links to (the
// employers, the writing, the profiles), read from the same content files
// the page is built from; the environment's egress list is the same set.
// The page's Markdown still arrives with the first question, so a content
// change never needs a new agent version; a new link does (run `update`).
// The Messages fallback runs on effort "low", which the agent mirrors.
// Create prints the two IDs to put in the Vercel project as
// ASK_ENVIRONMENT_ID and ASK_AGENT_ID. Agents are versioned and sessions
// take the latest version, so a prompt change is an update of the same
// agent, never a new one.

import Anthropic from "@anthropic-ai/sdk";

import { companies } from "@/content/work";
import { writing } from "@/content/writing";
import { ASK_MODEL, ASK_SYSTEM } from "@/lib/ask";
import { PROFILES, SITE_URL, SOURCE_URL } from "@/lib/site";

/**
 * The registrable domain of every link on the page, without `www.` (a
 * listed domain covers its subdomains). Company sites and the Markdown
 * links in every bullet, the writing, the profiles, the site itself.
 */
export function pageDomains(): string[] {
  const text = JSON.stringify([companies, writing, PROFILES, SITE_URL, SOURCE_URL]);
  const hosts = new Set<string>();
  for (const [, host] of text.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)) {
    hosts.add(host.toLowerCase().replace(/^www\./, ""));
  }
  // docs.opensea.io is covered by opensea.io; keep the list to the roots.
  const roots = [...hosts].filter((host) => ![...hosts].some((other) => other !== host && host.endsWith(`.${other}`)));
  return roots.sort();
}

const client = new Anthropic();
const domains = pageDomains();

const agentConfig = {
  name: "michaelcohen.io ask",
  description: "Answers visitors' questions about Michael Cohen from his site's own Markdown and the pages it links to.",
  model: { id: ASK_MODEL, effort: "low" as const },
  system: ASK_SYSTEM,
  tools: [
    {
      type: "agent_toolset_20260401" as const,
      default_config: { enabled: false },
      configs: [
        { type: "web_search" as const, name: "web_search" as const, enabled: true, allowed_domains: domains },
        {
          type: "web_fetch" as const,
          name: "web_fetch" as const,
          enabled: true,
          allowed_domains: domains,
          max_content_tokens: 20_000,
        },
      ],
    },
  ],
};

// Web search and web fetch run on Anthropic's servers, so the environment's
// egress list does not govern them (the tool configs above do); it is the
// same set anyway, so nothing in the sandbox can reach further than the page.
const environmentConfig = {
  type: "cloud" as const,
  networking: { type: "limited" as const, allowed_hosts: domains },
};

console.log(`domains: ${domains.join(", ")}`);

if (process.argv[2] === "update") {
  const agentId = process.env.ASK_AGENT_ID;
  const environmentId = process.env.ASK_ENVIRONMENT_ID;
  if (!agentId || !environmentId) throw new Error("Set ASK_AGENT_ID and ASK_ENVIRONMENT_ID to update.");
  await client.beta.environments.update(environmentId, { config: environmentConfig });
  const current = await client.beta.agents.retrieve(agentId);
  // The version is an optimistic lock: the update fails if someone else moved it.
  const agent = await client.beta.agents.update(agentId, { ...agentConfig, version: current.version });
  console.log(`ASK_ENVIRONMENT_ID=${environmentId}   # networking updated`);
  console.log(`ASK_AGENT_ID=${agent.id}   # version ${current.version} -> ${agent.version}`);
} else {
  const environment = await client.beta.environments.create({ name: "michaelcohen.io ask", config: environmentConfig });
  const agent = await client.beta.agents.create(agentConfig);
  console.log(`ASK_ENVIRONMENT_ID=${environment.id}`);
  console.log(`ASK_AGENT_ID=${agent.id}   # version ${agent.version}`);
}
