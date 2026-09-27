import type { Metadata } from "next";
import "./globals.css";
import { AutonomyProvider } from "../lib/autonomy";

export const metadata: Metadata = {
  title: "UnStuck Med — Prescription Refill Intelligence",
  description: "UnStuck Med gives pharmacy and practice staff one shared, real-time worklist for prescription refills stuck on provider intervention. AI classifies the block. Humans resolve it.",
  openGraph: {
    title: "UnStuck Med — Prescription Refill Intelligence",
    description: "Close the refill gap. Unstuck in minutes.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,slnt,wdth,wght,ROND@8..144,-10..0,25..150,400..500,0..100&family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" href="/crowd.mp4" as="video" type="video/mp4" />
      </head>
      <body className="antialiased bg-[#F0F0F0] text-ink-900 font-sans">
        <AutonomyProvider>
          {children}
        </AutonomyProvider>
      </body>
    </html>
  );
}
