"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { setCurrentRole, resetDemoData, seedDemoData, type Role } from "../../lib/demo-messages";

const ROLES: {
  role: Role; title: string; name: string; org: string;
  credential: string; password: string;
  color: string; bg: string; border: string;
  href: string; icon: string; access: string[];
}[] = [
  {
    role: "patient", title: "Patient", name: "Alex Rivera", org: "Aetna Insurance",
    credential: "patient@demo.unstuckmed.com", password: "demo1234",
    color: "#1d4ed8", bg: "#EFF6FF", border: "#BFDBFE",
    href: "/patient", icon: "👤",
    access: ["Track refill status in real time", "Message pharmacy & provider", "One-click demo messages", "Get notified on every update"],
  },
  {
    role: "pharmacy", title: "Pharmacy", name: "Summit Rx — Central Fill", org: "NPI 1234567890",
    credential: "pharmacy@demo.unstuckmed.com", password: "demo1234",
    color: "#15803d", bg: "#F0FDF4", border: "#BBF7D0",
    href: "/pharmacy", icon: "💊",
    access: ["See patient messages", "Process & classify refills", "Auto-route routine vs review", "Message provider & patient"],
  },
  {
    role: "provider", title: "Provider", name: "Dr. Sarah Chen, PharmD", org: "Summit Clinic · Lic #CA-89211",
    credential: "provider@demo.unstuckmed.com", password: "demo1234",
    color: "#7c3aed", bg: "#F5F3FF", border: "#DDD6FE",
    href: "/provider", icon: "🩺",
    access: ["Review flagged prescriptions", "Approve / Suggest Alternative / Require Visit", "Sign clinical notes", "Notifications from pharmacy"],
  },
];

export default function PortalPage() {
  const [resetting, setResetting] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);

  function handleSelect(role: Role, href: string) {
    setSelected(role);
    setCurrentRole(role);
    seedDemoData();
    setTimeout(() => { window.location.href = href; }, 300);
  }

  function handleReset() {
    setResetting(true);
    resetDemoData();
    setTimeout(() => setResetting(false), 1200);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: '"Inter","Sora",sans-serif', display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ height: "52px", background: "rgba(240,240,240,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.07)", display: "flex", alignItems: "center", padding: "0 32px", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontWeight: 700, fontSize: "15px", color: "#0D1117", textDecoration: "none", letterSpacing: "-0.02em" }}>
          UnStuck Med
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#6E7681", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "999px", padding: "3px 12px" }}>
            Hackathon Demo
          </span>
          <button onClick={handleReset} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "5px 12px", fontSize: "11px", color: "#6E7681", cursor: "pointer", fontWeight: 500 }}>
            {resetting ? "✓ Reset" : "Reset demo"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-block", background: "#0D1117", color: "#fff", fontFamily: "monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 14px", borderRadius: "999px", marginBottom: "16px" }}>
            Demo Login
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0D1117", letterSpacing: "-0.035em", margin: "0 0 10px", lineHeight: 1.15 }}>
            Choose your portal
          </h1>
          <p style={{ fontSize: "14px", color: "#6E7681", margin: 0 }}>
            Switch roles instantly during the demo. All data is pre-seeded — no signup needed.
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(256px, 1fr))", gap: "16px", width: "100%", maxWidth: "860px" }}>
          {ROLES.map(({ role, title, name, org, credential, password, color, bg, border, href, icon, access }) => {
            const isSelected = selected === role;
            const isFaded = selected && selected !== role;
            return (
              <div
                key={role}
                style={{
                  background: "#fff",
                  border: `2px solid ${isSelected ? color : border}`,
                  borderRadius: "18px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0",
                  transition: "all 0.2s ease",
                  opacity: isFaded ? 0.45 : 1,
                  boxShadow: isSelected ? `0 0 0 4px ${color}18, 0 8px 24px rgba(0,0,0,0.1)` : "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {/* Icon + title */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "16px", color: "#0D1117", letterSpacing: "-0.02em" }}>{title}</div>
                    <div style={{ fontSize: "11px", color: "#6E7681", fontWeight: 500 }}>{name}</div>
                  </div>
                </div>

                {/* Credentials */}
                <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontFamily: "monospace" }}>
                  <div style={{ fontSize: "9px", color: "#C9D1D9", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Demo Login</div>
                  <div style={{ fontSize: "11.5px", color: "#374151", marginBottom: "1px" }}>{credential}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Password: {password}</div>
                </div>

                {/* Access list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "18px" }}>
                  {access.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#374151" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>

                {/* BLACK PILL BUTTON — matches landing page "Open Worklist →" style */}
                <button
                  onClick={() => handleSelect(role, href)}
                  disabled={isSelected}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "11px 20px",
                    borderRadius: "9999px",
                    background: isSelected ? "#6E7681" : "rgb(18,19,23)",
                    color: "#fff",
                    border: "none",
                    cursor: isSelected ? "default" : "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    transition: "all 0.15s",
                    width: "100%",
                  }}
                >
                  {isSelected ? "Opening…" : `Enter as ${title}`}
                  {!isSelected && <ArrowRight style={{ width: 14, height: 14 }} />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p style={{ marginTop: "28px", fontSize: "11px", color: "#C9D1D9", textAlign: "center" }}>
          Demo scenario: Alex Rivera (patient) · Summit Rx (pharmacy) · Dr. Sarah Chen (provider)
          <br />Messages travel cross-portal in real time using local state. No backend required.
        </p>
      </div>
    </div>
  );
}
