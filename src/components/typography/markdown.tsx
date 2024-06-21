import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { Fragment, Suspense } from "react";

const components = {
  p: (props: any) => <p className="py-1">{props.children}</p>,
  a: (props: any) => (
    <Link {...props} className="text-primary underline hover:text-primary/85">
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
