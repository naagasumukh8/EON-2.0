"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, CheckCircle, Info } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

/* ── Workflow data (exactly from image) ─────────────────── */
const NEW_RX_STEPS = [
  { id: 1, label: "Patient Visit",      desc: "Patient sees provider (in person or telehealth)" },
  { id: 2, label: "Clinical Decision",  desc: "Provider determines medication is needed"        },
  { id: 3, label: "eRx Created",        desc: "Provider sends electronic prescription via EHR"  },
  { id: 4, label: "Sent to Pharmacy",   desc: "Goes through eRx network (e.g., Surescripts)"   },
  { id: 5, label: "Pharmacy Intake",    desc: "Pharmacy checks patient, provider, insurance"    },
  { id: 6, label: "Insurance Review",   desc: "PBM checks coverage, copay, PA, step therapy"   },
  { id: 7, label: "Patient Notified",   desc: "Text, call, or app update on status"            },
  { id: 8, label: "Pick Up / Delivery", desc: "Patient picks up or medication is shipped"       },
];

const ACTOR_ROLES: Record<string, Record<number, string[]>> = {
  Patient: {
    1: ["Shares symptoms", "Discusses health history"],
    7: ["Receives status notification"],
    8: ["Picks up or receives medication"],
  },
  Provider: {
    1: ["Reviews history", "Examines patient"],
    2: ["Confirms diagnosis", "Checks allergies, formulary"],
    3: ["Creates eRx (drug, dose, qty, refills, pharmacy)"],
  },
  Pharmacy: {
    4: ["Receives eRx", "Verifies provider & patient", "Insurance eligibility check"],
    5: ["Submits claim to insurance (PBM)"],
    6: ["Prepares medication", "Pharmacist verification"],
    7: ["Notifies patient"],
    8: ["Hands off or ships"],
  },
  "Insurance / PBM": {
    5: ["Receives claim", "Checks coverage, copay, PA, step therapy"],
    6: ["Approves or denies (or requests PA)"],
  },
};

const REFILL_A = [
  { id: 1, label: "Request Refill",      desc: "Patient requests via app, phone, or at pharmacy" },
  { id: 2, label: "Check Prescription",  desc: "Pharmacy checks — refills remaining"             },
  { id: 3, label: "Insurance Claim",     desc: "Claim submitted to PBM"                          },
  { id: 4, label: "Fill & Verify",       desc: "Medication prepared, pharmacist verifies"        },
  { id: 5, label: "Notify & Pick Up",    desc: "Patient notified and picks up or receives"       },
];

const REFILL_B = [
  { id: 1, label: "Request Refill",      desc: "Patient requests via app, phone, or at pharmacy"        },
  { id: 2, label: "Check Prescription",  desc: "Pharmacy checks — NO refills remaining"                 },
  { id: 3, label: "Provider Review",     desc: "Refill request routed to provider",  highlight: true    },
  { id: 4, label: "Approval / Denial",   desc: "Provider approves, denies, or requires visit"           },
  { id: 5, label: "New Rx & Fill",       desc: "If approved, new eRx sent — fill & verify"             },
];

const ACTORS = ["Patient", "Provider", "Pharmacy", "Insurance / PBM"];

function StepPill({
  step,
  label,
  active,
  highlight,
  onClick,
}: {
  step: number;
  label: string;
  active: boolean;
  highlight?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        minWidth: "84px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        opacity: active ? 1 : 0.65,
        transition: "all 0.18s ease",
      }}
    >
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
          fontFamily: "monospace",
          transition: "all 0.18s ease",
          background: active
            ? "rgb(18,19,23)"
            : highlight
            ? "#FFFBEB"
            : "#ffffff",
          color: active
            ? "#ffffff"
            : highlight
            ? "#B45309"
            : "rgb(18,19,23)",
          border: active
            ? "2px solid rgb(18,19,23)"
            : highlight
            ? "2px solid #FCD34D"
            : "2px solid rgba(0,0,0,0.12)",
          boxShadow: active ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
        }}
      >
        {step}
      </div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: active ? 600 : 500,
          textAlign: "center",
          lineHeight: 1.25,
          maxWidth: "76px",
          color: active
            ? "rgb(18,19,23)"
            : highlight
            ? "#B45309"
            : "rgba(18,19,23,0.55)",
        }}
      >
        {label}
      </div>
    </button>
  );
}

