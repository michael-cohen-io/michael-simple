import Contact from "@/components/contact/contact";
import About from "@/components/home/about";
import Work from "@/components/work/work";

export default function Home() {
  return (
    <div className="flex flex-col align-middle justify-center gap-16 py-52">
      <About />
      <Work />
      <Contact />
    </div>
  );
}
