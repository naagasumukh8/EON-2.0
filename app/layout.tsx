import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UnStuck Med — Prescription Refill Intelligence",
  description:
    "UnStuck Med gives pharmacy and practice staff one shared, real-time worklist for prescription refills stuck on provider intervention. AI classifies the block. Humans resolve it.",
  openGraph: {
    title: "UnStuck Med — Prescription Refill Intelligence",
    description: "Close the refill gap. Unstuck in minutes.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-ink-50 text-ink-900 font-sans">
        {children}
      </body>
    </html>
  );
}