export default function WorkflowPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [path, setPath] = useState<"A" | "B">("B");
  const [activeRefillStep, setActiveRefillStep] = useState<number | null>(null);

  const refillSteps = path === "A" ? REFILL_A : REFILL_B;
  const activeNewStep = activeStep ? NEW_RX_STEPS[activeStep - 1] : null;
  const activeRefillData = activeRefillStep ? refillSteps[activeRefillStep - 1] : null;

  return (
    <div
      style={{
        background: "#F0F0F0",
        color: "rgb(18,19,23)",
        fontFamily: '"Google Sans","Sora",-apple-system,BlinkMacSystemFont,sans-serif',
        minHeight: "100vh",
      }}
    >
      <AppHeader activePath="/workflow" />

      <main style={{ maxWidth: "1240px", margin: "0 auto", padding: "40px 24px 80px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header */}
        <div>
          <p style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(18,19,23,0.38)", margin: "0 0 8px" }}>
            Prescription Lifecycle Architecture
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.035em", color: "rgb(18,19,23)", margin: "0 0 6px" }}>
            Prescription &amp; Refill Workflow
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(18,19,23,0.55)", margin: 0 }}>
            The cross-organizational hand-offs between patient, provider, pharmacy, and insurance/PBM.
          </p>
        </div>

        {/* ── Section 1: New Prescription ─────────────────── */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 28px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(0,0,0,0.015)",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "rgb(18,19,23)",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              1
            </span>
            <h2 style={{ fontSize: "17px", fontWeight: 650, color: "rgb(18,19,23)", margin: 0 }}>
              New Prescription Workflow
            </h2>
            <span style={{ fontSize: "12.5px", color: "rgba(18,19,23,0.45)", marginLeft: "4px" }}>
              Click any step to see actor responsibilities
            </span>
          </div>

          <div style={{ padding: "28px" }}>
            {/* Step pills row */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
              {NEW_RX_STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <StepPill
                    step={s.id}
                    label={s.label}
                    active={activeStep === s.id}
                    onClick={() => setActiveStep(activeStep === s.id ? null : s.id)}
                  />
                  {i < NEW_RX_STEPS.length - 1 && (
                    <ChevronRight style={{ width: 14, height: 14, color: "rgba(18,19,23,0.25)", flexShrink: 0 }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Active step detail */}
            {activeNewStep && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "rgba(0,0,0,0.025)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgb(18,19,23)",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {activeNewStep.id}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 650, color: "rgb(18,19,23)" }}>{activeNewStep.label}</div>
                  <div style={{ fontSize: "12.5px", color: "rgba(18,19,23,0.6)" }}>{activeNewStep.desc}</div>
                </div>
              </div>
            )}

            {/* Actor matrix */}
            <div style={{ overflowX: "auto", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)" }}>
              <table style={{ width: "100%", minWidth: "820px", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.025)" }}>
                    <th style={{ width: "130px", padding: "12px 18px", textAlign: "left", fontFamily: "monospace", fontSize: "10.5px", fontWeight: 700, color: "rgba(18,19,23,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      Actor
                    </th>
                    {NEW_RX_STEPS.map(s => (
                      <th key={s.id} style={{ textAlign: "center", padding: "8px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <button
                          onClick={() => setActiveStep(activeStep === s.id ? null : s.id)}
                          style={{
                            width: "100%",
                            textAlign: "center",
                            padding: "6px 8px",
                            borderRadius: "9999px",
                            fontSize: "11px",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            background: activeStep === s.id ? "rgb(18,19,23)" : "transparent",
                            color: activeStep === s.id ? "#fff" : "rgba(18,19,23,0.55)",
                          }}
                        >
                          {s.id}. {s.label}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ACTORS.map(actor => (
                    <tr key={actor} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <td style={{ padding: "14px 18px", fontWeight: 600, color: "rgb(18,19,23)", fontSize: "12.5px", whiteSpace: "nowrap" }}>
                        {actor}
                      </td>
                      {NEW_RX_STEPS.map(s => {
                        const roles = ACTOR_ROLES[actor]?.[s.id];
                        return (
                          <td
                            key={s.id}
                            style={{
                              padding: "12px 8px",
                              verticalAlign: "top",
                              fontSize: "12px",
                              background: activeStep === s.id ? "rgba(0,0,0,0.025)" : "transparent",
                            }}
                          >
                            {roles ? (
                              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "3px" }}>
                                {roles.map((r, i) => (
                                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "5px", color: "rgba(18,19,23,0.75)" }}>
                                    <span style={{ color: "#166534", fontWeight: 700, lineHeight: 1 }}>·</span>
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span style={{ color: "rgba(18,19,23,0.2)", display: "block", textAlign: "center" }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Section 2: Refill Workflow ───────────────────── */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 28px",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(0,0,0,0.015)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "rgb(18,19,23)",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                2
              </span>
              <h2 style={{ fontSize: "17px", fontWeight: 650, color: "rgb(18,19,23)", margin: 0 }}>
                Refill Workflow
              </h2>
              <span style={{ fontSize: "12.5px", color: "rgba(18,19,23,0.45)" }}>
                Path depends on whether refills remain
              </span>
            </div>
          </div>

          <div style={{ padding: "28px" }}>
            {/* Path toggle */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
              {(["A", "B"] as const).map(p => {
                const isSelected = path === p;
                return (
                  <button
                    key={p}
                    onClick={() => { setPath(p); setActiveRefillStep(null); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 18px",
                      borderRadius: "9999px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      background: isSelected ? "rgb(18,19,23)" : "rgba(0,0,0,0.04)",
                      color: isSelected ? "#fff" : "rgb(18,19,23)",
                      border: isSelected ? "1px solid rgb(18,19,23)" : "1px solid rgba(0,0,0,0.07)",
                    }}
                  >
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isSelected ? "#fff" : "rgba(18,19,23,0.15)",
                        color: isSelected ? "rgb(18,19,23)" : "rgb(18,19,23)",
                      }}
                    >
                      {p}
                    </span>
                    <span>{p === "A" ? "Refills Remaining (Standard Path)" : "No Refills Remaining"}</span>
                    {p === "B" && (
                      <span
                        style={{
                          fontSize: "10px",
                          background: isSelected ? "#4ADE80" : "rgba(74,222,128,0.2)",
                          color: isSelected ? "rgb(18,19,23)" : "#166534",
                          padding: "1px 8px",
                          borderRadius: "9999px",
                          fontWeight: 700,
                        }}
                      >
                        Our Focus
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Refill steps */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
              {refillSteps.map((s, i) => (
                <React.Fragment key={s.id}>
                  <StepPill
                    step={s.id}
                    label={s.label}
                    active={activeRefillStep === s.id}
                    highlight={(s as any).highlight}
                    onClick={() => setActiveRefillStep(activeRefillStep === s.id ? null : s.id)}
                  />
                  {i < refillSteps.length - 1 && (
                    <ChevronRight style={{ width: 14, height: 14, color: "rgba(18,19,23,0.25)", flexShrink: 0 }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Active refill step */}
            {activeRefillData && (
              <div
                style={{
                  marginBottom: "24px",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: (activeRefillData as any).highlight ? "1px solid rgba(180,83,9,0.25)" : "1px solid rgba(0,0,0,0.08)",
                  background: (activeRefillData as any).highlight ? "#FFFBEB" : "rgba(0,0,0,0.025)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: (activeRefillData as any).highlight ? "#B45309" : "rgb(18,19,23)",
                  }}
                >
                  {activeRefillData.id}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 650, color: (activeRefillData as any).highlight ? "#78350F" : "rgb(18,19,23)" }}>
                    {activeRefillData.label}
                    {(activeRefillData as any).highlight && (
                      <span style={{ marginLeft: "8px", fontSize: "10.5px", background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: "9999px", fontWeight: 700 }}>
                        UnStuck Med intercepts here
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12.5px", color: (activeRefillData as any).highlight ? "#92400E" : "rgba(18,19,23,0.6)" }}>
                    {activeRefillData.desc}
                  </div>
                </div>
              </div>
            )}

            {/* Info panels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", marginTop: "16px" }}>
              <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "16px", padding: "18px" }}>
                <div style={{ fontFamily: "monospace", fontSize: "10.5px", fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Info style={{ width: 13, height: 13 }} /> When a visit is required
                </div>
                {["Blood pressure medications", "Diabetes medications", "Antidepressants", "ADHD / controlled substances", "Provider wants condition check"].map((m, i) => (
                  <div key={i} style={{ fontSize: "12.5px", color: "rgba(18,19,23,0.7)", display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#B45309", flexShrink: 0 }} /> {m}
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "16px", padding: "18px" }}>
                <div style={{ fontFamily: "monospace", fontSize: "10.5px", fontWeight: 700, color: "rgba(18,19,23,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Info style={{ width: 13, height: 13 }} /> Insurance issues (even with refills)
                </div>
                {["Too early to refill", "New prior authorization needed", "Insurance plan changed", "Not covered on formulary"].map((m, i) => (
                  <div key={i} style={{ fontSize: "12.5px", color: "rgba(18,19,23,0.7)", display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(18,19,23,0.35)", flexShrink: 0 }} /> {m}
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "16px", padding: "18px" }}>
                <div style={{ fontFamily: "monospace", fontSize: "10.5px", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle style={{ width: 13, height: 13 }} /> Typical refill statuses
                </div>
                {["Refill requested", "Prescription located", "Refills available", "Insurance processing", "Provider approval pending", "Ready for pickup", "Dispensed"].map((s, i) => (
                  <div key={i} style={{ fontSize: "12.5px", color: "rgba(18,19,23,0.7)", display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} /> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 3: Where UnStuck Med fits ───────────────────────── */}
        <div
          style={{
            background: "rgb(18,19,23)",
            borderRadius: "28px",
            padding: "44px 36px",
            color: "#ffffff",
          }}
        >
          <div style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: "#8AB4F8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
            Where UnStuck Med Intervenes
          </div>
          <h3 style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.1rem)", fontWeight: 650, letterSpacing: "-0.03em", color: "#ffffff", margin: "0 0 10px", lineHeight: 1.2 }}>
            We own the gap between Step 2 and Step 5 on Path B
          </h3>
          <p style={{ fontSize: "14.5px", color: "rgba(255,255,255,0.6)", marginBottom: "32px", maxWidth: "640px", lineHeight: 1.6 }}>
            When zero refills remain, AI classifies the root cause in seconds and routes the exact clinical action to the right actor automatically.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "32px" }}>
            {[
              { step: "B-2", label: "Block Detected",  desc: "Zero refills — pharmacy flags denial", badge: "#FCA5A5" },
              { step: "B-3", label: "AI Classifies",   desc: "Deterministic root-cause < 4s", badge: "#8AB4F8" },
              { step: "B-4", label: "Action Routed",   desc: "Right task pre-filled for clinician", badge: "#FCD34D" },
              { step: "B-5", label: "Fill Complete",   desc: "Audit logged, patient notified", badge: "#4ADE80" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ fontFamily: "monospace", fontSize: "10.5px", fontWeight: 700, color: s.badge }}>
                  {s.step}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 650, color: "#fff" }}>{s.label}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.48)", lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/classify"
              style={{
                background: "#ffffff",
                color: "rgb(18,19,23)",
                fontSize: "13.5px",
                fontWeight: 600,
                padding: "10px 22px",
                borderRadius: "9999px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Try AI Classifier <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
            <Link
              href="/dashboard"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#ffffff",
                fontSize: "13.5px",
                fontWeight: 550,
                padding: "10px 22px",
                borderRadius: "9999px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Open Refill Queue <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
