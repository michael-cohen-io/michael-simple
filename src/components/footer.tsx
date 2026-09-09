import { SOURCE_URL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-16 w-full py-8 text-center">
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
        </a>
      </p>
    </footer>
  );
}
