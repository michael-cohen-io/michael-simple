import { Suspense } from "react";
import Contact from "@/components/contact/contact";
import About from "@/components/home/about";
import Work from "@/components/work/work";
import { WorkSkeleton } from "@/components/work/WorkSkeleton";

export default function Home() {
  return (
    <div className="flex flex-col align-middle justify-center gap-16 md:py-52">
      <About />
      <Suspense fallback={<WorkSkeleton />}>
        <Work />
      </Suspense>
      <Contact />
    </div>
  );
}
