export default function About() {
  return (
    <div className="w-full px-1 xl:px-0">
      {/* Light weight and a prose measure keep the blurb from being the
          heaviest thing on the page; the chip and the pink phrase carry it. */}
      <p className="max-w-prose text-xl font-light leading-snug md:text-2xl">
        <code className="rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono text-base font-semibold md:text-lg">
          Hello, World!
        </code>{" "}
        I&apos;m{" "}
        <span className="whitespace-nowrap font-semibold text-primary">
          a software developer
        </span>{" "}
        based out of Brooklyn, NY. Short blurbs are not my specialty. Reach
        out and let&apos;s become friends if you want to find out more about
        me.
      </p>
    </div>
  );
}
