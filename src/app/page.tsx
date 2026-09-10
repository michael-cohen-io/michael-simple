import AgentView from "@/components/agent/agent-view";
import Ask from "@/components/ask/ask";
import Contact from "@/components/contact/contact";
import About from "@/components/home/about";
import Writing from "@/components/home/writing";
import { PersonJsonLd } from "@/components/seo/person-json-ld";
import Work from "@/components/work/work";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-16 pt-8 md:gap-20 md:pt-12">
      <PersonJsonLd />
      {/* The human view; hidden by CSS while the agent view is showing. */}
      <div className="human-view flex w-full flex-col items-center gap-16 md:gap-20">
        <About />
        <Ask />
        <Writing />
        <Work />
        <Contact />
      </div>
      <AgentView />
    </div>
  );
}
