import Link from "next/link";

export default function Footer() {
  return (
    <div className="absolute w-full mx-auto px-auto py-5 text-center">
      <p className="text-base text-muted-foreground">
        Built with 🤍 by{" "}
        <span className="text-primary font-semibold underline-offset-4 transition-colors hover:underline">
          <Link
            href="https://twitter.com/pwincessmichael"
            target="_blank"
            rel="noopener noreferrer"
          >
            Michael Cohen
          </Link>
        </span>
      </p>
    </div>
  );
}
