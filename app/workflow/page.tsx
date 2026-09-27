"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, CheckCircle, Info } from "lucide-react";

function Nav() {
  return (
    <nav className="top-nav">
      <div className="top-nav__inner">
        <Link href="/" className="top-nav__logo">
          <span className="top-nav__wordmark">UnStuck Med</span>
        </Link>
        <div className="top-nav__links">
          {[
            { href: "/portal",    label: "Portals" },
            { href: "/dashboard", label: "Worklist" },
            { href: "/classify",  label: "Classifier" },
            { href: "/security",  label: "Security" },
            { href: "/workflow",  label: "Workflow" },
            { href: "/gtm",       label: "GTM / Funnel" },
          ].map(l => (
            <Link key={l.href} href={l.href} className={`top-nav__link ${l.href === "/workflow" ? "top-nav__link--active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="top-nav__right">
          <Link href="/portal" className="btn btn-primary btn-sm">
            Enter Portal <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

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
  Patient:   {
    1: ["Shares symptoms", "Discusses health history"],
    7: ["Receives status notification"],
    8: ["Picks up or receives medication"],
  },
  Provider:  {
    1: ["Reviews history", "Examines patient"],
    2: ["Confirms diagnosis", "Checks allergies, formulary"],
    3: ["Creates eRx (drug, dose, qty, refills, pharmacy)"],
  },
  Pharmacy:  {
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

function StepPill({ step, label, active, highlight, onClick }: {
  step: number; label: string; active: boolean; highlight?: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-1 min-w-[80px] transition-all ${active ? "opacity-100" : "opacity-60 hover:opacity-80"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${active ? "border-accent-600 bg-accent-600 text-white" : highlight ? "border-warn-600 bg-warn-50 text-warn-700" : "border-ink-200 bg-white text-ink-900"}`}>
        {step}
      </div>
      <div className={`text-[10px] font-medium text-center leading-tight max-w-[72px] ${active ? "text-accent-700" : highlight ? "text-warn-700" : "text-ink-400"}`}>{label}</div>
    </button>
  );
}

export default function WorkflowPage() {
  const [activeStep, setActiveStep]       = useState<number | null>(null);
  const [path, setPath]                   = useState<"A" | "B">("A");
  const [activeRefillStep, setActiveRefillStep] = useState<number | null>(null);

  const refillSteps = path === "A" ? REFILL_A : REFILL_B;
  const activeNewStep = activeStep ? NEW_RX_STEPS[activeStep - 1] : null;
  const activeRefillData = activeRefillStep ? refillSteps[activeRefillStep - 1] : null;

  return (
    <div className="page-frame min-h-screen bg-[#F0F0F0]">
      <Nav />

      <div className="container py-8 space-y-6">

        {/* ── Section 1: New Prescription ─────────────────── */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-ink-100 bg-ink-50">
            <span className="w-6 h-6 rounded-full bg-accent-100 text-accent-700 text-xs font-bold flex items-center justify-center">1</span>
            <h1 className="text-xl font-display font-bold text-ink-900">New Prescription Workflow</h1>
            <span className="text-xs text-ink-400 ml-2">Click any step to see actor responsibilities</span>
          </div>

          <div className="p-6">
            {/* Step pills */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {NEW_RX_STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <StepPill step={s.id} label={s.label} active={activeStep === s.id}
                    onClick={() => setActiveStep(activeStep === s.id ? null : s.id)} />
                  {i < NEW_RX_STEPS.length - 1 && (
                    <ChevronRight className="h-3.5 w-3.5 text-ink-200 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Active step detail */}
            {activeNewStep && (
              <div className="mb-5 p-3 rounded border border-accent-100 bg-accent-50 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-accent-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{activeNewStep.id}</div>
                <div>
                  <div className="text-sm font-semibold text-accent-700">{activeNewStep.label}</div>
                  <div className="text-xs text-accent-600">{activeNewStep.desc}</div>
                </div>
              </div>
            )}

            {/* Actor matrix */}
            <div className="overflow-x-auto">
              <table className="data-table min-w-[760px]">
                <thead>
                  <tr>
                    <th className="w-32">Actor</th>
                    {NEW_RX_STEPS.map(s => (
                      <th key={s.id} className="text-center">
                        <button onClick={() => setActiveStep(activeStep === s.id ? null : s.id)}
                          className={`w-full text-center px-2 py-1 rounded text-[10px] font-semibold transition-all ${activeStep === s.id ? "bg-accent-600 text-white" : "hover:bg-ink-100 text-ink-400"}`}>
                          {s.id}. {s.label}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ACTORS.map(actor => (
                    <tr key={actor}>
                      <td className="font-medium text-ink-900 text-xs whitespace-nowrap">{actor}</td>
                      {NEW_RX_STEPS.map(s => {
                        const roles = ACTOR_ROLES[actor]?.[s.id];
                        return (
                          <td key={s.id} className={`align-top text-xs ${activeStep === s.id ? "bg-accent-50/50" : ""}`}>
                            {roles ? (
                              <ul className="space-y-0.5">
                                {roles.map((r, i) => (
                                  <li key={i} className="flex items-start gap-1 text-ink-600">
                                    <span className="text-ok-600 mt-0.5 flex-shrink-0">·</span> {r}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-ink-200">—</span>
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
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 bg-ink-50">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-warn-50 border border-warn-200 text-warn-700 text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-xl font-display font-bold text-ink-900">Refill Workflow</h2>
              <span className="text-xs text-ink-400">Path depends on whether refills remain</span>
            </div>
          </div>

          <div className="p-6">
            {/* Path toggle */}
            <div className="flex gap-2 mb-6">
              {(["A", "B"] as const).map(p => (
                <button key={p} onClick={() => { setPath(p); setActiveRefillStep(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded border text-sm font-semibold transition-all ${path === p ? "border-accent-600 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-400 hover:border-accent-600/40"}`}>
                  <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white ${path === p ? "bg-accent-600" : "bg-ink-200"}`}>{p}</span>
                  {p === "A" ? "Refills Remaining (Most Common)" : "No Refills Remaining"}
                  {p === "B" && (
                    <span className="text-[10px] bg-warn-50 text-warn-700 border border-warn-200 px-1.5 py-0.5 rounded font-semibold">Our Focus</span>
                  )}
                </button>
              ))}
            </div>

            {/* Refill steps */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2">
              {refillSteps.map((s, i) => (
                <React.Fragment key={s.id}>
                  <StepPill step={s.id} label={s.label} active={activeRefillStep === s.id}
                    highlight={(s as any).highlight}
                    onClick={() => setActiveRefillStep(activeRefillStep === s.id ? null : s.id)} />
                  {i < refillSteps.length - 1 && (
                    <ChevronRight className="h-3.5 w-3.5 text-ink-200 flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Active refill step */}
            {activeRefillData && (
              <div className={`mb-5 p-3 rounded border flex items-center gap-3 ${(activeRefillData as any).highlight ? "border-warn-200 bg-warn-50" : "border-accent-100 bg-accent-50"}`}>
                <div className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${(activeRefillData as any).highlight ? "bg-warn-600" : "bg-accent-600"}`}>
                  {activeRefillData.id}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${(activeRefillData as any).highlight ? "text-warn-700" : "text-accent-700"}`}>
                    {activeRefillData.label}
                    {(activeRefillData as any).highlight && (
                      <span className="ml-2 text-[10px] bg-warn-100 text-warn-700 px-1.5 py-0.5 rounded font-bold">UnStuck Med intercepts here</span>
                    )}
                  </div>
                  <div className={`text-xs ${(activeRefillData as any).highlight ? "text-warn-600" : "text-accent-600"}`}>{activeRefillData.desc}</div>
                </div>
              </div>
            )}

            {/* Info panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-warn-50 border border-warn-200 rounded p-4">
                <div className="text-xs font-semibold text-warn-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> When a visit is required
                </div>
                {["Blood pressure medications", "Diabetes medications", "Antidepressants", "ADHD / controlled substances", "Provider wants condition check"].map((m, i) => (
                  <div key={i} className="text-xs text-warn-700 flex items-center gap-1.5 mt-1.5">
                    <span className="w-1 h-1 rounded-full bg-warn-600 flex-shrink-0" /> {m}
                  </div>
                ))}
              </div>

              <div className="bg-ink-50 border border-ink-200 rounded p-4">
                <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> Insurance issues (even with refills)
                </div>
                {["Too early to refill", "New prior authorization needed", "Insurance plan changed", "Not covered on formulary"].map((m, i) => (
                  <div key={i} className="text-xs text-ink-400 flex items-center gap-1.5 mt-1.5">
                    <span className="w-1 h-1 rounded-full bg-ink-400 flex-shrink-0" /> {m}
                  </div>
                ))}
              </div>

              <div className="bg-ok-50 border border-ok-200 rounded p-4">
                <div className="text-xs font-semibold text-ok-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3" /> Typical refill statuses
                </div>
                {["Refill requested", "Prescription located", "Refills available", "Insurance processing", "Provider approval pending", "Ready for pickup", "Dispensed"].map((s, i) => (
                  <div key={i} className="text-xs text-ok-700 flex items-center gap-1.5 mt-1.5">
                    <span className="w-1 h-1 rounded-full bg-ok-600 flex-shrink-0" /> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Where UnStuck Med fits ───────────────────────── */}
        <div className="card-dark p-6 rounded-xl">
          <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-ok-600" /> Where UnStuck Med intervenes
          </div>
          <h3 className="text-xl font-display font-bold text-ink-200 mb-2">
            We own the gap between Step 2 and Step 5 on Path B
          </h3>
          <p className="text-sm text-ink-400 mb-6">
            When no refills remain — AI classifies the block in seconds and routes the right action to the right actor automatically.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { step: "B-2", label: "Block Detected",  desc: "No refills — pharmacy flags",         color: "border-warn-600/40 bg-warn-600/10 text-warn-200" },
              { step: "B-3", label: "AI Classifies",   desc: "Block type named in < 4s",            color: "border-accent-500/40 bg-accent-500/10 text-accent-300" },
              { step: "B-4", label: "Action Routed",   desc: "Right task to right actor",            color: "border-accent-500/40 bg-accent-500/10 text-accent-300" },
              { step: "B-5", label: "Fill Complete",   desc: "Audit logged, patient notified",       color: "border-ok-600/40 bg-ok-600/10 text-ok-300" },
            ].map((s, i) => (
              <div key={i} className={`rounded border p-4 ${s.color}`}>
                <div className="font-mono text-[10px] mb-1 opacity-70">{s.step}</div>
                <div className="text-sm font-semibold mb-1">{s.label}</div>
                <div className="text-xs opacity-60">{s.desc}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <Link href="/classify" className="btn btn-primary btn-sm">
              Try AI Classifier <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/dashboard" className="btn btn-ghost btn-sm text-ink-400 hover:text-ink-200">
              Open Queue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
