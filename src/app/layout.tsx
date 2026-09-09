import type { Metadata, Viewport } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
import Footer from "@/components/footer";
import Header from "@/components/header/header";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

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
    creator: "@pwincessmichael",
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
      <body className="font-sans">
        <Providers>
          {/* First in tab order; visible only while focused. */}
          <a
            href="#main"
            className="sr-only print:hidden focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:font-medium focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="mx-auto px-8 max-w-3xl outline-none">
            {children}
          </main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
