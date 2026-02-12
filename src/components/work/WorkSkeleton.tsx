import { H1 } from "../typography/heading";

export function WorkSkeleton() {
  return (
    <div className="flex flex-col w-full gap-2">
      <H1>Work Experience</H1>
      <div className="flex flex-col gap-6 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
            <div className="ml-11 space-y-2">
              <div className="h-4 w-48 rounded bg-muted" />
              <div className="h-3 w-full max-w-md rounded bg-muted" />
              <div className="h-3 w-full max-w-sm rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
