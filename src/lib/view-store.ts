/**
 * Which face of the page is showing: the one for people, or the Markdown
 * an agent gets. A module-level store so the toggle in the header and the
 * agent view in the page share it without a provider; `data-view` on <html>
 * lets CSS hide the human sections while the agent view is up.
 */
export type View = "human" | "agent";

let view: View = "human";
const listeners = new Set<() => void>();

export function getView(): View {
  return view;
}

export function getServerView(): View {
  return "human";
}

export function setView(next: View) {
  view = next;
  if (next === "agent") document.documentElement.dataset.view = "agent";
  else delete document.documentElement.dataset.view;
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
