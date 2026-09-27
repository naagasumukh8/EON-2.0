"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ChevronRight, Users, Building2, Shield, Pill } from "lucide-react";

/* ─── Workflow data matching the image exactly ─────── */
const NEW_RX_STEPS = [
  { id: 1, label: "Patient Visit",       color: "#dbeafe", icon: "🏥", actor: ["Patient","Provider"],     desc: "Patient sees provider (in person or telehealth)" },
  { id: 2, label: "Clinical Decision",   color: "#dbeafe", icon: "🧠", actor: ["Provider"],               desc: "Provider determines medication is needed"        },
  { id: 3, label: "eRx Created",         color: "#dcfce7", icon: "📝", actor: ["Provider"],               desc: "Provider sends electronic prescription via EHR"  },
  { id: 4, label: "Sent to Pharmacy",    color: "#dcfce7", icon: "📤", actor: ["Provider","Pharmacy"],    desc: "Prescription goes through eRx network (e.g., Surescripts)" },
  { id: 5, label: "Pharmacy Intake",     color: "#fef3c7", icon: "💊", actor: ["Pharmacy","Insurance"],   desc: "Pharmacy checks patient, provider, medication + insurance" },
  { id: 6, label: "Insurance Review",    color: "#fef3c7", icon: "🛡️", actor: ["Insurance"],             desc: "Claim processed. Checks coverage, copay, PA, step therapy" },
  { id: 7, label: "Patient Notified",    color: "#f3e8ff", icon: "🔔", actor: ["Pharmacy","Patient"],    desc: "Text, call, or app update on status"             },
  { id: 8, label: "Pick Up / Delivery",  color: "#dcfce7", icon: "✅", actor: ["Patient","Pharmacy"],    desc: "Patient picks up medication or it's shipped"     },
];

const REFILL_A_STEPS = [
  { id: 1, label: "Request Refill",    color: "#dbeafe", icon: "📲", desc: "Patient requests refill via app, phone, or pharmacy" },
  { id: 2, label: "Check Prescription",color: "#dbeafe", icon: "🔍", desc: "Pharmacy checks prescription, refills remaining"      },
  { id: 3, label: "Insurance Claim",   color: "#fef3c7", icon: "🛡️", desc: "Claim submitted to insurance (PBM)"                  },
  { id: 4, label: "Fill & Verify",     color: "#dcfce7", icon: "💊", desc: "Medication prepared and pharmacist verifies"         },
  { id: 5, label: "Notify & Pick Up",  color: "#dcfce7", icon: "✅", desc: "Patient notified and picks up or receives medication" },
];

const REFILL_B_STEPS = [
  { id: 1, label: "Request Refill",    color: "#dbeafe", icon: "📲", desc: "Patient requests refill via app, phone, or pharmacy"        },
  { id: 2, label: "Check Prescription",color: "#fee2e2", icon: "🔍", desc: "Pharmacy checks — NO refills remaining"                     },
  { id: 3, label: "Provider Review",   color: "#fef3c7", icon: "👨‍⚕️", desc: "Refill request sent to provider for review"                },
  { id: 4, label: "Approval / Denial", color: "#fef3c7", icon: "⚖️", desc: "Provider approves, denies, or asks for a visit"            },
  { id: 5, label: "New Rx & Fill",     color: "#dcfce7", icon: "✅", desc: "If approved, new eRx sent to pharmacy. Fill & verify."     },
];

const ACTORS = [
  { key: "Patient",   icon: "🧑", color: "#dbeafe", label: "Patient"      },
  { key: "Provider",  icon: "👨‍⚕️", color: "#dcfce7", label: "Provider"     },
  { key: "Pharmacy",  icon: "💊", color: "#fef3c7", label: "Pharmacy"     },
  { key: "Insurance", icon: "🛡️", color: "#f3e8ff", label: "Insurance/PBM" },
];

const ACTOR_ROLES_NEW: Record<string, Record<number, string[]>> = {
  Patient:   { 1: ["Shares symptoms","Discusses health history"], 7: ["Gets notification"], 8: ["Picks up or receives medication"] },
  Provider:  { 1: ["Reviews patient history","Examines / assesses"], 2: ["Confirms diagnosis","Checks allergies, meds, history"], 3: ["Creates eRx (drug, dose, qty, refills, pharmacy)"] },
  Pharmacy:  { 4: ["Receives eRx","Verifies provider & patient","Clinical checks","Insurance eligibility check"], 5: ["Submits claim to insurance (PBM)"], 6: ["Prepares medication","Pharmacist verification"], 7: ["Notifies patient (text/call/app)"], 8: ["Hands off medication or ships"] },
  Insurance: { 5: ["Receives claim","Checks coverage, copay, PA, step therapy"], 6: ["Approves or denies (or requests PA)"] },
};

const VISIT_MEDS = ["Blood pressure meds", "Diabetes meds", "Antidepressants", "ADHD meds", "Controlled substances", "Or if the provider wants to check in"];

const INSURANCE_ISSUES = ["Too early to refill", "New prior authorization needed", "Insurance change", "Not covered"];

