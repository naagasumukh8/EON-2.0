"use client";
import React, { useState } from "react";
import Link from "next/link";
import { setCurrentRole, resetDemoData, type Role } from "../../lib/demo-messages";

const ROLES: {
  role: Role;
  title: string;
  name: string;
  credential: string;
  password: string;
  org: string;
  color: string;
  bg: string;
  border: string;
  href: string;
  icon: string;
  access: string[];
}[] = [
  {
    role: "patient",
    title: "Patient",
    name: "Alex Rivera",
    credential: "patient@demo.unstuckmed.com",
    password: "demo1234",
    org: "Aetna AET-88124-X",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    href: "/patient",
    icon: "👤",
    access: [
      "Track refill journey in real time",
      "Message your pharmacy",
      "Message your provider",
      "Get notified on every status change",
    ],
  },
  {
    role: "pharmacy",
    title: "Pharmacy",
    name: "Summit Rx — Central Fill",
    credential: "pharmacy@demo.unstuckmed.com",
    password: "demo1234",
    org: "Summit Rx Group · NPI 1234567890",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    href: "/pharmacy",
    icon: "💊",
    access: [
      "Manage refill worklist",
      "Reply to patient messages",
      "Escalate to provider with AI draft",
      "Track queue status",
    ],
  },
  {
    role: "provider",
    title: "Provider",
    name: "Dr. Sarah Chen, PharmD",
    credential: "provider@demo.unstuckmed.com",
    password: "demo1234",
    org: "Summit Clinic · Lic #CA-89211",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    href: "/provider",
    icon: "🩺",
    access: [
      "Review pending refill requests",
      "Approve or require patient visit",
      "Sign clinical audit notes",
      "Get AI draft recommendations",
    ],
  },
];

export default function PortalPage() {
  const [resetting, setResetting] = useState(false);
  const [selected, setSelected] = useState<Role | null>(null);

  function handleSelect(role: Role, href: string) {
    setSelected(role);
    setCurrentRole(role);
    setTimeout(() => {
      window.location.href = href;
    }, 350);
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
        fontFamily: '"Inter","Sora",sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: "52px",
          background: "rgba(240,240,240,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 700,
            fontSize: "15px",
            color: "#0D1117",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          UnStuck Med
        </Link>
        <span
          style={{
            fontSize: "11px",
            color: "#6E7681",
            fontWeight: 500,
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "999px",
            padding: "3px 12px",
          }}
        >
          Hackathon Demo · All data is pre-seeded
        </span>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "44px" }}>
          <div
            style={{
              display: "inline-block",
              background: "#0D1117",
              color: "#fff",
              fontFamily: "monospace",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 14px",
              borderRadius: "999px",
              marginBottom: "16px",
            }}
          >
            Demo Login
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem,3vw,2.6rem)",
              fontWeight: 700,
              color: "#0D1117",
              letterSpacing: "-0.035em",
              margin: "0 0 10px",
              lineHeight: 1.15,
            }}
          >
            Choose your role
          </h1>
          <p style={{ fontSize: "14px", color: "#6E7681", margin: 0 }}>
            Each role has isolated access — switch any time during the demo.
            <br />
            All data is pre-seeded with a real patient scenario.
          </p>
        </div>

        {/* Role cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            width: "100%",
            maxWidth: "860px",
            marginBottom: "32px",
          }}
        >
          {ROLES.map(({ role, title, name, credential, password, org, color, bg, border, href, icon, access }) => (
            <button
              key={role}
              onClick={() => handleSelect(role, href)}
              style={{
                background: selected === role ? color : "#ffffff",
                border: `2px solid ${selected === role ? color : border}`,
                borderRadius: "16px",
                padding: "24px 22px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s ease",
                opacity: selected && selected !== role ? 0.4 : 1,
                transform: selected === role ? "scale(0.97)" : "scale(1)",
                boxShadow:
                  selected === role
                    ? `0 0 0 4px ${color}22, 0 8px 24px rgba(0,0,0,0.12)`
                    : "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* Icon + name */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: selected === role ? "rgba(255,255,255,0.18)" : bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: selected === role ? "#fff" : "#0D1117", letterSpacing: "-0.02em" }}>
                    {title}
                  </div>
                  <div style={{ fontSize: "11.5px", color: selected === role ? "rgba(255,255,255,0.7)" : "#6E7681", fontWeight: 500 }}>
                    {name}
                  </div>
                </div>
              </div>

              {/* Credentials box */}
              <div
                style={{
                  background: selected === role ? "rgba(0,0,0,0.15)" : "#F9FAFB",
                  border: `1px solid ${selected === role ? "rgba(255,255,255,0.15)" : "#E5E7EB"}`,
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "14px",
                  fontFamily: "monospace",
                }}
              >
                <div style={{ fontSize: "10px", color: selected === role ? "rgba(255,255,255,0.5)" : "#C9D1D9", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Demo credentials
                </div>
                <div style={{ fontSize: "11.5px", color: selected === role ? "rgba(255,255,255,0.9)" : "#374151", marginBottom: "2px" }}>
                  {credential}
                </div>
                <div style={{ fontSize: "11px", color: selected === role ? "rgba(255,255,255,0.5)" : "#9CA3AF" }}>
                  Password: {password}
                </div>
              </div>

              {/* Access list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "18px" }}>
                {access.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontSize: "12px",
                      color: selected === role ? "rgba(255,255,255,0.85)" : "#374151",
                    }}
                  >
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: selected === role ? "rgba(255,255,255,0.55)" : color,
                        flexShrink: 0,
                      }}
                    />
                    {item}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  background: selected === role ? "rgba(255,255,255,0.18)" : color,
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  textAlign: "center",
                  letterSpacing: "-0.01em",
                }}
              >
                {selected === role ? "Signing in…" : `Sign in as ${title}`}
              </div>
            </button>
          ))}
        </div>

        {/* Org tag */}
        <div style={{ fontSize: "11px", color: "#C9D1D9", textAlign: "center", marginBottom: "16px" }}>
          Demo scenario: Patient Alex Rivera · Pharmacy Summit Rx · Provider Dr. Sarah Chen
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          style={{
            background: "none",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            padding: "7px 18px",
            fontSize: "12px",
            color: "#6E7681",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {resetting ? "Demo data reset!" : "Reset demo data"}
        </button>
      </div>
    </div>
  );
}
