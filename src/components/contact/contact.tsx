import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ContactItem = {
  name: string;
  value: string;
  url: string;
};

const contactItems: ContactItem[] = [
  {
    name: "Site",
    value: "www.michaelcohen.io",
    url: "https://www.michaelcohen.io",
  },
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
    name: "Email",
    value: "micohen13@gmail.com",
    url: "mailto:micohen13@gmail.com",
  },
];

export default function Contact() {
  return (
    <div className="flex flex-col w-full gap-2">
      <h1 className="font-semibold underline">Connect</h1>
      <div className="flex flex-col gap-1">
        {contactItems.map((item) => (
          <span
            key={item.name}
            className="group items-center flex w-full gap-1"
          >
            <Label htmlFor={item.name} className="w-20">
              {item.name}
            </Label>
            <Button
              id={item.name}
              variant="link"
              className="group-hover:underline"
              asChild
            >
              <Link href={item.url}>{item.value}</Link>
            </Button>
          </span>
        ))}
      </div>
    </div>
  );
}
