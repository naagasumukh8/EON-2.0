"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { setCurrentRole, resetDemoData, type Role } from "../../lib/demo-messages";

const ROLES: {
  role: Role;
  title: string;
  subtitle: string;
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
    subtitle: "Alex Rivera",
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    href: "/patient",
    icon: "👤",
    access: [
      "View your prescription status",
      "Message your pharmacy",
      "Message your provider",
      "Track refill progress",
    ],
  },
  {
    role: "pharmacy",
    title: "Pharmacy",
    subtitle: "Summit Rx — Central Fill",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    href: "/pharmacy",
    icon: "💊",
    access: [
      "Manage refill worklist",
      "Reply to patient messages",
      "Coordinate with providers",
      "Track queue & status",
    ],
  },
  {
    role: "provider",
    title: "Provider",
    subtitle: "Dr. Sarah Chen, PharmD",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    href: "/provider",
    icon: "🩺",
    access: [
      "Review pending refill requests",
      "Approve or deny prescriptions",
      "Reply to pharmacy messages",
      "Sign clinical actions",
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
    }, 320);
  }

  function handleReset() {
    setResetting(true);
    resetDemoData();
    setTimeout(() => setResetting(false), 800);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F0F0F0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: '"Inter", "Sora", sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <Link
          href="/"
          style={{
            fontSize: "13px",
            color: "#6E7681",
            textDecoration: "none",
            letterSpacing: "0.05em",
            fontWeight: 500,
            display: "block",
            marginBottom: "16px",
          }}
        >
          UnStuck Med
        </Link>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#0D1117",
            letterSpacing: "-0.03em",
            margin: "0 0 8px",
            lineHeight: 1.15,
          }}
        >
          Choose your portal
        </h1>
        <p style={{ fontSize: "14px", color: "#6E7681", margin: 0 }}>
          Demo mode. All data is pre-seeded. Nothing is stored externally.
        </p>
      </div>

      {/* Role cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        {ROLES.map(({ role, title, subtitle, color, bg, border, href, icon, access }) => (
          <button
            key={role}
            onClick={() => handleSelect(role, href)}
            style={{
              background: selected === role ? color : "#ffffff",
              border: `2px solid ${selected === role ? color : border}`,
              borderRadius: "16px",
              padding: "28px 24px",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
              opacity: selected && selected !== role ? 0.45 : 1,
              transform: selected === role ? "scale(0.97)" : "scale(1)",
              boxShadow:
                selected === role
                  ? `0 0 0 4px ${color}22, 0 8px 24px rgba(0,0,0,0.12)`
                  : "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: selected === role ? "rgba(255,255,255,0.2)" : bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "17px",
                    color: selected === role ? "#fff" : "#0D1117",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: selected === role ? "rgba(255,255,255,0.75)" : "#6E7681",
                    fontWeight: 500,
                  }}
                >
                  {subtitle}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {access.map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12.5px",
                    color: selected === role ? "rgba(255,255,255,0.88)" : "#374151",
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: selected === role ? "rgba(255,255,255,0.6)" : color,
                      flexShrink: 0,
                    }}
                  />
                  {item}
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "20px",
                padding: "9px 16px",
                borderRadius: "8px",
                background: selected === role ? "rgba(255,255,255,0.2)" : color,
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                textAlign: "center",
                letterSpacing: "-0.01em",
              }}
            >
              {selected === role ? "Entering…" : `Enter as ${title}`}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
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
            transition: "all 0.15s",
          }}
        >
          {resetting ? "Demo data reset!" : "Reset demo data"}
        </button>
        <p
          style={{
            fontSize: "11px",
            color: "#C9D1D9",
            margin: 0,
            textAlign: "center",
          }}
        >
          Each role has isolated access. Patient cannot see pharmacy operations.
          <br />
          Provider does not see patient messaging history.
        </p>
      </div>
    </div>
  );
}
