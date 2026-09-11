"use client";

import { useEffect, useMemo } from "react";

import { TARGETS, type Effects } from "@/lib/party";

/**
 * Applies Party Mode (src/lib/party.ts) to the document: the hue and scheme
 * as custom properties and data attributes on <html>, the letter case and
 * font the same way, and the replacements as swapped text nodes under the
 * header and main. Everything visual lives in globals.css behind those
 * attributes, so this file never builds CSS or markup from the agent's
 * words; strings only ever land in text nodes. Cleared on unmount or when
 * the effects go back to nothing.
 */

const ROOT_ATTRIBUTES = ["data-party-scheme", "data-party-text", "data-party-font", ...TARGETS.map((t) => `data-party-motion-${t}`)];

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

function applyReplacements(pairs: { from: string; to: string }[]) {
  // Longest first, so "Work Experience" wins over "Work".
  const ordered = [...pairs].sort((a, b) => b.from.length - a.from.length);
  for (const node of textNodes()) {
    const original = originals.get(node) ?? node.nodeValue ?? "";
    if (!originals.has(node)) originals.set(node, original);
    let text = original;
    for (const { from, to } of ordered) if (text.includes(from)) text = text.split(from).join(to);
    if (node.nodeValue !== text) node.nodeValue = text;
  }
}

function restoreText() {
  for (const node of textNodes()) {
    const original = originals.get(node);
    if (original !== undefined && node.nodeValue !== original) node.nodeValue = original;
  }
}

export function usePartyMode(effects: Effects) {
  useEffect(() => {
    const root = document.documentElement;
    for (const name of ROOT_ATTRIBUTES) root.removeAttribute(name);
    root.style.removeProperty("--party-hue");
    if (effects.scheme && effects.scheme !== "default") root.setAttribute("data-party-scheme", effects.scheme);
    if (effects.hue !== undefined) root.style.setProperty("--party-hue", String(effects.hue));
    if (effects.text && effects.text !== "none") root.setAttribute("data-party-text", effects.text);
    if (effects.font && effects.font !== "default") root.setAttribute("data-party-font", effects.font);
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
