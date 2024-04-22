import { ReactNode } from "react";

export function H1({ children }: { children: ReactNode }) {
  return <h1 className="font-semibold">{children}</h1>;
}
