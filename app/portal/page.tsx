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
  emoji: string;
  color: string;
  bg: string;
  href: string;
  Icon: React.ElementType;
  tags: string[];
};

const ROLES: RoleConfig[] = [
  {
    role: "patient",
    title: "Patient Portal",
    subtitle: "Alex Rivera · Chronic Care",
    emoji: "👤",
    color: "#2563EB",
    bg: "#EFF6FF",
    href: "/patient",
    Icon: User,
    tags: ["💊 Real-Time Rx Tracker", "💬 Direct Care Team Chat"],
  },
  {
    role: "pharmacy",
    title: "Pharmacy Queue",
    subtitle: "Summit Rx · Intake Triage",
    emoji: "🏥",
    color: "#16A34A",
    bg: "#F0FDF4",
    href: "/pharmacy",
    Icon: Building2,
    tags: ["⚡ Deterministic AI Triage", "🔄 Instant Provider Routing"],
  },
  {
    role: "provider",
    title: "Physician Review",
    subtitle: "Dr. Marcus Chen, MD · Prescriber",
    emoji: "🩺",
    color: "#9333EA",
    bg: "#FAF5FF",
    href: "/provider",
    Icon: Stethoscope,
    tags: ["✍️ 1-Click eRx Renewal", "🛡️ Clinical Safety Protocol"],
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
        background: "#F0F0F0",
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
            {resetting ? "Resetting…" : "Reset State"}
          </button>
        }
      />

      {/* Main Role Selector */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "56px 24px 80px",
          maxWidth: "1160px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 3.4vw, 2.75rem)",
              fontWeight: 700,
              color: "rgb(18,19,23)",
              letterSpacing: "-0.035em",
              margin: "0 0 10px",
              lineHeight: 1.15,
            }}
          >
            Select Stakeholder Portal
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(18,19,23,0.55)", margin: 0, lineHeight: 1.5 }}>
            Live three-way clinical refill coordination. Select a role to begin.
          </p>
        </div>

        {/* 3 Premium Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            width: "100%",
            maxWidth: "1140px",
          }}
        >
          {ROLES.map(({ role, title, subtitle, emoji, color, bg, href, Icon, tags }) => {
            const isSelected = selected === role;
            const isFaded = selected && selected !== role;
            return (
              <div
                key={role}
                style={{
                  background: "#FFFFFF",
                  border: `1px solid ${isSelected ? "rgb(18,19,23)" : "rgba(0,0,0,0.08)"}`,
                  borderRadius: "24px",
                  padding: "36px 30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                  opacity: isFaded ? 0.35 : 1,
                  boxShadow: isSelected
                    ? "0 0 0 3px rgba(18,19,23,0.1), 0 20px 40px rgba(0,0,0,0.09)"
                    : "0 1px 3px rgba(0,0,0,0.02), 0 14px 32px -8px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  {/* Icon & Title */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "16px",
                        background: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "22px",
                      }}
                    >
                      {emoji}
                    </div>
                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: "18px",
                          color: "rgb(18,19,23)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {title}
                      </h2>
                      <div style={{ fontSize: "12.5px", color: "rgba(18,19,23,0.5)", marginTop: "2px" }}>
                        {subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Clean Feature Tags */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "9px",
                      marginBottom: "32px",
                    }}
                  >
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "rgba(18,19,23,0.75)",
                          background: "rgba(0,0,0,0.025)",
                          border: "1px solid rgba(0,0,0,0.05)",
                          padding: "8px 14px",
                          borderRadius: "12px",
                        }}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
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
                    padding: "13px 22px",
                    borderRadius: "9999px",
                    background: isSelected ? "rgba(0,0,0,0.2)" : "rgb(18,19,23)",
                    color: "#FFFFFF",
                    border: "none",
                    cursor: isSelected ? "default" : "pointer",
                    fontSize: "14px",
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
                  {isSelected ? "Opening…" : `Enter ${title}`}
                  {!isSelected && <ArrowRight style={{ width: 14, height: 14 }} />}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
