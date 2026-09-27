"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckCircle, TrendingUp, Users, DollarSign,
  ChevronRight, ChevronLeft, Compass, Target
} from "lucide-react";

function Nav() {
  return (
    <nav className="top-nav">
      <div className="top-nav__inner">
        <Link href="/" className="top-nav__logo">
          <div className="w-7 h-7 bg-ink-900 rounded flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-white text-xs font-bold">Rx</span>
          </div>
          <span className="top-nav__wordmark">UnStuck Med</span>
        </Link>
        <div className="top-nav__links">
          {[
            { href: "/dashboard", label: "Worklist" },
            { href: "/classify",  label: "Classifier" },
            { href: "/security",  label: "Security" },
            { href: "/workflow",  label: "Workflow" },
            { href: "/gtm",       label: "GTM / Funnel" },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`top-nav__link ${l.href === "/gtm" ? "top-nav__link--active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="top-nav__right">
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Open Worklist <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

interface FunnelStage {
  id: string;
  num: string;
  name: string;
  tagline: string;
  color: string;
  bgLight: string;
  borderColor: string;
  conversionRate: string;
  transitionGate: string;
  isEmphasized?: boolean;
  whatWeDo: string[];
  signals: string[];
  experience: string[];
}

const FUNNEL_STAGES: FunnelStage[] = [
  {
    id: "nothing", num: "01", name: "NOTHING", tagline: "Untapped market",
    color: "#6B7280", bgLight: "#F9FAFB", borderColor: "#E5E7EB",
    conversionRate: "100% TAM", transitionGate: "Verified ICP fit: 5–50 provider group with >400 weekly refills",
    whatWeDo: ["Define ICP: ambulatory practices with high refill stall volume", "Find them via EHR marketplaces and state medical registries", "Track NPI-level refill latency benchmarks"],
    signals: ["Clinical operations leaders identified", "Interest in reducing provider inbox burnout", "High ratio of chronic maintenance therapies"],
    experience: ["Sees our 192-minute refill stall benchmark report", "Recognizes internal clinic friction", "Downloads the Refill Triage Friction Benchmark memo"],
  },
  {
    id: "prospect", num: "02", name: "PROSPECT", tagline: "Right audience, now in radar",
    color: "#3B82F6", bgLight: "#EFF6FF", borderColor: "#BFDBFE",
    conversionRate: "38% from ICP", transitionGate: "Clinic executive opens interactive workflow matrix or triage audit",
    whatWeDo: ["Map practice EHR and pharmacy network connections", "Identify economic buyer vs front-line operators", "Pinpoint CMO, Ambulatory Quality Director, Lead Clinical Pharmacist"],
    signals: [">400 refill requests weekly per practice pod", "Operations leadership opens workflow matrix", "Staff spending >15 hours weekly on pharmacy phone tag"],
    experience: ["Receives personalized outreach showing clinic hours lost per month", "Feels understood: we speak eRx, PBM rejections, stockouts", "Sees immediate value in automated, human-supervised triage"],
  },
  {
    id: "data-analysis", num: "03", name: "DATA ANALYSIS", tagline: "Turn data into opportunity",
    color: "#10B981", bgLight: "#ECFDF5", borderColor: "#A7F3D0",
    conversionRate: "24% from Prospect", transitionGate: "Practice administrator uploads sample anonymized stall queue",
    isEmphasized: true,
    whatWeDo: ["Audit refill cycle times and stall reasons across 5 block categories", "Quantify potential staff hours saved using 192-min baseline", "Score and prioritize high-volume endocrinology and cardiology streams"],
    signals: ["Admin uploads anonymized stall queue for audit", "35%+ of refills take >3 days due to bottlenecks", "Payback calculated within first 60 days"],
    experience: ["Receives tailored ROI Analysis: exact projected hours and dollars saved", "Sees UnStuck Med rules pre-map to existing clinical guidelines", "Views interactive dashboard preview with synthetic metrics"],
  },
  {
    id: "tofu", num: "04", name: "TOFU", tagline: "Build awareness and initial interest",
    color: "#F59E0B", bgLight: "#FFFBEB", borderColor: "#FDE68A",
    conversionRate: "16% of Audience", transitionGate: "Clinic team tests classifier with sample faxes and requests pilot",
    whatWeDo: ["Run targeted campaigns: 'Prescription Refills. Unstuck in Minutes.'", "Share clinical content: case studies on therapy-protected bridge protocols", "Drive first touch: live classifier demo for operations directors"],
    signals: ["Engages with interactive triage simulator", "Visits classifier with messy real-world sample inputs", "Requests a live pilot walk-through"],
    experience: ["Finds classifier genuinely useful for pharmacy stall taxonomy", "Learns AI in healthcare can be deterministic, not unpredictable", "Shows active interest in a 30-day proof of concept"],
  },
  {
    id: "mofu", num: "05", name: "MOFU", tagline: "Deepen interest and build credibility",
    color: "#EC4899", bgLight: "#FDF2F8", borderColor: "#FBCFE8",
    conversionRate: "11% of Audience", transitionGate: "Lead clinician tests deliberate-failure boundaries and verifies safety",
    isEmphasized: true,
    whatWeDo: ["Share case studies proving 45% admin ticket reduction", "Conduct consultative sessions on safety invariants and escalation rules", "Answer pharmacy compliance, BAA alignment, and eRx regulatory questions"],
    signals: ["Operations team requests live simulation with medical director", "Clinicians test deliberate-failure boundaries on ambiguous notes", "IT security and compliance officer join review"],
    experience: ["Sees worklist and clinician sign-off modal function seamlessly live", "Realizes staff never need to perform repetitive phone tag again", "Feels confident due to transparent, inspectable reasoning trails"],
  },
  {
    id: "bofu", num: "06", name: "BOFU", tagline: "Validate, compare and decide",
    color: "#EF4444", bgLight: "#FEF2F2", borderColor: "#FECACA",
    conversionRate: "8.2% of Audience", transitionGate: "Legal and IT approve Zero-PII tokenization and standard BAA",
    isEmphasized: true,
    whatWeDo: ["Deliver HIPAA, SOC2 Type II readiness, and Zero-PII tokenization package", "Run 30-day pilot: track exact deflection metrics and minutes saved", "Provide standard healthcare BAA and SLA contracts for procurement"],
    signals: ["Moving to contracting: $1.20/refill or $490/provider/month", "Legal review approved with zero redlines on data retention", "Practice COO signs off on operational business case"],
    experience: ["Feels fully supported through credentialing and workflow integration", "Sees undeniable ROI: 192 min saved provides 4.2x return on cost", "Moves confidently to formal purchase decision"],
  },
  {
    id: "close", num: "07", name: "CLOSE", tagline: "Convert to customer",
    color: "#8B5CF6", bgLight: "#F5F3FF", borderColor: "#DDD6FE",
    conversionRate: "5.8% Final Win Rate", transitionGate: "Executed contract, BAA signed, and EHR webhooks connected",
    whatWeDo: ["Finalize contract: BAA, EHR integration agreement, SLA guarantee", "Connect bi-directional EHR webhooks and Surescripts gateway sync", "30-minute training for clinic triage staff and medical assistants"],
    signals: ["Signed contract and authorized billing established", "Implementation kickoff call scheduled within 5 business days", "Attending provider roster ingested"],
    experience: ["Simple, smooth: zero hardware, completely browser-based worklist", "Clear next steps with designated Clinical Implementation Specialist", "Staff excited to eliminate Monday morning fax backlogs"],
  },
  {
    id: "customer-success", num: "08", name: "CUSTOMER SUCCESS", tagline: "Drive value, retention and expansion",
    color: "#06B6D4", bgLight: "#ECFEFF", borderColor: "#A5F3FC",
    conversionRate: "115% Net Retention", transitionGate: "Practice logs >160 staff hours saved in Month 1 and requests regional rollout",
    isEmphasized: true,
    whatWeDo: ["Weekly check-ins on queue deflection rates and provider sign-off times", "Monitor chronic therapy adherence improvements and zero-stall rates", "Expand from primary care to specialty endocrinology and cardiology"],
    signals: [">90% of incoming stalls resolved within 15 minutes", "Practice logs >160 staff hours saved in Month 1", "Health system requests rollout to 12+ additional regional sites"],
    experience: ["Sees real measurable impact on clinic EBITDA and nurse retention", "Gets ongoing clinical intelligence updates and formulary alerts", "Becomes vocal industry advocate and published case study partner"],
  },
];

export default function GTMPage() {
  const [selectedStage, setSelectedStage] = useState<string>("data-analysis");

  const currentStageIndex = FUNNEL_STAGES.findIndex(s => s.id === selectedStage);
  const currentStage = FUNNEL_STAGES[currentStageIndex] ?? FUNNEL_STAGES[2];

  const handlePrevStage = () => {
    const prev = (currentStageIndex - 1 + FUNNEL_STAGES.length) % FUNNEL_STAGES.length;
    setSelectedStage(FUNNEL_STAGES[prev].id);
  };

  const handleNextStage = () => {
    const next = (currentStageIndex + 1) % FUNNEL_STAGES.length;
    setSelectedStage(FUNNEL_STAGES[next].id);
  };

  return (
    <div className="page-frame min-h-screen bg-[#F0F0F0] text-ink-900 font-sans pb-24">
      <Nav />

      {/* HEADER */}
      <section className="border-b border-black/10 bg-[#F0F0F0] pt-10 pb-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink-900 text-white text-xs font-mono font-bold uppercase tracking-wider mb-6">
            <Compass className="h-3.5 w-3.5" /> Track 03: GTM Funnel
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-ink-900 tracking-tight leading-tight">
                The end-to-end customer journey.
              </h1>
              <p className="mt-2 text-sm text-ink-500 max-w-xl leading-relaxed">
                How UnStuck Med moves healthcare organizations from awareness to adoption and measurable value.
              </p>
            </div>
            <div className="bg-ink-900 text-white rounded-2xl px-6 py-4 flex items-center gap-4 flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-xl font-mono font-bold text-white">192 Min</div>
                <div className="text-xs text-ink-400">Saved per stall · 4.2x ROI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pt-10 space-y-10">

        {/* BUYER VS USER */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-ink-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 text-sm">The Economic Buyer</h3>
                <p className="text-xs text-ink-400">Practice COO, Clinic Operations Director, CMO</p>
              </div>
              <span className="ml-auto text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Decision Maker</span>
            </div>
            <div className="space-y-2 text-xs text-ink-600 leading-relaxed pt-2 border-t border-ink-100">
              {[
                { label: "Core Pain", text: "Staff overhead at $28/hr on manual phone tag, provider inbox burnout, and clinical churn." },
                { label: "What They Buy", text: "Measurable EBITDA recovery, SLA compliance, malpractice protection, staff retention." },
                { label: "Decision Gate", text: "Break-even when platform defers 3+ staff hours per provider/month." },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span><strong>{item.label}:</strong> {item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-ink-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 text-sm">The Daily End-User</h3>
                <p className="text-xs text-ink-400">Pharmacy Techs, Triage Nurses, Staff Clinicians</p>
              </div>
              <span className="ml-auto text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Daily Operator</span>
            </div>
            <div className="space-y-2 text-xs text-ink-600 leading-relaxed pt-2 border-t border-ink-100">
              {[
                { label: "Core Pain", text: "15 disconnected fax lines, unformatted PBM rejection codes, endless voicemail queues." },
                { label: "What They Love", text: "1-click prioritized worklist, deterministic renewal recommendations, zero double-entry." },
                { label: "Adoption Gate", text: "Clinician sign-off modal requires under 10 seconds to review and dispatch." },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span><strong>{item.label}:</strong> {item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8-STAGE FUNNEL */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-400 mb-1">8-Stage Customer Journey</p>
              <h2 className="text-xl font-display font-bold text-ink-900">Funnel Strategy &amp; Transitions</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevStage} className="p-1.5 rounded-lg border border-ink-200 hover:bg-ink-100 text-ink-600 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono text-ink-500 font-semibold">Stage {currentStage.num} / 08</span>
              <button onClick={handleNextStage} className="p-1.5 rounded-lg border border-ink-200 hover:bg-ink-100 text-ink-600 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stage Pills */}
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
            {FUNNEL_STAGES.map((stage) => {
              const isSelected = selectedStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.id)}
                  style={{ borderColor: isSelected ? stage.color : "#E5E7EB", background: isSelected ? stage.bgLight : "#FFFFFF" }}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${isSelected ? "shadow-sm ring-1 ring-offset-1" : "hover:border-ink-300"}`}
                >
                  {stage.isEmphasized && (
                    <span style={{ background: stage.color }} className="absolute -top-1 -right-1 w-2 h-2 rounded-full" />
                  )}
                  <div className="font-mono text-[10px] font-bold text-ink-400">{stage.num}</div>
                  <div className="font-bold text-[11px] text-ink-900 truncate mt-0.5">{stage.name}</div>
                  <div className="text-[9px] text-ink-400 truncate mt-0.5">{stage.conversionRate.split(" ")[0]}</div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Card */}
          <div
            style={{ borderColor: currentStage.borderColor, background: "#FFFFFF" }}
            className="rounded-2xl border-2 p-6 space-y-5"
          >
            {/* Stage Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <span style={{ background: currentStage.color }} className="w-8 h-8 rounded-xl text-white font-mono font-bold text-sm flex items-center justify-center">
                  {currentStage.num}
                </span>
                <div>
                  <h3 className="text-lg font-display font-bold text-ink-900">{currentStage.name}</h3>
                  <p className="text-xs text-ink-500">{currentStage.tagline}</p>
                </div>
              </div>
              <div className="bg-ink-50 px-3 py-1.5 rounded-lg border border-ink-200 flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-ink-500 flex-shrink-0" />
                <span className="text-[11px] text-ink-700"><strong>Gate:</strong> {currentStage.transitionGate}</span>
              </div>
            </div>

            {/* 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />What We Do
                </div>
                <ul className="space-y-1.5">
                  {currentStage.whatWeDo.map((item, idx) => (
                    <li key={idx} className="text-xs text-ink-700 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-blue-500 font-bold mt-0.5">·</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />Signals to Advance
                </div>
                <ul className="space-y-1.5">
                  {currentStage.signals.map((item, idx) => (
                    <li key={idx} className="text-xs text-ink-700 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />Customer Experience
                </div>
                <ul className="space-y-1.5">
                  {currentStage.experience.map((item, idx) => (
                    <li key={idx} className="text-xs text-ink-700 flex items-start gap-1.5 leading-relaxed">
                      <span className="text-purple-500 font-bold mt-0.5">→</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* METRIC STRIP */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Time Saved / Stall", value: "192 Min", sub: "Replaces phone tag", color: "text-ink-900" },
            { label: "Queue Deflection", value: "45%", sub: "No clinician needed", color: "text-blue-700" },
            { label: "Turnaround Speed", value: "3.2x", sub: "Faster renewal cycle", color: "text-emerald-700" },
            { label: "Safety Invariant", value: "100%", sub: "0 unauthorized dispatches", color: "text-purple-700" },
          ].map(m => (
            <div key={m.label} className="bg-white border border-ink-200 rounded-xl p-4">
              <div className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">{m.label}</div>
              <div className={`text-2xl font-mono font-extrabold mt-1 ${m.color}`}>{m.value}</div>
              <div className="text-[11px] text-ink-500 mt-1">{m.sub}</div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <div className="border-t border-ink-200 pt-6 flex items-center justify-between">
          <p className="text-xs text-ink-400">See the product that drives this funnel.</p>
          <div className="flex gap-3">
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Open Worklist <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/classify" className="btn btn-secondary btn-sm">
              Try AI Classifier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