const TYPICAL_STATUSES = [
  "Refill requested","Refill approved/denied","Prescription located",
  "Medication being filled","Refills available?","Ready for pickup",
  "Insurance processing","Dispensed","Provider approval (if needed)","Refill completed"
];

function StepBadge({ step, color, icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 cursor-pointer group transition-all ${active ? "scale-105" : ""}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${active ? "border-[#22c55e] shadow-lg shadow-green-200" : "border-transparent"}`}
        style={{ background: color }}>
        {step}
      </div>
      <div className="text-lg">{icon}</div>
      <div className={`text-[10px] font-semibold text-center leading-tight max-w-[72px] ${active ? "text-[#22c55e]" : "text-[#64748b]"}`}>{label}</div>
    </button>
  );
}

export default function WorkflowPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [refillPath, setRefillPath] = useState<"A" | "B">("A");
  const [activeRefillStep, setActiveRefillStep] = useState<number | null>(null);

  const refillSteps = refillPath === "A" ? REFILL_A_STEPS : REFILL_B_STEPS;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-[#64748b] hover:text-[#22c55e] text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <span className="text-[#e2e8f0]">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>Rx</div>
              <span className="font-black text-sm">RefillOS</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { href: "/", label: "Home" },
              { href: "/workflow", label: "Workflow", active: true },
              { href: "/dashboard", label: "Dashboard" },
              { href: "/classify", label: "AI Classifier" },
            ].map(l => (
              <Link key={l.href} href={l.href} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${(l as any).active ? "bg-[#f0fdf4] text-[#22c55e]" : "text-[#64748b] hover:text-[#22c55e]"}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/classify" className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm">
            Try AI Classifier <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 py-8">

        {/* ══ Section 1: New Prescription Workflow ═══════════════ */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden mb-6">
          <div className="border-b border-[#e2e8f0] px-6 py-4 flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#dbeafe] flex items-center justify-center font-black text-sm text-[#1d4ed8]">1</span>
            <h1 className="font-black text-lg text-[#0f172a]">New Prescription Workflow</h1>
          </div>

          <div className="p-6">
            {/* Step pills */}
            <div className="flex items-start gap-2 mb-6 overflow-x-auto pb-2">
              {NEW_RX_STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <StepBadge step={s.id} color={s.color} icon={s.icon} label={s.label}
                    active={activeStep === s.id}
                    onClick={() => setActiveStep(activeStep === s.id ? null : s.id)}
                  />
                  {i < NEW_RX_STEPS.length - 1 && (
                    <div className="flex-shrink-0 mt-5 text-[#cbd5e1] font-bold">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Step detail */}
            {activeStep && (
              <div className="mb-5 p-4 rounded-xl border-2 border-[#22c55e]/20 bg-[#f0fdf4]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{NEW_RX_STEPS[activeStep - 1].icon}</span>
                  <span className="font-bold text-[#0f172a]">Step {activeStep}: {NEW_RX_STEPS[activeStep - 1].label}</span>
                </div>
                <p className="text-sm text-[#64748b]">{NEW_RX_STEPS[activeStep - 1].desc}</p>
              </div>
            )}

            {/* Actor matrix table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="w-28 text-left p-2 font-semibold text-[#64748b]">Actor</th>
                    {NEW_RX_STEPS.map(s => (
                      <th key={s.id} className="p-2 text-center">
                        <button onClick={() => setActiveStep(activeStep === s.id ? null : s.id)}
                          className={`rounded-lg px-2 py-1.5 font-bold transition-all w-full ${activeStep === s.id ? "bg-[#22c55e] text-white" : "hover:bg-[#f0fdf4]"}`}
                          style={{ background: activeStep === s.id ? "#22c55e" : s.color }}>
                          {s.id}. {s.label}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ACTORS.map(actor => (
                    <tr key={actor.key} className="border-t border-[#f1f5f9]">
                      <td className="p-2">
                        <div className="flex items-center gap-1.5 font-semibold" style={{ color: "#334155" }}>
                          <span className="text-base">{actor.icon}</span>
                          <span>{actor.label}</span>
                        </div>
                      </td>
                      {NEW_RX_STEPS.map(s => {
                        const roles = ACTOR_ROLES_NEW[actor.key]?.[s.id];
                        return (
                          <td key={s.id} className={`p-2 text-center align-top transition-all ${activeStep === s.id ? "bg-[#f0fdf4]" : ""}`}>
                            {roles ? (
                              <ul className="text-left space-y-0.5">
                                {roles.map((r, i) => (
                                  <li key={i} className="flex items-start gap-1 text-[#334155]">
                                    <span className="text-[#22c55e] mt-0.5 flex-shrink-0">•</span>
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-[#cbd5e1]">—</span>
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

        {/* ══ Section 2: Refill Workflow ══════════════════════════ */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden mb-6">
          <div className="border-b border-[#e2e8f0] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#fef3c7] flex items-center justify-center font-black text-sm text-[#b45309]">2</span>
              <h2 className="font-black text-lg text-[#0f172a]">Refill Workflow</h2>
              <span className="text-xs text-[#64748b] font-medium">A refill is a continuation of the original prescription. The path depends on whether refills are left.</span>
            </div>
          </div>

          <div className="p-6">
            {/* Path toggle */}
            <div className="flex gap-3 mb-6">
              {(["A", "B"] as const).map(path => (
                <button key={path} onClick={() => { setRefillPath(path); setActiveRefillStep(null); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${refillPath === path ? "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]" : "border-[#e2e8f0] text-[#64748b] hover:border-[#22c55e]/40"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${refillPath === path ? "bg-[#22c55e]" : "bg-[#94a3b8]"}`}>{path}</span>
                  {path === "A" ? "Refills Remaining (Most Common)" : "No Refills Remaining"}
                  {path === "B" && <span className="tag-red text-[10px] bg-[#fee2e2] text-red-600 px-1.5 py-0.5 rounded-full font-semibold">Our Focus</span>}
                </button>
              ))}
            </div>

            {/* Steps row */}
            <div className="flex items-start gap-2 mb-5 overflow-x-auto pb-2">
              {refillSteps.map((s, i) => (
                <React.Fragment key={s.id}>
                  <StepBadge step={s.id} color={s.color} icon={s.icon} label={s.label}
                    active={activeRefillStep === s.id}
                    onClick={() => setActiveRefillStep(activeRefillStep === s.id ? null : s.id)}
                  />
                  {i < refillSteps.length - 1 && (
                    <div className="flex-shrink-0 mt-5 text-[#cbd5e1] font-bold">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Active refill step detail */}
            {activeRefillStep && (
              <div className="mb-5 p-4 rounded-xl border-2 border-[#22c55e]/20 bg-[#f0fdf4]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{refillSteps[activeRefillStep - 1]?.icon}</span>
                  <span className="font-bold text-[#0f172a]">Step {activeRefillStep}: {refillSteps[activeRefillStep - 1]?.label}</span>
                  {refillPath === "B" && activeRefillStep === 3 && (
                    <span className="ml-2 text-xs bg-[#fee2e2] text-red-600 px-2 py-0.5 rounded-full font-bold">⚡ RefillOS intercepts here</span>
                  )}
                </div>
                <p className="text-sm text-[#64748b]">{refillSteps[activeRefillStep - 1]?.desc}</p>
              </div>
            )}

            {/* Two info panels side by side */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-[#fef3c7]/40 rounded-xl p-4 border border-[#fef3c7]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🏥</span>
                  <span className="font-bold text-xs text-[#0f172a]">When a provider visit is required</span>
                </div>
                <ul className="space-y-1">
                  {VISIT_MEDS.map((m, i) => (
                    <li key={i} className="text-xs text-[#64748b] flex items-center gap-1.5">
                      <span className="text-[#f59e0b]">•</span> {m}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#fee2e2]/40 rounded-xl p-4 border border-[#fee2e2]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">⚠️</span>
                  <span className="font-bold text-xs text-[#0f172a]">Possible insurance issues (even with refills)</span>
                </div>
                <ul className="space-y-1">
                  {INSURANCE_ISSUES.map((m, i) => (
                    <li key={i} className="text-xs text-[#64748b] flex items-center gap-1.5">
                      <span className="text-red-400">•</span> {m}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#f0fdf4] rounded-xl p-4 border border-[#bbf7d0]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🕐</span>
                  <span className="font-bold text-xs text-[#0f172a]">Typical Refill Workflow Statuses</span>
                </div>
                <ul className="space-y-1">
                  {TYPICAL_STATUSES.map((s, i) => (
                    <li key={i} className="text-xs text-[#64748b] flex items-center gap-1.5">
                      <span className="text-[#22c55e]">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Where RefillOS fits ══════════════════════════════════ */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)" }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-white mb-3">
              ⚡ Where RefillOS Intervenes
            </div>
            <h3 className="font-black text-white text-xl">We own the gap between Step 2 and Step 5 of Path B</h3>
            <p className="text-white/60 text-sm mt-2">When no refills remain — AI classifies the block and routes the right action to the right actor instantly.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: "B-2", label: "Block Detected", icon: "🔍", desc: "No refills remain — pharmacy flags it",     color: "#fee2e2", text: "#dc2626" },
              { step: "B-3", label: "AI Classifies",  icon: "⚡", desc: "RefillOS reads context, names block reason", color: "#fef3c7", text: "#b45309" },
              { step: "B-4", label: "Action Routed",  icon: "🗺️", desc: "Right task sent to right actor instantly",  color: "#dbeafe", text: "#1d4ed8" },
              { step: "B-5", label: "Fill Complete",  icon: "✅", desc: "Patient gets medication, audit trail logged", color: "#dcfce7", text: "#15803d" },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 text-xs font-black" style={{ background: s.color, color: s.text }}>{s.step}</div>
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="font-bold text-white text-sm mb-1">{s.label}</div>
                <div className="text-white/50 text-xs">{s.desc}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/classify" className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-lg">
              Try AI Classifier <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all border border-white/20">
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
