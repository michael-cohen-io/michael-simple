import type { Metadata, Viewport } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "./providers";
import { ErrorBeacon } from "@/components/analytics/error-beacon";
import { OnVercel } from "@/components/analytics/on-vercel";
import Footer from "@/components/footer";
import Header from "@/components/header/header";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, X_HANDLE } from "@/lib/site";

// One variable face instead of seven static weights: a single @font-face
// pair per subset, and Tailwind's font-sans reads it through the variable.
const raleway = Raleway({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  // Every relative URL below (canonical, og:url, the generated images)
  // resolves against this.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    firstName: "Michael",
    lastName: "Cohen",
    username: "michael-cohen-io",
  },
  twitter: {
    card: "summary_large_image",
    creator: X_HANDLE,
  },
  robots: { index: true, follow: true },
};

/** The browser chrome colour follows the theme: white, or the dark ground. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={raleway.variable} suppressHydrationWarning>
      {/* A column at least one screen tall, so the footer sits at the bottom
          of short pages (the 404) instead of halfway up. */}
      <body className="flex min-h-dvh flex-col font-sans">
        <Providers>
          {/* First in tab order; visible only while focused. */}
          <a
            href="#main"
            className="sr-only print:hidden focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:font-medium focus:text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-3xl px-8 outline-hidden">
            {children}
          </main>
          <Footer />
        </Providers>
        {/* Page views and field Web Vitals come from scripts that exist only
            on Vercel's hosts; the beacon reports uncaught errors through the
            first of them as a custom event, and stays silent elsewhere. */}
        <OnVercel>
          <Analytics />
          <SpeedInsights />
        </OnVercel>
        <ErrorBeacon />
      </body>
    </html>
  );
}
