import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ComponentPropsWithoutRef, Fragment, Suspense } from "react";

const components = {
  p: ({ children }: ComponentPropsWithoutRef<"p">) => (
    <p className="py-1">{children}</p>
  ),
  a: ({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <Link
      {...props}
      href={href}
      className="text-primary underline hover:text-primary/85"
    >
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
