"use client";

import React, { useState } from "react";
import {
  LAB_RESULTS,
  SPECIALIST_REFERRALS,
  LabResult,
  SpecialistReferral,
} from "@/lib/sample-data";
import {
  Activity,
  AlertCircle,
  FileText,
  MessageSquare,
  ShieldAlert,
  Send,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  PhoneCall,
} from "lucide-react";

interface Track3Props {
  activeProblem: string;
}

export function Track3HealthTech({ activeProblem }: Track3Props) {
  // Problem 1: Adherence Gap State
  const [activeNudgeStep, setActiveNudgeStep] = useState(1);

  // Problem 2: Lab Result State
  const [selectedLab, setSelectedLab] = useState<LabResult>(LAB_RESULTS[0]);
  const [patientTone, setPatientTone] = useState<"anxious" | "dismissive">("anxious");

  // Problem 3: Referral Tracker State
  const [referrals, setReferrals] = useState<SpecialistReferral[]>(SPECIALIST_REFERRALS);
  const [nudgedReferralId, setNudgedReferralId] = useState<string | null>(null);

  const handleNudgePatient = (id: string) => {
    setNudgedReferralId(id);
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, riskLevel: "Normal", stage: "Scheduled", daysInStage: 1 } : r
      )
    );
    setTimeout(() => setNudgedReferralId(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* PROBLEM 1: THE ADHERENCE GAP */}
      {/* ========================================================================= */}
      {activeProblem === "adherence_gap" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 backdrop-blur-md">
            <div className="inline-flex items-center space-x-2 rounded-full bg-cyan-950/40 px-3 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-800/40 mb-2">
              <span>PROBLEM 01</span>
              <span>·</span>
              <span>CLINICAL & HEALTHTECH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The Adherence Gap: Bottleneck Diagnosis & Nudge Flow
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Diabetes app adherence plunges 40% after week 3. Adding notifications failed because patients didn&rsquo;t forget—they became symptom-free and complacent. This workbench pairs clinical diagnosis with targeted behavioral micro-nudges.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Diagnosis Memo (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 space-y-4">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold pb-3 border-b border-white/[0.08]">
                <FileText className="h-4 w-4" />
                <span>CLINICAL ROOT CAUSE DIAGNOSIS MEMO</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-neutral-300 font-sans">
                <div className="rounded-xl bg-black/60 border border-white/[0.06] p-4">
                  <span className="text-neutral-500 font-mono text-[11px] block mb-1">
                    PRIMARY BOTTLENECK IDENTIFIED:
                  </span>
                  <h4 className="text-sm font-bold text-white mb-1">
                    &ldquo;Asymptomatic Complacency & Silent Organ Complacency&rdquo;
                  </h4>
                  <p className="text-neutral-300">
                    In weeks 1–2, high novelty and physician onboarding drive logging. By week 3, absence of acute diabetic ketoacidosis or hypoglycemic episodes tricks patients into believing the condition is dormant.
                  </p>
                </div>

                <div className="rounded-xl bg-black/60 border border-white/[0.06] p-4 space-y-2">
                  <span className="text-neutral-500 font-mono text-[11px] block">
                    WHY GENERIC REMINDERS FAILED:
                  </span>
                  <p className="text-neutral-400">
                    Push alerts like &ldquo;Time to log your blood sugar!&rdquo; feel like nagging chore interruptions when patients feel physically fine.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4">
                  <span className="text-emerald-400 font-mono text-[11px] block mb-1">
                    THE BEHAVIORAL INTERVENTION:
                  </span>
                  <p className="text-emerald-200">
                    Shift messaging from reminder to curiosity framing: Connect morning readings to dietary feedback loops rather than guilt-based compliance tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Scripted WhatsApp Conversational Nudge Simulator (6 cols) */}
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-semibold">
                  <MessageSquare className="h-4 w-4" />
                  <span>TARGETED BEHAVIORAL CHAT SIMULATOR</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">WHATSAPP AGENT</span>
              </div>

              {/* Chat Thread */}
              <div className="rounded-2xl border border-white/10 bg-[#070707] p-4 space-y-3 font-sans text-xs">
                {/* Agent Bubble */}
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#161616] border border-white/10 p-3 text-neutral-200">
                  <span className="text-[10px] font-mono text-emerald-400 block mb-1">
                    Dr. Arya Care Bot · 08:30 AM
                  </span>
                  Hey Rajesh, no lectures today! We noticed your post-breakfast glucose was stable at 118 mg/dL yesterday. Did having oats instead of white toast give you more steady morning energy?
                </div>

                {/* Patient Reply */}
                {activeNudgeStep >= 2 && (
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-emerald-600 text-black font-medium p-3">
                    Actually yes! Didn&rsquo;t feel that mid-morning brain fog at all.
                  </div>
                )}

                {/* Agent Response */}
                {activeNudgeStep >= 3 && (
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#161616] border border-white/10 p-3 text-neutral-200">
                    <span className="text-[10px] font-mono text-emerald-400 block mb-1">
                      Dr. Arya Care Bot · 08:34 AM
                    </span>
                    That&rsquo;s huge! That 118 reading protected your retinal micro-vessels from an afternoon spike. Tap below if you want us to lock that breakfast into your favorites!
                  </div>
                )}
              </div>

              {/* Step Advance Controls */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-neutral-500">
                  Step {activeNudgeStep} of 3 in dialogue
                </span>
                <button
                  onClick={() => setActiveNudgeStep((prev) => (prev < 3 ? prev + 1 : 1))}
                  className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-mono text-white hover:bg-white/20 transition-colors"
                >
                  {activeNudgeStep < 3 ? "Simulate Next Reply →" : "Restart Dialogue ↺"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROBLEM 2: THE SECOND OPINION PROBLEM */}
      {/* ========================================================================= */}
      {activeProblem === "second_opinion" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 backdrop-blur-md">
            <div className="inline-flex items-center space-x-2 rounded-full bg-purple-950/40 px-3 py-0.5 text-xs font-mono text-purple-300 border border-purple-800/40 mb-2">
              <span>PROBLEM 02</span>
              <span>·</span>
              <span>CLINICAL & HEALTHTECH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The Second Opinion: Ambiguous Lab Results Explainer
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Portal lab dumps with bare numbers trigger intense anxiety and panicked midnight ER visits. This engine provides clear, plain-language translation with calibrated tone adaptation and strictly enforced non-diagnostic clinical boundaries.
            </p>

            {/* Test Selection Row */}
            <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-neutral-500">SAMPLE BORDERLINE RESULTS:</span>
              {LAB_RESULTS.map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => setSelectedLab(lab)}
                  className={`rounded-lg px-3 py-1 text-xs font-mono transition-all ${
                    selectedLab.id === lab.id
                      ? "bg-white text-black font-semibold"
                      : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  {lab.testName} ({lab.value})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Lab Detail & Plain Language (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedLab.testName}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-mono text-xl font-bold text-amber-400">
                      {selectedLab.value}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">
                      (Normal Range: {selectedLab.referenceRange})
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-mono text-amber-300">
                  {selectedLab.status}
                </span>
              </div>

              {/* Plain English Translation */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-semibold uppercase text-cyan-400">
                  Plain English Explanation (De-Jargonized)
                </span>
                <p className="text-sm text-neutral-200 leading-relaxed font-sans bg-black/60 rounded-xl border border-white/[0.06] p-4">
                  {selectedLab.plainLanguageExplanation}
                </p>
              </div>

              {/* Tone Calibration Toggle (Anxious vs Dismissive) */}
              <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400">
                    PATIENT PSYCHOLOGICAL PROFILE ADAPTATION:
                  </span>
                  <div className="inline-flex rounded-lg border border-white/10 bg-black p-0.5">
                    <button
                      onClick={() => setPatientTone("anxious")}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                        patientTone === "anxious"
                          ? "bg-white text-black font-semibold"
                          : "text-neutral-400"
                      }`}
                    >
                      Anxious Patient
                    </button>
                    <button
                      onClick={() => setPatientTone("dismissive")}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                        patientTone === "dismissive"
                          ? "bg-white text-black font-semibold"
                          : "text-neutral-400"
                      }`}
                    >
                      Dismissive Patient
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/80 p-4 text-xs font-sans text-neutral-200 leading-relaxed">
                  <span className="font-mono text-[11px] text-neutral-500 block mb-1">
                    ADAPTED TONE OUTPUT:
                  </span>
                  {patientTone === "anxious"
                    ? selectedLab.anxiousToneResponse
                    : selectedLab.dismissiveToneResponse}
                </div>
              </div>
            </div>

            {/* Right: Guardrails & Doctor Questions (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0e0e0e] p-6 space-y-5">
              {/* Doctor Questions */}
              <div>
                <h4 className="text-xs font-mono font-semibold uppercase text-emerald-400 mb-2">
                  Prepared Questions for Your Doctor
                </h4>
                <div className="space-y-2">
                  {selectedLab.doctorQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-black/60 border border-white/[0.06] p-3 text-xs text-neutral-300 font-sans"
                    >
                      &ldquo;{q}&rdquo;
                    </div>
                  ))}
                </div>
              </div>

              {/* Strict Medical Disclaimer / Guardrail */}
              <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 space-y-2">
                <div className="flex items-center space-x-1.5 text-red-400 font-mono text-xs font-bold">
                  <ShieldAlert className="h-4 w-4" />
                  <span>NON-DIAGNOSTIC CLINICAL GUARDRAIL</span>
                </div>
                <p className="text-[11px] text-red-200 leading-relaxed font-sans">
                  {selectedLab.safetyBoundary}
                </p>
                <div className="text-[10px] font-mono text-neutral-400 pt-1">
                  Rubric: &ldquo;Treat the disclaimer as a designed safety feature, not fine print.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROBLEM 3: THE REFERRAL BLACK HOLE */}
      {/* ========================================================================= */}
      {activeProblem === "referral_black_hole" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 backdrop-blur-md">
            <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-950/40 px-3 py-0.5 text-xs font-mono text-emerald-300 border border-emerald-800/40 mb-2">
              <span>PROBLEM 03</span>
              <span>·</span>
              <span>CLINICAL & HEALTHTECH</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The Referral Black Hole: Lifecycle Status Tracker
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Roughly 33% of hospital specialist referrals never get completed due to scheduling friction or fear of hidden costs. This lightweight tracker makes referral status visible and flags stuck handoffs before drop-off.
            </p>
          </div>

          {/* Referral Kanban Pipeline Table */}
          <div className="space-y-3">
            {referrals.map((ref) => {
              const isStuck = ref.daysInStage >= 7;
              return (
                <div
                  key={ref.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isStuck
                      ? "border-red-500/30 bg-red-950/[0.05]"
                      : "border-white/[0.08] bg-[#0c0c0c]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                        {ref.id}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        Patient: {ref.patientInitials}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {ref.referringDept} → <strong className="text-white">{ref.specialistType}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs font-mono font-semibold ${
                          ref.stage === "Scheduled"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isStuck
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-white/10 text-neutral-300"
                        }`}
                      >
                        Stage: {ref.stage} ({ref.daysInStage}d elapsed)
                      </span>
                    </div>
                  </div>

                  {/* Bottleneck Diagnostic Reason */}
                  <div className="rounded-xl bg-black/60 border border-white/[0.06] p-3 text-xs text-neutral-300 font-sans mb-3">
                    <span className="text-neutral-500 font-mono text-[11px] mr-2">
                      [HANDOFF BOTTLENECK]:
                    </span>
                    {ref.stuckReason}
                  </div>

                  {/* Smart Nudge Action Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
                    <div className="text-xs font-mono text-cyan-400">
                      Smart Nudge: {ref.recommendedNudge}
                    </div>

                    {ref.stage !== "Scheduled" && (
                      <button
                        onClick={() => handleNudgePatient(ref.id)}
                        className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors shadow-glow"
                      >
                        {nudgedReferralId === ref.id ? "Nudge Dispatched ✓" : "Dispatch Handoff Nudge"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
