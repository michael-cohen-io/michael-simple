import ReactMarkdown, { type Components } from "react-markdown";

/**
 * Renders one bullet of the work history: a short paragraph of Markdown from
 * content/work.ts. Only inline text, emphasis and links survive; any other
 * construct (headings, images, raw HTML, lists) is unwrapped to its text, and
 * a link whose URL is not http(s) or mailto loses its href and is shown as
 * plain text. It is a plain server component, so it adds nothing to the
 * client bundle.
 */

const allowedElements = ["p", "a", "strong", "em", "code"];

const urlTransform = (url: string) =>
  /^(https?:|mailto:)/i.test(url) ? url : "";

const linkClassName =
  "py-2 text-primary underline underline-offset-4 hover:decoration-2";

const components: Components = {
  p: ({ children }) => <p>{children}</p>,
  // Only href and children are forwarded: nothing else from the source can
  // reach the DOM. Links to other sites open in a new tab and say so.
  a: ({ href, children }) => {
    if (!href) return <>{children}</>;
    const external = /^https?:/i.test(href);
    return (
      <a
        href={href}
        className={linkClassName}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
        {external && <span className="sr-only"> (opens in new tab)</span>}
      </a>
    );
  },
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      allowedElements={allowedElements}
      unwrapDisallowed
      urlTransform={urlTransform}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
