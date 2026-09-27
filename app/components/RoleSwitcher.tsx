"use client";
import React from "react";
import { User, Building2, Stethoscope } from "lucide-react";
import { setCurrentRole, type Role } from "../../lib/demo-messages";

const ROLES: { role: Role; label: string; color: string; bg: string; href: string; Icon: React.ElementType }[] = [
  { role: "patient",  label: "Patient",  color: "#1d4ed8", bg: "#EFF6FF", href: "/patient",  Icon: User },
  { role: "pharmacy", label: "Pharmacy", color: "#15803d", bg: "#F0FDF4", href: "/pharmacy", Icon: Building2 },
  { role: "provider", label: "Provider", color: "#7c3aed", bg: "#F5F3FF", href: "/provider", Icon: Stethoscope },
];

export function RoleSwitcher({ current }: { current: Role }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", background: "rgba(0,0,0,0.05)", borderRadius: "999px", padding: "3px", border: "1px solid rgba(0,0,0,0.07)" }}>
      {ROLES.map(({ role, label, color, bg, href, Icon }) => {
        const active = role === current;
        return (
          <button key={role}
            onClick={() => { if (!active) { setCurrentRole(role); window.location.href = href; } }}
            title={`Switch to ${label}`}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "999px", border: "none", cursor: active ? "default" : "pointer", background: active ? "rgb(18,19,23)" : "transparent", color: active ? "#fff" : "#6E7681", fontSize: "11.5px", fontWeight: active ? 700 : 500, transition: "all 0.15s ease", whiteSpace: "nowrap" }}>
            <Icon style={{ width: 11, height: 11 }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
