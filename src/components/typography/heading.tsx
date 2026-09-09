import { ReactNode } from "react";

/**
 * A section title. The page's only <h1> is the name in the header, so every
 * section under it starts at <h2>; `id` lets the enclosing <section> be named
 * by its heading via aria-labelledby.
 */
export function SectionHeading({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <h2 id={id} className="font-semibold">
      {children}
    </h2>
  );
}
