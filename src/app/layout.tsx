import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import { Providers } from "./providers";
import Footer from "@/components/footer";
import Header from "@/components/header/header";
import { cn } from "@/lib/utils";

const roboto = Roboto_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "<MC>",
  description: "Created by Michael Cohen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <Providers>
          <Suspense
            fallback={
              <div className="fixed top-0 w-full flex justify-center">
                <div className="mx-5 flex h-16 max-w-screen-xl items-center justify-between w-full">
                  <p>Loading...</p>
                </div>
              </div>
            }
          >
            <Header />
          </Suspense>
          <main className="px-48">
            <div>{children}</div>
          </main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
