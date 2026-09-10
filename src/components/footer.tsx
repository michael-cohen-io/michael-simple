import { SOURCE_URL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto w-full pt-16 pb-8 text-center">
      <p className="text-base text-muted-foreground">
        Built with <span aria-hidden="true">🤍</span> by{" "}
        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Michael Cohen — source on GitHub (opens in new tab)"
          className="py-2 font-semibold text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
        >
          Michael Cohen
        </a>{" "}
        (and Claude)
      </p>
      {/* The one visible pointer for agents; llms.txt lists everything else
          (the Markdown page, the OpenAPI document, the PDF). */}
      <p className="mt-2 text-sm text-muted-foreground">
        For agents:{" "}
        <a
          href="/llms.txt"
          className="py-2 font-mono underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary"
        >
          /llms.txt
        </a>
      </p>
    </footer>
  );
}
