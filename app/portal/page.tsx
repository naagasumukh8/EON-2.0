"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, User, Building2, Stethoscope, ShieldCheck, RefreshCw } from "lucide-react";
import { setCurrentRole, resetDemoData, seedDemoData, type Role } from "../../lib/demo-messages";

type RoleConfig = {
  role: Role; title: string; name: string;
  credential: string; password: string;
  color: string; bg: string; border: string;
  href: string;
  Icon: React.ElementType;
  access: string[];
};

const ROLES: RoleConfig[] = [
  {
    role: "patient", title: "Patient Portal", name: "Alex Rivera",
    credential: "patient@demo.unstuckmed.com", password: "demo1234",
    color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE",
    href: "/patient", Icon: User,
    access: ["Real-time prescription journey tracker", "Instant ETA pickup badges", "Direct care-team communications", "1-click patient demo requests"],
  },
  {
    role: "pharmacy", title: "Pharmacy Queue", name: "Summit Rx — Central Fill",
    credential: "pharmacy@demo.unstuckmed.com", password: "demo1234",
    color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0",
    href: "/pharmacy", Icon: Building2,
    access: ["Real-time incoming refill intake queue", "Deterministic AI triage classification", "Auto-route routine vs. provider escalation", "Direct patient & clinic two-way messaging"],
  },
  {
    role: "provider", title: "Physician Review", name: "Dr. Marcus Chen, MD",
    credential: "provider@demo.unstuckmed.com", password: "demo1234",
    color: "#9333EA", bg: "#FAF5FF", border: "#E9D5FF",
    href: "/provider", Icon: Stethoscope,
    access: ["Physician review queue for stalled refills", "Clinical context package & safety checks", "1-click eRx approve / alternate / visit", "Direct auditable clinical decisioning"],
  },
];

export default function PortalPage() {
  const [resetting, setResetting] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);

  function handleSelect(role: Role, href: string) {
    setSelected(role);
    setCurrentRole(role);
    seedDemoData();
    setTimeout(() => { window.location.href = href; }, 250);
  }

  function handleReset() {
    setResetting(true);
    resetDemoData();
    setTimeout(() => setResetting(false), 1000);
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
      {/* Top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "54px",
          background: "rgba(240, 240, 240, 0.85)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: '"Google Sans","Sora",sans-serif',
            fontWeight: 600,
            fontSize: "16px",
            color: "rgb(18,19,23)",
            textDecoration: "none",
            letterSpacing: "-0.01em",
          }}
        >
          UnStuck Med
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontSize: "10.5px",
              fontFamily: "ui-monospace, monospace",
              fontWeight: 600,
              color: "#6B7280",
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "9999px",
              padding: "4px 12px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Live Evaluation Mode
          </span>
          <button
            onClick={handleReset}
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "9999px",
              padding: "5px 14px",
              fontSize: "11.5px",
              color: "rgb(60,60,65)",
              cursor: "pointer",
              fontWeight: 550,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.15s ease",
            }}
          >
            <RefreshCw style={{ width: 11, height: 11 }} />
            {resetting ? "Resetting…" : "Reset State"}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px", maxWidth: "600px" }}>
          <div
            style={{
              display: "inline-block",
              background: "rgb(18,19,23)",
              color: "#FFFFFF",
              fontFamily: "ui-monospace, monospace",
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 14px",
              borderRadius: "9999px",
              marginBottom: "16px",
            }}
          >
            Multi-Party Refill Ecosystem
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
              fontWeight: 700,
              color: "rgb(18,19,23)",
              letterSpacing: "-0.035em",
              margin: "0 0 12px",
              lineHeight: 1.15,
            }}
          >
            Select Stakeholder Portal
          </h1>
          <p style={{ fontSize: "14.5px", color: "rgb(90,90,95)", margin: 0, lineHeight: 1.5 }}>
            Switch seamlessly between Patient, Pharmacy, and Clinic Provider to evaluate the end-to-end multi-party refill gap resolution in real time.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", width: "100%", maxWidth: "960px" }}>
          {ROLES.map(({ role, title, name, credential, password, color, bg, border, href, Icon, access }) => {
            const isSelected = selected === role;
            const isFaded = selected && selected !== role;
            return (
              <div
                key={role}
                style={{
                  background: "#FFFFFF",
                  border: `1.5px solid ${isSelected ? "rgb(18,19,23)" : "rgba(0,0,0,0.08)"}`,
                  borderRadius: "20px",
                  padding: "26px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease",
                  opacity: isFaded ? 0.45 : 1,
                  boxShadow: isSelected ? "0 0 0 4px rgba(18,19,23,0.1), 0 12px 28px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.02), 0 10px 24px -6px rgba(0,0,0,0.03)",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
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
                    <div style={{ fontWeight: 650, fontSize: "16px", color: "rgb(18,19,23)", letterSpacing: "-0.01em" }}>
                      {title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>
                      {name}
                    </div>
                  </div>
                </div>

                {/* Pre-filled Credentials */}
                <div
                  style={{
                    background: "#FAFAFA",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    marginBottom: "16px",
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  <div style={{ fontSize: "9px", color: "#9CA3AF", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                    Pre-Authenticated Access
                  </div>
                  <div style={{ fontSize: "11.5px", color: "rgb(30,30,35)", fontWeight: 600 }}>{credential}</div>
                  <div style={{ fontSize: "10.5px", color: "#6B7280" }}>Pass: {password}</div>
                </div>

                {/* Access capabilities */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "22px", flex: 1 }}>
                  {access.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "rgb(60,60,65)", lineHeight: 1.4 }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0, marginTop: "5px" }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelect(role, href)}
                  disabled={isSelected}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 22px",
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
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.opacity = "0.88"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.opacity = "1"; }}
                >
                  {isSelected ? "Launching Portal…" : `Enter as ${title}`}
                  {!isSelected && <ArrowRight style={{ width: 14, height: 14 }} />}
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: "32px", fontSize: "12px", color: "#9CA3AF", textAlign: "center", maxWidth: "600px", lineHeight: 1.5 }}>
          Zero external database latency · In-memory real-time state machine synchronized across portals · Compliant with clinical human sign-off mandate
        </p>
      </div>
    </div>
  );
}
