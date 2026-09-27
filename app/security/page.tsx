"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Eye, FileText, Users, Server, Key, AlertTriangle, CheckCircle } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

const PILLARS = [
  { icon: Shield,        title: "Authentication & MFA",        sub: "Supabase Auth + TOTP enforcement per clinic org. 1-hr idle timeout." },
  { icon: Lock,          title: "Row-Level Security",           sub: "RLS on all tables. org_id matched to JWT. Insert-only on audit events." },
  { icon: Eye,           title: "Zero-PII Pipeline",            sub: "Names, DOBs stripped pre-classifier. Only med_class, block_type analyzed." },
  { icon: FileText,      title: "Immutable Audit Trail",        sub: "Append-only refill_events table. Every state transition stamped." },
  { icon: Users,         title: "Role-Based Access (RBAC)",     sub: "4 roles: staff, provider, pharmacist, admin. Strict clinical separation." },
  { icon: Server,        title: "Encryption at Rest & Transit", sub: "AES-256 at rest. TLS 1.3 in transit. Zero clinical data in localStorage." },
  { icon: Key,           title: "Patient Notification Privacy", sub: "SMS bodies never include medication name, dosage, or condition." },
  { icon: AlertTriangle, title: "Autonomy Guardrails",          sub: "Therapy-affecting actions always require human sign-off. No exceptions." },
];

export default function SecurityPage() {
  return (
    <div
      style={{
        background: "#F0F0F0",
        color: "rgb(18,19,23)",
        fontFamily: '"Google Sans","Sora",-apple-system,BlinkMacSystemFont,sans-serif',
        minHeight: "100vh",
      }}
    >
      <AppHeader activePath="/security" />

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 24px 80px", display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* Header */}
        <div>
          <p style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(18,19,23,0.38)", margin: "0 0 8px" }}>
            Security &amp; Trust
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.035em", color: "rgb(18,19,23)", margin: "0 0 10px" }}>
            What we built. What we claim. What we don&apos;t.
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(18,19,23,0.55)", maxWidth: "600px", lineHeight: 1.6, margin: 0 }}>
            Healthcare interoperability requires radical honesty — implemented safeguards, alongside deliberate boundaries we refuse to cross.
          </p>
        </div>

        {/* Quick summary bar in dark style */}
        <div
          style={{
            background: "rgb(18,19,23)",
            color: "#ffffff",
            borderRadius: "20px",
            padding: "20px 28px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", fontSize: "12.5px", fontWeight: 550 }}>
            {[
              { icon: Lock,     label: "AES-256 At Rest" },
              { icon: Shield,   label: "TLS 1.3 In Transit" },
              { icon: FileText, label: "Insert-Only Audit Trail" },
              { icon: Eye,      label: "Pre-Triage PII Stripping" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon style={{ width: 15, height: 15, color: "#4ADE80", flexShrink: 0 }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8 Pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "14px" }}>
          {PILLARS.map(p => (
            <div
              key={p.title}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 8px 24px -6px rgba(0,0,0,0.03)",
                padding: "20px 24px",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  background: "rgba(0,0,0,0.04)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <p.icon style={{ width: 16, height: 16, color: "rgb(18,19,23)" }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 650, color: "rgb(18,19,23)", margin: 0 }}>{p.title}</h3>
                  <span style={{ fontSize: "10px", fontWeight: 700, background: "#F0FDF4", color: "#166534", padding: "1px 8px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <CheckCircle style={{ width: 10, height: 10 }} /> Live
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "rgba(18,19,23,0.55)", lineHeight: 1.55, margin: 0 }}>
                  {p.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Clinical Design Invariants */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
            padding: "26px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 650, color: "rgb(18,19,23)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Shield style={{ width: 16, height: 16, color: "rgb(18,19,23)" }} /> Core Clinical Design Invariants
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "14px", padding: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "13px", fontWeight: 650, color: "rgb(18,19,23)", margin: "0 0 4px" }}>We do not suggest alternate providers</p>
              <p style={{ fontSize: "12px", color: "rgba(18,19,23,0.55)", lineHeight: 1.55, margin: 0 }}>Clinical continuity stays with the assigned provider. We route paperwork, never the patient-physician relationship.</p>
            </div>
            <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "14px", padding: "16px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "13px", fontWeight: 650, color: "rgb(18,19,23)", margin: "0 0 4px" }}>Pharmacy transfers are drafts, not reroutes</p>
              <p style={{ fontSize: "12px", color: "rgba(18,19,23,0.55)", lineHeight: 1.55, margin: 0 }}>When a pharmacy has a stock outage, the system surfaces transfer options as a draft. A human must explicitly dispatch.</p>
            </div>
          </div>
        </div>

        {/* Prototype Transparency */}
        <div style={{ background: "#FFFBEB", borderRadius: "16px", border: "1px solid rgba(180,83,9,0.2)", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <AlertTriangle style={{ width: 16, height: 16, color: "#B45309", flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "12.5px", color: "#78350F", lineHeight: 1.55 }}>
            <strong style={{ color: "#92400E" }}>Prototype Transparency:</strong> Built in a constrained hackathon sprint window. Demonstrates full compliance architecture; no formal SOC 2 or HIPAA third-party audit has been conducted.
            All patient tokens, prescriptions, and pharmacy inventories shown are simulated demo data.
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ fontSize: "12.5px", color: "rgba(18,19,23,0.45)", margin: 0 }}>Architecture verified for hackathon judging presentation.</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/dashboard"
              style={{
                background: "rgb(18,19,23)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 550,
                padding: "8px 20px",
                borderRadius: "9999px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Open Queue <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
            <Link
              href="/"
              style={{
                background: "rgba(0,0,0,0.05)",
                color: "rgb(18,19,23)",
                fontSize: "13px",
                fontWeight: 550,
                padding: "8px 18px",
                borderRadius: "9999px",
                textDecoration: "none",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
