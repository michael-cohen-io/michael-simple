import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { Suspense } from "react";

const components = {
  p: (props: any) => <p>{props.children}</p>,
  a: (props: any) => (
    <Link {...props} className="text-accent-color hover:underline">
      {props.children}
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
      {lines.map((line) => (
        <>
          <Suspense fallback={<>Loading...</>}>
            <MDXRemote source={line} components={{ ...components }} />
          </Suspense>
          <br />
        </>
      ))}
    </>
  );
}
