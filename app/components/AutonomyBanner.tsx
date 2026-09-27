"use client";
import React from "react";
import Link from "next/link";
import { Shield, Zap, ArrowRight, Settings2 } from "lucide-react";
import { useAutonomy } from "../../lib/autonomy";

/**
 * Persistent banner — shows current autonomy mode on EVERY page.
 * Readable by a judge in 2 seconds.
 * Shows mode, 1-line explanation, user vs org status, and instant toggle.
 */
export function AutonomyBanner() {
  const { mode, setMode, orgDefault, userOverride, resetUserOverride } = useAutonomy();

  const isDraft = mode === "DRAFT_ONLY";

  return (
    <div
      style={{
        background: isDraft ? "#FFFBEB" : "#EFF6FF",
        borderBottom: isDraft ? "1px solid #FDE68A" : "1px solid #BFDBFE",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
      className="sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode badge + 1-line explanation */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 10px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.06em",
              fontFamily: "monospace",
              background: isDraft ? "#92400E" : "#1D4ED8",
              color: "#ffffff",
              boxShadow: isDraft ? "0 1px 2px rgba(146,64,14,0.2)" : "0 1px 2px rgba(29,78,216,0.2)",
              flexShrink: 0,
            }}
          >
            {isDraft ? (
              <>
                <Shield style={{ width: 12, height: 12 }} />
                DRAFT-ONLY
              </>
            ) : (
              <>
                <Zap style={{ width: 12, height: 12 }} />
                AUTONOMOUS
              </>
            )}
          </div>

          {/* 1-Line Explanation */}
          <p
            style={{
              fontSize: "12.5px",
              fontWeight: 500,
              color: isDraft ? "#78350F" : "#1E40AF",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {isDraft ? (
              <span>
                <strong>Draft-Only Active:</strong> Every refill requires a human click to move ACTION_DRAFTED ➔ ACTION_CONFIRMED. Nothing runs automatically.
              </span>
            ) : (
              <span>
                <strong>Autonomous Active:</strong> Whitelisted low-risk tasks (missing info, status SMS) auto-execute. Therapy decisions (new Rx, dosage, PA) ALWAYS require human sign-off.
              </span>
            )}
          </p>
        </div>

        {/* Right: Controls & Override Status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Override Indicator */}
          <span
            style={{
              fontSize: "11px",
              color: isDraft ? "#92400E" : "#1D4ED8",
              opacity: 0.85,
              fontFamily: "monospace",
            }}
            className="hidden md:inline-block"
          >
            {userOverride
              ? `User override (${userOverride === "AUTONOMOUS" ? "Auto" : "Draft"}) > Org default (${orgDefault})`
              : `Org default (${orgDefault})`}
          </span>

          {/* Instant Toggle Button */}
          <button
            onClick={() => setMode(isDraft ? "AUTONOMOUS" : "DRAFT_ONLY")}
            style={{
              fontSize: "11.5px",
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: "5px",
              border: isDraft ? "1px solid #B45309" : "1px solid #2563EB",
              background: isDraft ? "#FEF3C7" : "#DBEAFE",
              color: isDraft ? "#92400E" : "#1E40AF",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
            className="hover:opacity-90 active:scale-95"
            title="Click to toggle autonomy mode for this session"
          >
            Switch to {isDraft ? "Autonomous Mode" : "Draft-Only Mode"}
          </button>

          {/* Queue link */}
          <Link
            href="/dashboard"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: isDraft ? "#92400E" : "#1D4ED8",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
            className="hover:underline"
          >
            Queue <ArrowRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
