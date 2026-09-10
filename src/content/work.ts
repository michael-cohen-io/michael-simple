import type { Company } from "./types";

/**
 * Where I have worked, one company per item with its roles, transcribed
 * verbatim from the production database on 2026-09-09 (the Anthropic entry
 * was rewritten on 2026-09-10 to cover the work since). Order does not
 * matter: companies and roles are sorted newest first when the page is built,
 * and each company's date range is derived from its roles (see lib/work.ts).
 */
export const companies: Company[] = [
  {
    name: "Anthropic",
    url: "https://anthropic.com/",
    logo: "/anthropic.svg",
    logoDark: "/anthropic_dark.svg",
    entries: [
      {
        team: "Agentic Systems Team",
        role: "Member of Technical Staff",
        start: "2024-08",
        end: null,
        bullets: [
          "Tech lead for the Agentic Systems team and lead engineer on [Claude Managed Agents](https://claude.com/blog/claude-managed-agents), built from scratch to public beta in April 2026: Anthropic's hosted runtime for long-running agents, with sessions, sandboxes, vaults, memory, outcomes and multiagent orchestration, in production at _Notion, Rakuten, Asana, Sentry and Atlassian_.",
          "Had a hand in every capability the platform has shipped, from the core session, harness and sandbox primitives to the [outcomes, multiagent orchestration, dreaming and webhooks](https://claude.com/blog/new-in-claude-managed-agents) launched at Code with Claude 2026.",
          "Co-authored [Scaling Managed Agents: Decoupling the brain from the hands](https://www.anthropic.com/engineering/managed-agents), the engineering post whose brain / hands / session split is now widely cited as the reference architecture for agent runtimes ([InfoQ](https://www.infoq.com/news/2026/04/anthropic-managed-agents/), [DEV](https://dev.to/sangrokjung/anthropic-managed-agents-architecture-decoupling-brain-from-hands-for-scalable-ai-agents-295k)).",
          "Moved the harness out of the execution container: _~60% lower median and >90% lower p95_ time to first token, with credentials never entering the sandbox.",
        ],
      },
    ],
  },
  {
    name: "OpenSea",
    url: "https://opensea.io/",
    logo: "/opensea.svg",
    entries: [
      {
        team: "Creator Team",
        role: "Engineering Manager",
        start: "2022-08",
        end: "2023-12",
        bullets: [
          "Bootstrapped and directly managed 6 engineers (FS + BE) focused on building products and tools for creators.",
          "Led a team of 4 engineers in the development of [Primary Drops](https://opensea.io/blog/articles/drops-on-opensea-an-immersive-and-secure-minting-experience), a 0 → 1 NFT creation platform with over _$25M+ [GMV](https://dune.com/opensea_team/seadrop/917eba23-5979-4740-8884-d97c03a7bee9)_ and _$2M+ revenue_ to date, grew from _0% to ~15% [market share](https://dune.com/opensea_team/primary-drop-mints-segment-share/1071104b-2276-469d-aa3a-aa34589ad77c?Filter_e5035c=)_.",
          "Shipped [OpenSea Studio](https://opensea.io/blog/articles/introducing-opensea-studio), a one-stop shop, no-code solution for creators to build & manage their NFT projects from scratch, with over _12 million NFTs_ _created across 25K collections_ to date on the platform.",
          "Shipped new [collection pages](https://opensea.io/blog/articles/new-opensea-collection-pages), rich storytelling for creators through a feature rich page editor.",
          "Collaborated with high-profile marquee partners (_Nike, Puma, Adidas, Haas, [Hugo Boss](https://opensea.io/blog/articles/imaginary-ones-hugo-drop)_) to launch their NFT projects.",
          "Served as team’s TL and set the technical direction, authored/reviewed engineering RFCs, and set up operational processes and standards.",
          "Worked cross functionally with BD, marketing, ops, legal, and finance on partnerships, deal negotiations, and product launches.",
        ],
      },
      {
        team: "Platform Team",
        role: "Senior Software Engineer",
        start: "2021-06",
        end: "2022-08",
        bullets: [
          "Drove critical enhancements in OpenSea's platform during a period of hyperscale, significantly contributing to its GMV growth, which currently sits at [$35 billion](https://dune.com/opensea_team/OpenSea-Key-Metrics).",
          "Led the scaling, migration, and [documentation rewrite](https://docs.opensea.io/reference/api-overview) of the public REST API, introduced a new Elixir-based [stream API](https://docs.opensea.io/reference/stream-api-overview), and integrated advanced queuing systems for robust scalability.",
          "Implemented spam detection for blockchain NFT mints and facilitated the [integration of the Solana blockchain](https://opensea.io/blog/articles/check-out-solana-in-beta-on-opensea) into the marketplace, broadening platform capabilities while increasing the stability of our infrastructure.",
        ],
      },
    ],
  },
  {
    name: "Amazon",
    url: "https://www.amazon.com/",
    logo: "/amazon.svg",
    entries: [
      {
        team: "Amazon Live: FireTV",
        role: "Software Engineer",
        start: "2020-06",
        end: "2021-06",
        bullets: [
          "Lead the Amazon Live FireTV team as its frontend lead. Oversaw the complete redesign of the existing Amazon Shopping app on FireTV to transform it to a livestream-centric experience.",
          "Upgraded the existing Android / FireTV app to use modern Android architecture and features. This vastly improved the performance of the app with decreased load time and a smoother UX.",
          "Introduced key livestream viewing features to FireTV users that include a chat sidebar and an improved product carousel.",
        ],
      },
      {
        team: "Amazon Live: Creator",
        role: "Software Engineer",
        start: "2018-09",
        end: "2020-06",
        bullets: [
          "Served as a Fullstack Engineer for Amazon Live, Amazon's shoppable livestreaming platform. Developed features for the iOS Creator app, across the data layer, APIs, and the front-end. This tool enables our creators to livestream to the Amazon Live platform.",
          "Designed and executed Influencer login for the creator app. This allowed Influencers to earn commissions on their livestreams and rise through tiering levels within Amazon Live. This gamification gave Influencers the ability to boost sales and increased the creator count in our program from under 2K to over 15K.",
        ],
      },
      {
        team: "AWS Elastic Block Store",
        role: "Software Engineer",
        start: "2018-03",
        end: "2018-09",
        bullets: [
          "Oversaw operations for the API services of AWS Backup Service (ABS), a highly scaled distributed system with $2.9 billion in revenue in 2017",
          "Facilitated the development of Data Lifecycle Manager for ABS: a new product that allows customers to automate the process of backing up data stored on EBS volumes by creating policies based on AWS tags",
        ],
      },
      {
        team: "Prime Pantry",
        role: "Software Engineering Intern",
        start: "2017-05",
        end: "2017-08",
        bullets: [
          "Designed and implemented a web tool for the Prime Pantry team",
          "Reconstructed the mapping-update process between customers and Amazon fulfillment centers, reducing the execution time from days to minutes.",
        ],
      },
    ],
  },
  {
    name: "IBM",
    url: "https://www.ibm.com/us-en",
    logo: "/ibm.svg",
    entries: [
      {
        team: "Watson Research",
        role: "Software Engineering Intern",
        start: "2016-05",
        end: "2016-08",
        bullets: [
          "Developed a highly concurrent DRAM memory and memory controller simulator used as part of an ongoing project with the Department of Energy.",
          "Researched performance and modeling errors for existing open-source memory simulators.",
        ],
      },
    ],
  },
  {
    name: "Nielsen",
    url: "https://www.nielsen.com/",
    entries: [
      {
        team: "Open API Platform",
        role: "Software Engineering Intern",
        start: "2015-05",
        end: "2015-08",
        bullets: [
          "Assisted in developing the API platform for Nielsen’s data resources by implementing two unique APIs for the Nielsen Open API Platform.",
          "Created profit-producing partnerships for Nielsen through the development of web-apps, which showcased the usage of Nielsen APIs.",
        ],
      },
    ],
  },
];
