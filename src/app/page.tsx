import { Suspense } from "react";
import Contact from "@/components/contact/contact";
import About from "@/components/home/about";
import Work from "@/components/work/work";

function WorkSkeleton() {
  return (
    <div className="flex flex-col w-full gap-4 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-4 w-64 bg-muted rounded" />
      <div className="space-y-6 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="h-24 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
