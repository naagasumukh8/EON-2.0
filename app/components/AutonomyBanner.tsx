"use client";
import React from "react";
import Link from "next/link";
import { Shield, Zap, ArrowRight } from "lucide-react";
import { useAutonomy } from "../../lib/autonomy";

/**
 * Clean, minimal AI mode banner.
 * Crisp, modern, single-line presentation without verbose text walls.
 */
export function AutonomyBanner() {
  const { mode, setMode } = useAutonomy();
  const isDraft = mode === "DRAFT_ONLY";

  return (
    <div
      style={{
        background: isDraft ? "#FFFBEB" : "#F0F7FF",
        borderBottom: isDraft ? "1px solid #FDE68A" : "1px solid #E0EDFE",
        transition: "all 0.2s ease",
      }}
      className="sticky top-0 z-50 text-xs"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-4">
        {/* Left: Mode badge + concise statement */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 7px",
              borderRadius: "4px",
              fontSize: "10.5px",
              fontWeight: 700,
              fontFamily: "monospace",
              background: isDraft ? "#B45309" : "#2563EB",
              color: "#fff",
              flexShrink: 0,
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
              color: isDraft ? "#92400E" : "#1E40AF",
              fontWeight: 500,
              fontSize: "12px",
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
              background: isDraft ? "rgba(180, 83, 9, 0.1)" : "rgba(37, 99, 235, 0.1)",
              borderRadius: "9999px",
              padding: "2px",
              border: isDraft ? "1px solid rgba(180, 83, 9, 0.2)" : "1px solid rgba(37, 99, 235, 0.2)",
            }}
          >
            <button
              onClick={() => setMode("DRAFT_ONLY")}
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "9999px",
                border: "none",
                background: isDraft ? "#fff" : "transparent",
                color: isDraft ? "#92400E" : "#6B7280",
                cursor: "pointer",
                boxShadow: isDraft ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              Draft
            </button>
            <button
              onClick={() => setMode("AUTONOMOUS")}
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "9999px",
                border: "none",
                background: !isDraft ? "#2563EB" : "transparent",
                color: !isDraft ? "#fff" : "#6B7280",
                cursor: "pointer",
                boxShadow: !isDraft ? "0 1px 2px rgba(37,99,235,0.25)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              ⚡ Auto
            </button>
          </div>

          <Link
            href="/dashboard"
            style={{
              fontSize: "11.5px",
              fontWeight: 600,
              color: isDraft ? "#92400E" : "#2563EB",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
            }}
            className="hover:opacity-80"
          >
            Queue <ArrowRight style={{ width: 11, height: 11 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
