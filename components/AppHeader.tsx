"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function AppHeader({
  activePath,
  rightElement,
}: {
  activePath?: string;
  rightElement?: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentPath = activePath || pathname;

  const links = [
    { href: "/portal",    label: "Portals" },
    { href: "/dashboard", label: "Worklist" },
    { href: "/classify",  label: "Classifier" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(240,240,240,0.85)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        fontFamily: '"Google Sans","Sora",-apple-system,BlinkMacSystemFont,sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 24px",
          height: "54px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: '"Google Sans","Sora",sans-serif',
            fontWeight: 650,
            fontSize: "16px",
            color: "rgb(18,19,23)",
            textDecoration: "none",
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <img
            src="/turtle-logo.png"
            alt="UnStuck Med Logo"
            style={{ height: "28px", width: "auto", objectFit: "contain", display: "inline-block", flexShrink: 0 }}
          />
          <span>UnStuck Med</span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {links.map((l) => {
            const isActive =
              currentPath === l.href ||
              (l.href === "/portal" &&
                (currentPath.startsWith("/patient") ||
                  currentPath.startsWith("/pharmacy") ||
                  currentPath.startsWith("/provider")));
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontSize: "13.5px",
                  fontWeight: isActive ? 600 : 450,
                  color: isActive ? "rgb(18,19,23)" : "rgba(18,19,23,0.6)",
                  background: isActive ? "rgba(0,0,0,0.06)" : "transparent",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {rightElement || (
            <Link
              href="/portal"
              style={{
                background: "rgb(18,19,23)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 550,
                padding: "7px 18px",
                borderRadius: "9999px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "opacity 0.15s",
              }}
            >
              Enter Portal <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
