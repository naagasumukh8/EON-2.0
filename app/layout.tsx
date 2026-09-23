import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EON 2.0 | Polymath Innovae × Eonexea AI Hackathon OS",
  description:
    "Pre-wired systems thinking workbenches, defensible AI judgment layers, and live pitch presentation HUD for the 60-90 minute hackathon sprint.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-[#ededed] antialiased selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
