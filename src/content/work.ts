import type { Company } from "./types";

/**
 * Where I have worked, one company per item with its roles. Order does not
 * matter: companies and roles are sorted newest first when the page is built,
 * and each company's date range is derived from its roles (see lib/work.ts).
 */
export const companies: Company[] = [
  {
    name: "Anthropic",
    url: "https://anthropic.com",
    logo: "/anthropic.svg",
    logoDark: "/anthropic_dark.svg",
    entries: [
      {
        team: "API Team",
        role: "Member of Technical Staff",
        start: "2024-08",
        end: null,
        bullets: [
          "Developing new product features and improvements for [Anthropic's API](https://docs.anthropic.com).",
        ],
      },
    ],
  },
  {
    name: "OpenSea",
    url: "https://opensea.io",
    logo: "/opensea.svg",
    entries: [
      {
        team: "Creator Team",
        role: "Engineering Manager",
        start: "2022-08",
        end: "2023-12",
        bullets: [
          "Hired and managed 6 engineers (FE + BE) focused on creator products/tools.",
          "Led team in developing Primary Drops, a $30M+ GMV NFT creation platform, grew from 0% to ~30% market share.",
          "Shipped Creator Studio, a one-stop shop, no-code solution for creators to build & manage 16+ million NFTs created across 11K collections to date.",
        ],
      },
      {
        team: "Platform Team",
        role: "Senior Software Engineer",
        start: "2021-06",
        end: "2022-08",
        bullets: [
          "Enhanced OpenSea's platform by introducing scalable architecture improvements; directly contributed to a 50% increase in uptime.",
          "Led the scaling, migration, and documentation rewrite of the public REST API, introduced a new Websocket API.",
          "Developed a robust spam detection algorithm for NFT mints, cutting down fake NFT listings by 75%.",
        ],
      },
    ],
  },
  {
    name: "Amazon",
    url: "https://amazon.com",
    logo: "/amazon.svg",
    entries: [
      {
        team: "AWS Backup / Amazon Live",
        role: "Software Engineer",
        start: "2018-03",
        end: "2021-06",
        bullets: [
          "Led development of Data Lifecycle Manager for AWS Backup Service, automating backup policies for data stored on EBS volumes.",
          "Built full-stack features for iOS Creator app and led FireTV project.",
          "Implemented gamification features for Amazon Live platform, growing creator base from under 2K to over 15K creators.",
        ],
      },
    ],
  },
];
