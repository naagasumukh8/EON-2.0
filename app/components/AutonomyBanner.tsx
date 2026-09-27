"use client";
import React from "react";
import Link from "next/link";
import { Shield, Zap, ArrowRight } from "lucide-react";
import { useAutonomy } from "../../lib/autonomy";

/**
 * Clean, minimal AI mode banner with luxury glassmorphic styling matching landing page.
 */
export function AutonomyBanner() {
  const { mode, setMode } = useAutonomy();
  const isDraft = mode === "DRAFT_ONLY";

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        transition: "all 0.2s ease",
        fontFamily: '"Google Sans", "Sora", sans-serif',
      }}
      className="sticky top-[54px] z-40 text-xs"
    >
      <div className="max-w-[1240px] mx-auto px-6 py-2 flex items-center justify-between gap-4">
        {/* Left: Mode badge + concise statement */}
        <div className="flex items-center gap-3 min-w-0">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "3px 10px",
              borderRadius: "9999px",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "monospace",
              background: isDraft ? "rgb(18,19,23)" : "#166534",
              color: "#fff",
              flexShrink: 0,
              letterSpacing: "0.04em",
            }}
          >
            {isDraft ? (
              <>
                <Shield style={{ width: 11, height: 11 }} /> DRAFT-ONLY
              </>
            ) : (
              <>
                <Zap style={{ width: 11, height: 11 }} /> AUTONOMOUS
              </>
            )}
          </span>

          <span
            style={{
              color: "rgba(18,19,23,0.65)",
              fontWeight: 450,
              fontSize: "12.5px",
            }}
            className="truncate"
          >
            {isDraft
              ? "All actions require human approval before sending."
              : "Low-risk actions auto-execute · Therapy changes require human review."}
          </span>
        </div>

        {/* Right: Sleek toggle + queue link */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Segmented pill switch */}
          <div
            style={{
              display: "inline-flex",
              background: "rgba(0, 0, 0, 0.05)",
              borderRadius: "9999px",
              padding: "2px",
              border: "1px solid rgba(0, 0, 0, 0.06)",
            }}
          >
            <button
              onClick={() => setMode("DRAFT_ONLY")}
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 12px",
                borderRadius: "9999px",
                border: "none",
                background: isDraft ? "rgb(18,19,23)" : "transparent",
                color: isDraft ? "#fff" : "rgba(18,19,23,0.5)",
                cursor: "pointer",
                boxShadow: isDraft ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Draft
            </button>
            <button
              onClick={() => setMode("AUTONOMOUS")}
              style={{
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 12px",
                borderRadius: "9999px",
                border: "none",
                background: !isDraft ? "#166534" : "transparent",
                color: !isDraft ? "#fff" : "rgba(18,19,23,0.5)",
                cursor: "pointer",
                boxShadow: !isDraft ? "0 1px 3px rgba(22,101,52,0.25)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              ⚡ Auto
            </button>
          </div>

          <Link
            href="/dashboard"
            style={{
              fontSize: "12px",
              fontWeight: 550,
              color: "rgb(18,19,23)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "rgba(0,0,0,0.05)",
              transition: "all 0.15s ease",
            }}
          >
            Queue <ArrowRight style={{ width: 11, height: 11 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
