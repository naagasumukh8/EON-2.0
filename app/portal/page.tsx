"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, User, Building2, Stethoscope, RefreshCw, Check } from "lucide-react";
import { setCurrentRole, resetDemoData, seedDemoData, type Role } from "../../lib/demo-messages";
import { AppHeader } from "@/components/AppHeader";

type RoleConfig = {
  role: Role;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  href: string;
  Icon: React.ElementType;
  highlights: string[];
};

const ROLES: RoleConfig[] = [
  {
    role: "patient",
    title: "Patient Portal",
    subtitle: "Alex Rivera · Chronic Care Patient",
    color: "#2563EB",
    bg: "#EFF6FF",
    href: "/patient",
    Icon: User,
    highlights: [
      "Real-time prescription tracking & pickup ETA",
      "1-click refill requests & care team messaging",
    ],
  },
  {
    role: "pharmacy",
    title: "Pharmacy Queue",
    subtitle: "Summit Rx · Central Fill Intake",
    color: "#16A34A",
    bg: "#F0FDF4",
    href: "/pharmacy",
    Icon: Building2,
    highlights: [
      "Automated deterministic AI refill triage",
      "Instant routing: auto-resolve or provider escalation",
    ],
  },
  {
    role: "provider",
    title: "Physician Review",
    subtitle: "Dr. Marcus Chen, MD · Prescribing Clinic",
    color: "#9333EA",
    bg: "#FAF5FF",
    href: "/provider",
    Icon: Stethoscope,
    highlights: [
      "1-click eRx renewal authorization",
      "Safety checklist & clinical alternative options",
    ],
  },
];

export default function PortalPage() {
  const [resetting, setResetting] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);

  function handleSelect(role: Role, href: string) {
    setSelected(role);
    setCurrentRole(role);
    seedDemoData();
    setTimeout(() => {
      window.location.href = href;
    }, 200);
  }

  function handleReset() {
    setResetting(true);
    resetDemoData();
    setTimeout(() => setResetting(false), 900);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4F4F6",
        fontFamily: '"Google Sans", "Sora", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: "flex",
        flexDirection: "column",
        color: "rgb(18,19,23)",
      }}
    >
      {/* Unified Top Nav with Reset Demo Button */}
      <AppHeader
        activePath="/portal"
        rightElement={
          <button
            onClick={handleReset}
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "9999px",
              padding: "6px 16px",
              fontSize: "12px",
              color: "rgb(60,60,65)",
              cursor: "pointer",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <RefreshCw style={{ width: 12, height: 12, animation: resetting ? "spin 1s linear infinite" : "none" }} />
            {resetting ? "Resetting State…" : "Reset Demo Data"}
          </button>
        }
      />

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          maxWidth: "1080px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(0,0,0,0.05)",
              color: "rgb(70,70,75)",
              fontFamily: "ui-monospace, monospace",
              fontSize: "10.5px",
              fontWeight: 650,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "9999px",
              marginBottom: "14px",
            }}
          >
            Live Multi-Party Demo
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "rgb(18,19,23)",
              letterSpacing: "-0.03em",
              margin: "0 0 10px",
              lineHeight: 1.15,
            }}
          >
            Select Stakeholder Portal
          </h1>
          <p style={{ fontSize: "14.5px", color: "rgb(100,100,105)", margin: 0, lineHeight: 1.5, maxWidth: "520px" }}>
            Experience how a stalled refill is resolved without phone tag or friction. Choose a role to begin.
          </p>
        </div>

        {/* Clean, Uncluttered 3 Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            width: "100%",
          }}
        >
          {ROLES.map(({ role, title, subtitle, color, bg, href, Icon, highlights }) => {
            const isSelected = selected === role;
            const isFaded = selected && selected !== role;
            return (
              <div
                key={role}
                style={{
                  background: "#FFFFFF",
                  border: `1px solid ${isSelected ? "rgb(18,19,23)" : "rgba(0,0,0,0.08)"}`,
                  borderRadius: "22px",
                  padding: "32px 28px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease",
                  opacity: isFaded ? 0.4 : 1,
                  boxShadow: isSelected
                    ? "0 0 0 3px rgba(18,19,23,0.1), 0 16px 36px rgba(0,0,0,0.08)"
                    : "0 2px 10px rgba(0,0,0,0.02), 0 16px 32px -8px rgba(0,0,0,0.03)",
                }}
              >
                {/* Icon & Title */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "14px",
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: 22, height: 22, color }} />
                  </div>
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontWeight: 650,
                        fontSize: "17px",
                        color: "rgb(18,19,23)",
                        letterSpacing: "-0.015em",
                      }}
                    >
                      {title}
                    </h2>
                    <div style={{ fontSize: "12px", color: "rgb(110,110,115)", marginTop: "2px" }}>
                      {subtitle}
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginBottom: "28px",
                    flex: 1,
                  }}
                >
                  {highlights.map((text) => (
                    <div
                      key={text}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        fontSize: "13px",
                        color: "rgb(60,60,65)",
                        lineHeight: 1.45,
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <Check style={{ width: 10, height: 10, color: "rgb(40,40,45)" }} />
                      </div>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                <button
                  onClick={() => handleSelect(role, href)}
                  disabled={isSelected}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 20px",
                    borderRadius: "9999px",
                    background: isSelected ? "rgba(0,0,0,0.2)" : "rgb(18,19,23)",
                    color: "#FFFFFF",
                    border: "none",
                    cursor: isSelected ? "default" : "pointer",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    transition: "opacity 0.15s ease",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.opacity = "0.88";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.opacity = "1";
                  }}
                >
                  {isSelected ? "Opening Portal…" : `Enter as ${title}`}
                  {!isSelected && <ArrowRight style={{ width: 14, height: 14 }} />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Minimal Footer Note */}
        <div style={{ marginTop: "36px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "rgb(120,120,125)" }}>
            Instant role switching is available anytime in the top navigation bar.
          </p>
        </div>
      </main>
    </div>
  );
}
