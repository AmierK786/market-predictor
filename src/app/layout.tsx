import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meridian · market forecast bench",
  description:
    "Walk-forward 5-day forecasts for ten US stocks, scored against flat and momentum baselines.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
        <footer className="border-t border-border/80 px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          Daily forecast bench for ten US stocks. Research record, not a trading signal.
        </footer>
      </body>
    </html>
  );
}
