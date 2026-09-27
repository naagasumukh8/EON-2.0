"use client";
import React from "react";
import { setCurrentRole, type Role } from "../../lib/demo-messages";

const ROLES: { role: Role; label: string; color: string; bg: string; href: string; icon: string }[] = [
  { role: "patient",  label: "Patient",  color: "#1d4ed8", bg: "#EFF6FF", href: "/patient",  icon: "👤" },
  { role: "pharmacy", label: "Pharmacy", color: "#15803d", bg: "#F0FDF4", href: "/pharmacy", icon: "💊" },
  { role: "provider", label: "Provider", color: "#7c3aed", bg: "#F5F3FF", href: "/provider", icon: "🩺" },
];

export function RoleSwitcher({ current }: { current: Role }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: "rgba(0,0,0,0.04)",
        borderRadius: "999px",
        padding: "3px",
        border: "1px solid rgba(0,0,0,0.07)",
      }}
    >
      {ROLES.map(({ role, label, color, bg, href, icon }) => {
        const active = role === current;
        return (
          <button
            key={role}
            onClick={() => {
              if (!active) {
                setCurrentRole(role);
                window.location.href = href;
              }
            }}
            title={`Switch to ${label}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "999px",
              border: "none",
              cursor: active ? "default" : "pointer",
              background: active ? color : "transparent",
              color: active ? "#fff" : "#6E7681",
              fontSize: "11.5px",
              fontWeight: active ? 700 : 500,
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: "12px" }}>{icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
