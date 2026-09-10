import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { CONTACT_EMAIL, PROFILES } from "@/lib/site";

import { SectionHeading } from "../typography/heading";

type ContactItem = {
  name: string;
  value: string;
  url: string;
  icon: React.ReactNode;
};

/** Inline outline glyphs (lucide shapes) so the page ships no icon library. */
const icon = (children: React.ReactNode) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="size-4"
  >
    {children}
  </svg>
);

const ICONS: Record<string, React.ReactNode> = {
  GitHub: icon(
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </>,
  ),
  LinkedIn: icon(
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </>,
  ),
  X: icon(<path d="M4 4l16 16M20 4L4 20" />),
  Email: icon(
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>,
  ),
};

/** The profiles from lib/site.ts, then email; one row each. */
const contactItems: ContactItem[] = [
  ...PROFILES.map(({ name, handle, url }) => ({ name, value: handle, url, icon: ICONS[name] })),
  { name: "Email", value: CONTACT_EMAIL, url: `mailto:${CONTACT_EMAIL}`, icon: ICONS.Email },
];

/**
 * One Item per way to reach me: the network's glyph, its name, and the
 * handle as the link. Links to other sites open in a new tab and say so;
 * mailto stays in-tab.
 */
export default function Contact() {
  return (
    <section aria-labelledby="connect-heading" className="flex w-full flex-col gap-2">
      <SectionHeading id="connect-heading">Connect</SectionHeading>
      <ItemGroup className="-mx-3">
        {contactItems.map((item) => {
          const external = /^https?:/.test(item.url);
          return (
            <Item key={item.name} render={<li />} size="sm" className="gap-x-3">
              <ItemMedia className="text-muted-foreground">{item.icon}</ItemMedia>
              <ItemContent className="flex-row flex-wrap items-baseline gap-x-4 gap-y-0">
                <ItemTitle className="w-16 text-muted-foreground">{item.name}</ItemTitle>
                <a
                  href={item.url}
                  className="inline-block py-2 text-sm font-medium text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
                  {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {item.value}
                  {external && <span className="sr-only"> (opens in new tab)</span>}
                </a>
              </ItemContent>
            </Item>
          );
        })}
      </ItemGroup>
    </section>
  );
}
