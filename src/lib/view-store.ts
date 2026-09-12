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
  // The URL says which view is up, so a link can open the page as an agent
  // sees it; replaceState keeps the switch out of the back button's history.
  const url = new URL(window.location.href);
  if (next === "agent") url.searchParams.set("view", "agent");
  else url.searchParams.delete("view");
  window.history.replaceState(window.history.state, "", url);
  for (const listener of listeners) listener();
}

/** The view a URL asks for: `?view=agent`, or the human one. */
export function viewFromLocation(): View {
  return new URLSearchParams(window.location.search).get("view") === "agent" ? "agent" : "human";
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
