import { Fragment } from "react";

import { SectionHeading } from "../typography/heading";

type ContactItem = {
  name: string;
  value: string;
  url: string;
};

const contactItems: ContactItem[] = [
  {
    name: "GitHub",
    value: "@michael-cohen-io",
    url: "https://github.com/michael-cohen-io",
  },
  {
    name: "LinkedIn",
    value: "/michael-cohen1995",
    url: "https://www.linkedin.com/in/michael-cohen1995/",
  },
  {
    name: "X / Twitter",
    value: "@pwincessmichael",
    url: "https://twitter.com/pwincessmichael",
  },
  {
    name: "Email",
    value: "micohen13@gmail.com",
    url: "mailto:micohen13@gmail.com",
  },
];

/** Links to other sites open in a new tab and say so; mailto stays in-tab. */
function ContactLink({ item }: { item: ContactItem }) {
  const external = /^https?:/.test(item.url);
  return (
    <a
      href={item.url}
      className="inline-block py-2.5 text-sm font-medium text-primary underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {item.value}
      {external && <span className="sr-only"> (opens in new tab)</span>}
    </a>
  );
}

export default function Contact() {
  return (
    <section
      aria-labelledby="connect-heading"
      className="flex flex-col w-full gap-2"
    >
      <SectionHeading id="connect-heading">Connect</SectionHeading>
      {/* dt/dd pairs give each link its service name as programmatic context. */}
      <dl className="grid grid-cols-[5rem_1fr] items-center gap-x-1 gap-y-1">
        {contactItems.map((item) => (
          <Fragment key={item.name}>
            <dt className="text-sm font-medium text-muted-foreground">
              {item.name}
            </dt>
            <dd>
              <ContactLink item={item} />
            </dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}
