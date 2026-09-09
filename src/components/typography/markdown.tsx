import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ComponentPropsWithoutRef, Fragment, Suspense } from "react";

const linkClassName =
  "py-2 text-primary underline underline-offset-4 hover:text-primary/85";

const components = {
  p: ({ children }: ComponentPropsWithoutRef<"p">) => (
    <p className="py-1">{children}</p>
  ),
  // Links to other sites open in a new tab and say so.
  a: ({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) =>
    /^https?:/.test(href) ? (
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
      >
        {children}
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    ) : (
      <Link {...props} href={href} className={linkClassName}>
        {children}
      </Link>
    ),
};

export default async function MarkDownTextWithLinebreaks(props: {
  text: string;
}) {
  const { text } = props;
  if (!text) return null;
  const lines = text.split("\\n");
  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={index}>
          <Suspense fallback={<>Loading...</>}>
            <MDXRemote source={line} components={{ ...components }} />
          </Suspense>
        </Fragment>
      ))}
    </>
  );
}
