"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, User, Building2, Stethoscope, CheckCircle2, Clock } from "lucide-react";
import { setCurrentRole, type Role } from "../../lib/demo-messages";

interface DemoFlowBarProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function DemoFlowBar({ currentStep }: DemoFlowBarProps) {
  const steps = [
    {
      num: 1,
      label: "1. Patient Request",
      desc: "Sarah / Alex requests Metformin",
      href: "/patient",
      role: "patient" as Role,
      Icon: User,
    },
    {
      num: 2,
      label: "2. Pharmacy Triage",
      desc: "Summit Rx runs AI triage",
      href: "/pharmacy",
      role: "pharmacy" as Role,
      Icon: Building2,
    },
    {
      num: 3,
      label: "3. Provider Sign-off",
      desc: "Dr. Chen approves eRx / alternative",
      href: "/provider",
      role: "provider" as Role,
      Icon: Stethoscope,
    },
    {
      num: 4,
      label: "4. Patient Visibility",
      desc: "Live tracker & pickup ETA",
      href: "/patient",
      role: "patient" as Role,
      Icon: Clock,
    },
  ];

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid rgba(0, 0, 0, 0.07)",
        padding: "8px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        overflowX: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <span
          style={{
            fontSize: "10px",
            fontFamily: "ui-monospace, monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#6B7280",
            background: "rgba(0,0,0,0.04)",
            padding: "3px 8px",
            borderRadius: "6px",
          }}
        >
          1-Click Live Demo Flow
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
        {steps.map((s, idx) => {
          const isCurrent = currentStep === s.num;
          return (
            <React.Fragment key={s.num}>
              <Link
                href={s.href}
                onClick={() => setCurrentRole(s.role)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  textDecoration: "none",
                  fontSize: "11.5px",
                  fontWeight: isCurrent ? 700 : 500,
                  background: isCurrent ? "rgb(18,19,23)" : "rgba(0,0,0,0.03)",
                  color: isCurrent ? "#FFFFFF" : "rgb(70,70,75)",
                  border: isCurrent ? "1px solid rgb(18,19,23)" : "1px solid rgba(0,0,0,0.06)",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <s.Icon style={{ width: 12, height: 12, color: isCurrent ? "#FFFFFF" : "#6B7280" }} />
                <span>{s.label}</span>
              </Link>
              {idx < steps.length - 1 && (
                <ArrowRight style={{ width: 11, height: 11, color: "#C4C8D0", flexShrink: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
