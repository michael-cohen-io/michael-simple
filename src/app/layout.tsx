import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
import Footer from "@/components/footer";
import Header from "@/components/header/header";
import { cn } from "@/lib/utils";

const font = Raleway({
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
      <body className={cn(font.className)}>
        <Providers>
          <main className="mx-auto px-8 max-w-2xl">
            <Header />
            <div>{children}</div>
          </main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
