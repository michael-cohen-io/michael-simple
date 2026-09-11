"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef } from "react";

import { MAX_RUNS, TARGETS, type Effects } from "@/lib/party";

/**
 * Applies Party Mode (src/lib/party.ts) to the document: the hue and scheme
 * as custom properties and data attributes on <html>, the letter case and
 * font the same way, and the replacements as swapped text nodes under the
 * header and main. Everything visual lives in globals.css behind those
 * attributes, so this file never builds CSS or markup from the agent's
 * words; strings only ever land in text nodes. Cleared on unmount or when
 * the effects go back to nothing.
 */

const ROOT_ATTRIBUTES = [
  "data-party-scheme",
  "data-party-text",
  "data-party-font",
  "data-party-banner",
  ...TARGETS.map((t) => `data-party-motion-${t}`),
];

/** The original text of every node this component has touched. */
const originals = new WeakMap<Text, string>();

function textNodes(): Text[] {
  const nodes: Text[] = [];
  for (const root of document.querySelectorAll("header, #main")) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.parentElement?.closest("script, style, textarea, input, [data-party-static]") ? NodeFilter.FILTER_REJECT
        : node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP,
    });
    for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
  }
  return nodes;
}

/**
 * Pairs apply in the order given, each on the text as the earlier ones left
 * it, so a later rewrite can start from the runs the visitor saw at the time.
 */
function applyReplacements(pairs: { from: string; to: string }[]) {
  for (const node of textNodes()) {
    const original = originals.get(node) ?? node.nodeValue ?? "";
    if (!originals.has(node)) originals.set(node, original);
    let text = original;
    for (const { from, to } of pairs) if (text.includes(from)) text = text.split(from).join(to);
    if (node.nodeValue !== text) node.nodeValue = text;
  }
}

/** The page's visible text, one string per run, as the visitor sees it now. */
export function collectRuns(): string[] {
  if (typeof document === "undefined") return [];
  const runs: string[] = [];
  for (const node of textNodes()) {
    const text = (node.nodeValue ?? "").trim();
    if (text && !runs.includes(text)) runs.push(text);
    if (runs.length >= MAX_RUNS) break;
  }
  return runs;
}

function restoreText() {
  for (const node of textNodes()) {
    const original = originals.get(node);
    if (original !== undefined && node.nodeValue !== original) node.nodeValue = original;
  }
}

export function usePartyMode(effects: Effects) {
  const { theme, setTheme } = useTheme();
  // The visitor's own theme, remembered the first time a scheme changes it
  // and put back when Party Mode ends or the scheme goes back to default.
  const before = useRef<string | null>(null);
  const scheme = effects.scheme;
  useEffect(() => {
    if (scheme === "light" || scheme === "dark") {
      if (before.current === null) before.current = theme ?? "system";
      setTheme(scheme);
    } else if (before.current !== null) {
      setTheme(before.current);
      before.current = null;
    }
    // `theme` is read once, when the scheme first changes; following it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheme, setTheme]);
  useEffect(() => {
    const root = document.documentElement;
    for (const name of ROOT_ATTRIBUTES) root.removeAttribute(name);
    root.style.removeProperty("--party-hue");
    if (effects.scheme && effects.scheme !== "default") root.setAttribute("data-party-scheme", effects.scheme);
    if (effects.hue !== undefined) root.style.setProperty("--party-hue", String(effects.hue));
    if (effects.text && effects.text !== "none") root.setAttribute("data-party-text", effects.text);
    if (effects.font && effects.font !== "default") root.setAttribute("data-party-font", effects.font);
    if (effects.banner) root.setAttribute("data-party-banner", "");
    for (const target of TARGETS) {
      const motion = effects.motion?.[target];
      if (motion && motion !== "none") root.setAttribute(`data-party-motion-${target}`, motion);
    }
    if (effects.replace?.length) applyReplacements(effects.replace);
    else restoreText();
    return () => {
      for (const name of ROOT_ATTRIBUTES) root.removeAttribute(name);
      root.style.removeProperty("--party-hue");
      restoreText();
    };
  }, [effects]);
}

/** Forty pieces with stable random positions, so a re-render does not reshuffle them. */
function useConfettiPieces(count = 40) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${((i * 53) % 100) / 40}s`,
        duration: `${3 + ((i * 29) % 100) / 50}s`,
        hue: (i * 47) % 360,
      })),
    [count],
  );
}

/** The confetti and the banner: fixed layers, outside the page's flow. */
export function PartyLayer({ effects }: { effects: Effects }) {
  const pieces = useConfettiPieces();
  return (
    <>
      {effects.confetti && (
        <div className="party-confetti" aria-hidden="true" data-party-static>
          {pieces.map((piece, i) => (
            <span
              key={i}
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
                background: `oklch(0.75 0.19 ${piece.hue})`,
              }}
            />
          ))}
        </div>
      )}
      {effects.banner && (
        <div className="party-banner" role="status" data-party-static>
          <span>{effects.banner}</span>
        </div>
      )}
    </>
  );
}
