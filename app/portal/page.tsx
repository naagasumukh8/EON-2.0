"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, User, Building2, Stethoscope } from "lucide-react";
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
    role: "patient", title: "Patient", name: "Alex Rivera",
    credential: "patient@demo.unstuckmed.com", password: "demo1234",
    color: "#1d4ed8", bg: "#EFF6FF", border: "#BFDBFE",
    href: "/patient", Icon: User,
    access: ["Track refill status in real time", "Message pharmacy & provider", "One-click demo messages", "Get notified on every update"],
  },
  {
    role: "pharmacy", title: "Pharmacy", name: "Summit Rx — Central Fill",
    credential: "pharmacy@demo.unstuckmed.com", password: "demo1234",
    color: "#15803d", bg: "#F0FDF4", border: "#BBF7D0",
    href: "/pharmacy", Icon: Building2,
    access: ["See patient messages", "Process & route refills", "Routine auto-resolve, complex to provider", "Reply to patient & provider"],
  },
  {
    role: "provider", title: "Provider", name: "Dr. Sarah Chen, PharmD",
    credential: "provider@demo.unstuckmed.com", password: "demo1234",
    color: "#7c3aed", bg: "#F5F3FF", border: "#DDD6FE",
    href: "/provider", Icon: Stethoscope,
    access: ["Review flagged prescriptions", "Approve / Suggest Alternative / Require Visit", "Sign clinical audit notes", "Receive pharmacy escalations"],
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
            {resetting ? "Reset done" : "Reset demo"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-block", background: "rgb(18,19,23)", color: "#fff", fontFamily: "monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 14px", borderRadius: "999px", marginBottom: "16px" }}>
            Demo Login
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "#0D1117", letterSpacing: "-0.035em", margin: "0 0 10px", lineHeight: 1.15 }}>
            Choose your portal
          </h1>
          <p style={{ fontSize: "14px", color: "#6E7681", margin: 0 }}>
            Switch roles instantly during the demo. All data is pre-seeded.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(256px, 1fr))", gap: "16px", width: "100%", maxWidth: "860px" }}>
          {ROLES.map(({ role, title, name, credential, password, color, bg, border, href, Icon, access }) => {
            const isSelected = selected === role;
            const isFaded = selected && selected !== role;
            return (
              <div key={role} style={{ background: "#fff", border: `2px solid ${isSelected ? color : border}`, borderRadius: "18px", padding: "24px", display: "flex", flexDirection: "column", transition: "all 0.2s ease", opacity: isFaded ? 0.45 : 1, boxShadow: isSelected ? `0 0 0 4px ${color}18, 0 8px 24px rgba(0,0,0,0.1)` : "0 2px 8px rgba(0,0,0,0.05)" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon style={{ width: 18, height: 18, color }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "#0D1117", letterSpacing: "-0.02em" }}>{title}</div>
                    <div style={{ fontSize: "11px", color: "#6E7681", fontWeight: 500 }}>{name}</div>
                  </div>
                </div>

                {/* Credentials */}
                <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontFamily: "monospace" }}>
                  <div style={{ fontSize: "9px", color: "#C9D1D9", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Demo credentials</div>
                  <div style={{ fontSize: "11.5px", color: "#374151", marginBottom: "1px" }}>{credential}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Password: {password}</div>
                </div>

                {/* Access */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "18px" }}>
                  {access.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#374151" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>

                <button onClick={() => handleSelect(role, href)} disabled={isSelected}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px 20px", borderRadius: "9999px", background: isSelected ? "#9CA3AF" : "rgb(18,19,23)", color: "#fff", border: "none", cursor: isSelected ? "default" : "pointer", fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em", transition: "all 0.15s", width: "100%" }}>
                  {isSelected ? "Opening…" : `Enter as ${title}`}
                  {!isSelected && <ArrowRight style={{ width: 14, height: 14 }} />}
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: "28px", fontSize: "11px", color: "#C9D1D9", textAlign: "center" }}>
          Alex Rivera (patient) · Summit Rx (pharmacy) · Dr. Sarah Chen (provider)
          <br />Messages travel cross-portal in real time using local state. No backend required.
        </p>
      </div>
    </div>
  );
}
