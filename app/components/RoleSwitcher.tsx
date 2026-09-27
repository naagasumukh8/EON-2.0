"use client";
import React from "react";
import { User, Building2, Stethoscope } from "lucide-react";
import { setCurrentRole, type Role } from "../../lib/demo-messages";

const ROLES: { role: Role; label: string; color: string; bg: string; href: string; Icon: React.ElementType }[] = [
  { role: "patient",  label: "Patient",  color: "#2563EB", bg: "#EFF6FF", href: "/patient",  Icon: User },
  { role: "pharmacy", label: "Pharmacy", color: "#16A34A", bg: "#F0FDF4", href: "/pharmacy", Icon: Building2 },
  { role: "provider", label: "Provider", color: "#9333EA", bg: "#FAF5FF", href: "/provider", Icon: Stethoscope },
];

export function RoleSwitcher({ current }: { current: Role }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        background: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(12px)",
        borderRadius: "9999px",
        padding: "3px 4px",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
      }}
    >
      {ROLES.map(({ role, label, href, Icon }) => {
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
            title={`Switch to ${label} portal`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              borderRadius: "9999px",
              border: "none",
              cursor: active ? "default" : "pointer",
              background: active ? "rgb(18, 19, 23)" : "transparent",
              color: active ? "#FFFFFF" : "rgb(90, 90, 96)",
              fontSize: "12px",
              fontFamily: '"Google Sans", "Sora", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: active ? 600 : 500,
              transition: "all 0.16s ease",
              whiteSpace: "nowrap",
            }}
          >
            <Icon style={{ width: 12, height: 12, strokeWidth: active ? 2.4 : 2 }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
