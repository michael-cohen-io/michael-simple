export default function Footer() {
  return (
    <footer className="w-full py-5 text-center">
      <p className="text-base text-muted-foreground">
        Built with 🤍 by{" "}
        <a
          href="https://twitter.com/pwincessmichael"
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 font-semibold text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
        >
          Michael Cohen
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      </p>
    </footer>
  );
}
