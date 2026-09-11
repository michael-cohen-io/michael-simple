/**
 * Party Mode: the one thing the "Ask Claude about me" agent can do to the page
 * besides answer. The agent has a custom, client-side tool, `restyle_page`;
 * when it calls the tool the Vercel Function (api/ask.ts) validates the
 * input against this catalog, tells the agent it is applied, and hands the
 * effects to the browser, which applies them (src/components/party/party.tsx).
 * Follow-ups ("now in French", "make the headings dance") are turns of the
 * same Managed Agents session, so the agent composes on what is active.
 *
 * The catalog is the whole safety story: the agent picks from enums and
 * supplies strings that only ever become text nodes. It never writes CSS,
 * selectors or markup, and nothing here is persisted or shared between
 * visitors.
 */

export const SCHEMES = ["default", "light", "dark", "party"] as const;
export const MOTIONS = ["none", "dance", "bounce", "spin", "rainbow"] as const;
export const TARGETS = ["headings", "links", "cards", "everything"] as const;
export const TEXT_TRANSFORMS = ["none", "lowercase", "uppercase", "capitalize"] as const;
export const FONTS = ["default", "mono", "serif", "comic"] as const;

export type Scheme = (typeof SCHEMES)[number];
export type Motion = (typeof MOTIONS)[number];
export type Target = (typeof TARGETS)[number];
export type TextTransform = (typeof TEXT_TRANSFORMS)[number];
export type Font = (typeof FONTS)[number];

/** One tool call's worth of changes; each field is optional and merges over what is active. */
export type Effects = {
  /** Start over before applying the rest. */
  reset?: boolean;
  /** The accent hue, 0 to 360; the whole palette follows it. */
  hue?: number;
  scheme?: Scheme;
  /** Per target; `none` stops that target. */
  motion?: Partial<Record<Target, Motion>>;
  confetti?: boolean;
  text?: TextTransform;
  font?: Font;
  /** Visible strings to swap, in place, wherever they appear on the page. */
  replace?: { from: string; to: string }[];
  /** A short line that scrolls across the top of the page; empty removes it. */
  banner?: string;
};

export const MAX_REPLACEMENTS = 400;
export const MAX_REPLACEMENT_LENGTH = 1000;
export const MAX_BANNER_LENGTH = 120;
/** The page's visible text runs, as the browser sends them with a question. */
export const MAX_RUNS = 500;
export const MAX_RUN_LENGTH = 1000;

export const PARTY_TOOL = {
  type: "custom" as const,
  name: "restyle_page",
  description: [
    "Changes how michaelcohen.io looks for this visitor, right now, in their browser. Use it whenever the visitor asks for Party Mode or for any visual change: colours, motion, letter case, fonts, a banner, or the page in another language.",
    "Every field is optional and merges over what is already active, so a follow-up only needs the fields that change; `reset: true` starts over first.",
    "Party Mode is: scheme \"party\", a fresh hue, confetti, headings dancing, and a short banner. A hue alone (with scheme \"default\" or the visitor's light/dark) recolours the whole page steadily; scheme \"party\" cycles it.",
    "To translate or rewrite the page's text, call first with `list_text: true`: the result lists every visible text run on the page, numbered, exactly as the visitor sees it now. Then call again with `replace`, one pair per run in the same order (`from` is the run verbatim, `to` its new text), covering every run that has words in it, including headings, labels, dates and every bullet. Keep names, companies, product names and URLs as they are. Pairs apply in order on top of what is active, so a later rewrite works from the runs as they read then.",
    "The tool returns what is active afterwards. Reply to the visitor in one short sentence, in the page's new language if you changed it; do not describe every field.",
  ].join(" "),
  input_schema: {
    type: "object" as const,
    properties: {
      list_text: { type: "boolean", description: "Return every visible text run on the page, numbered, instead of changing anything else in this call." },
      reset: { type: "boolean", description: "Start over before applying the rest." },
      hue: { type: "number", minimum: 0, maximum: 360, description: "Accent hue in degrees; the palette follows it." },
      scheme: { type: "string", enum: [...SCHEMES], description: "party cycles the hue; default returns to the visitor's theme." },
      motion: {
        type: "object",
        description: "Animation per target; none stops that target.",
        properties: Object.fromEntries(TARGETS.map((target) => [target, { type: "string", enum: [...MOTIONS] }])),
        additionalProperties: false,
      },
      confetti: { type: "boolean" },
      text: { type: "string", enum: [...TEXT_TRANSFORMS], description: "Letter case for the whole page." },
      font: { type: "string", enum: [...FONTS] },
      replace: {
        type: "array",
        maxItems: MAX_REPLACEMENTS,
        description: "Visible strings to swap, from and to, wherever they appear.",
        items: {
          type: "object",
          properties: { from: { type: "string" }, to: { type: "string" } },
          required: ["from", "to"],
          additionalProperties: false,
        },
      },
      banner: { type: "string", maxLength: MAX_BANNER_LENGTH, description: "A short line across the top; empty removes it." },
    },
    additionalProperties: false,
  },
};

function oneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && (options as readonly string[]).includes(value);
}

/**
 * The tool input as validated Effects, or a message for the agent saying
 * what was wrong (fail closed: nothing of a bad call is applied).
 */
export function validateEffects(input: unknown): { effects: Effects; listText: boolean } | { error: string } {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return { error: "Input must be an object." };
  const raw = input as Record<string, unknown>;
  const effects: Effects = {};
  let listText = false;
  for (const key of Object.keys(raw)) {
    const value = raw[key];
    if (value === undefined || value === null) continue;
    switch (key) {
      case "list_text":
        if (typeof value !== "boolean") return { error: "list_text must be a boolean." };
        listText = value;
        break;
      case "reset":
      case "confetti":
        if (typeof value !== "boolean") return { error: `${key} must be a boolean.` };
        effects[key] = value;
        break;
      case "hue":
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 360) {
          return { error: "hue must be a number from 0 to 360." };
        }
        effects.hue = Math.round(value);
        break;
      case "scheme":
        if (!oneOf(value, SCHEMES)) return { error: `scheme must be one of ${SCHEMES.join(", ")}.` };
        effects.scheme = value;
        break;
      case "text":
        if (!oneOf(value, TEXT_TRANSFORMS)) return { error: `text must be one of ${TEXT_TRANSFORMS.join(", ")}.` };
        effects.text = value;
        break;
      case "font":
        if (!oneOf(value, FONTS)) return { error: `font must be one of ${FONTS.join(", ")}.` };
        effects.font = value;
        break;
      case "motion": {
        if (typeof value !== "object" || value === null || Array.isArray(value)) return { error: "motion must be an object." };
        const motion: Partial<Record<Target, Motion>> = {};
        for (const [target, name] of Object.entries(value as Record<string, unknown>)) {
          if (!oneOf(target, TARGETS)) return { error: `motion targets are ${TARGETS.join(", ")}.` };
          if (!oneOf(name, MOTIONS)) return { error: `motions are ${MOTIONS.join(", ")}.` };
          motion[target] = name;
        }
        effects.motion = motion;
        break;
      }
      case "replace": {
        if (!Array.isArray(value)) return { error: "replace must be an array of {from, to}." };
        if (value.length > MAX_REPLACEMENTS) return { error: `replace takes at most ${MAX_REPLACEMENTS} pairs.` };
        const pairs: { from: string; to: string }[] = [];
        for (const pair of value as unknown[]) {
          const { from, to } = (pair ?? {}) as { from?: unknown; to?: unknown };
          if (typeof from !== "string" || typeof to !== "string") return { error: "each replace pair needs string from and to." };
          if (from.trim().length === 0) return { error: "a replace pair's from must not be empty." };
          if (from.length > MAX_REPLACEMENT_LENGTH || to.length > MAX_REPLACEMENT_LENGTH) {
            return { error: `replace strings are at most ${MAX_REPLACEMENT_LENGTH} characters.` };
          }
          pairs.push({ from, to });
        }
        effects.replace = pairs;
        break;
      }
      case "banner":
        if (typeof value !== "string") return { error: "banner must be a string." };
        if (value.length > MAX_BANNER_LENGTH) return { error: `banner is at most ${MAX_BANNER_LENGTH} characters.` };
        effects.banner = value.trim();
        break;
      default:
        return { error: `Unknown field ${key}.` };
    }
  }
  return { effects, listText };
}

/** The text runs a browser sends: strings, trimmed, deduplicated, capped. */
export function validateRuns(input: unknown): { runs: string[] } | { error: string } {
  if (input === undefined) return { runs: [] };
  if (!Array.isArray(input)) return { error: "runs must be an array of strings." };
  if (input.length > MAX_RUNS) return { error: `runs takes at most ${MAX_RUNS} strings.` };
  const runs: string[] = [];
  for (const run of input as unknown[]) {
    if (typeof run !== "string") return { error: "runs must be an array of strings." };
    if (run.length > MAX_RUN_LENGTH) return { error: `each run is at most ${MAX_RUN_LENGTH} characters.` };
    const trimmed = run.trim();
    if (trimmed && !runs.includes(trimmed)) runs.push(trimmed);
  }
  return { runs };
}

/** What is active after `next` lands on `active`: fields override, motion merges, replacements accumulate in order. */
export function mergeEffects(active: Effects, next: Effects): Effects {
  const base: Effects = next.reset ? {} : { ...active };
  const merged: Effects = { ...base, ...next };
  delete merged.reset;
  if (next.motion) merged.motion = { ...base.motion, ...next.motion };
  if (next.replace) merged.replace = [...(base.replace ?? []), ...next.replace];
  if (next.banner === "") delete merged.banner;
  return merged;
}

/** True when anything is active, so the page offers a way out. */
export function isActive(effects: Effects): boolean {
  return Object.keys(effects).length > 0;
}
