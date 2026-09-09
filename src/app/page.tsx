import Contact from "@/components/contact/contact";
import About from "@/components/home/about";
import Work from "@/components/work/work";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-16 pt-8 md:gap-20 md:pt-12">
      <About />
      <Work />
      <Contact />
    </div>
  );
}
