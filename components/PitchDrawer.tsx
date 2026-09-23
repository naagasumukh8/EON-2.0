"use client";

import React, { useState, useEffect } from "react";
import { X, Play, Pause, RotateCcw, Award, CheckSquare, AlertTriangle, TrendingUp, Presentation } from "lucide-react";

interface PitchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeProblem: string;
}

export function PitchDrawer({ isOpen, onClose, activeProblem }: PitchDrawerProps) {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes total
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(300);
  };

  const pitchGuides: Record<
    string,
    {
      framing2Min: string;
      demo3Min: string;
      namedPrinciple: string;
      deliberateLimit: string;
      targetMetric: string;
    }
  > = {
    invisible_bottleneck: {
      framing2Min:
        "Open with the business dilemma: Scaling from 500 to 5,000 orders/day caused tickets to explode. The previous generic bot crushed CSAT because emotionally distressed users (like injured hands or double charges) were routed to a bot. Our core thesis: The real opportunity isn't 'add AI'—it's building the judgment layer deciding where AI genuinely helps vs. where it damages trust.",
      demo3Min:
        "Type or click 3 sample tickets live. Show the visible reasoning column. Show how transactional queries get instant AI clearance while high-emotion tickets are instantly escalated with empathy briefs.",
      namedPrinciple:
        "Defensible Triage Matrix: Emotional Valence × Urgency Severity × Regulatory/Injury Liability.",
      deliberateLimit:
        "Multi-intent reversals ('Cancel my order, wait no just change address'): Current LLMs risk triggering destructive cancellation actions before parsing the tail sentence.",
      targetMetric:
        "+28% CSAT recovery on escalated tickets; -45% human agent ticket volume.",
    },
    build_vs_buy: {
      framing2Min:
        "Open with decision paralysis: A 40-person startup takes 6–8 weeks of Slack debates to decide whether to build an internal tool or buy off-the-shelf. The cost isn't the software; it's lost engineering momentum.",
      demo3Min:
        "Move the sliders live in front of the judges. Show how raising Strategic Differentiation from 2 to 9 flips the verdict from Buy to Build with inspectable trade-off math.",
      namedPrinciple:
        "Weighted Opportunity Cost Heuristic: (Dev Time × Core Moat Value) vs. Vendor Lock-In Liability.",
      deliberateLimit:
        "Does not capture long-term vendor price hikes after contract renewal (Year 3 pricing shocks).",
      targetMetric:
        "Reduces decision cycle from 6 weeks to 48 hours; preserves core IP differentiation.",
    },
    feedback_loop: {
      framing2Min:
        "Open with high-signal feedback burial: 50,000 users generate thousands of noisy reviews. Product managers just skim 5 random reviews before sprint planning.",
      demo3Min:
        "Present the raw messy feedback on the left, and the ranked backlog on the right. Highlight the 'quiet insight' that simple keyword counts missed (offline sync failures on cellular).",
      namedPrinciple:
        "Severity-Weighted Signal Extraction: High-friction churn signals over repeated cosmetic complaints.",
      deliberateLimit:
        "Sarcastic or contradictory slang reviews ('Thanks for the crash guys') can occasionally be mis-clustered as compliments.",
      targetMetric:
        "-60% sprint planning debate time; 100% of high-severity silent churn bugs surfaced.",
    },
    loyalty_illusion: {
      framing2Min:
        "Open with the discount trap: 'Buy 9 get 10th free' created repeat buyers who churned immediately after claiming their free cup. We optimized for repetition, not real brand preference.",
      demo3Min:
        "Walk through the 'Roaster's Circle' mockup. Show how user taste curation (Palate Profile) creates switching barriers that discounts never could.",
      namedPrinciple:
        "Endowment Effect, Identity Signaling, and Variable Loot Rewards.",
      deliberateLimit:
        "Initial onboarding friction is higher because users must invest 60 seconds setting up their taste profile.",
      targetMetric:
        "+38% 6-month retention rate; 0% price discount concession required.",
    },
    friction_feature: {
      framing2Min:
        "Open with return logistics bleed: E-commerce 1-click checkout increased instant conversions but created a devastating 31% return rate from buyers remorse.",
      demo3Min:
        "Demonstrate the 15-second Fit & Fabric Commitment Pause right before the purchase button. Show the tradeoff graph: cart drop-off rises slightly (+2.8%), but return rate plummets (-17%).",
      namedPrinciple:
        "Reflective Delay Heuristic & Cognitive Commitment Device.",
      deliberateLimit:
        "Sub-optimal for low-cost impulse accessories (<₹299) where return shipping is already non-viable.",
      targetMetric:
        "+18.5% net margin expansion from slashed return reverse-logistics.",
    },
    word_of_mouth: {
      framing2Min:
        "Open with referral waste: Giving ₹500 off after payment pays for advocacy that was already going to happen for free. We must trigger the ask at the psychological peak moment.",
      demo3Min:
        "Show the WhatsApp/app trigger timed exactly to the unboxing delivery scan with custom unboxing AR filter, isolating incremental referrals.",
      namedPrinciple:
        "Peak-End Rule & Emotional Pride Trigger.",
      deliberateLimit:
        "Requires tight courier delivery scan webhook integration; delays in scan data can miss the peak moment.",
      targetMetric:
        "+42% incremental referral volume distinct from baseline word-of-mouth.",
    },
    adherence_gap: {
      framing2Min:
        "Open with the 3-week adherence cliff: Diabetes app patients drop off by 40% in week 3. The company added notifications, but nothing changed because patients didn't forget—they were symptom-free and complacent.",
      demo3Min:
        "Show the Diagnosis Memo, then launch the interactive WhatsApp-style conversational nudge flow addressing complacency directly without patronizing the patient.",
      namedPrinciple:
        "Asymptomatic Complacency Diagnosis & Empathetic Loss Framing.",
      deliberateLimit:
        "Conversational scripts cannot solve out-of-pocket insulin cost barriers without social aid linkage.",
      targetMetric:
        "+34% patient logging adherence sustained through Week 8.",
    },
    second_opinion: {
      framing2Min:
        "Open with the ambiguous lab panic: Patients receive borderline blood test numbers on telehealth portals with zero context, resulting in panicked Google searches and ER visits.",
      demo3Min:
        "Input borderline fasting glucose (106 mg/dL). Show the plain-English translation. Toggle between Anxious vs Dismissive patient tone adaptations. Highlight the non-negotiable doctor boundary.",
      namedPrinciple:
        "Tone-Calibrated Risk Translation with Strict Clinical Guardrails.",
      deliberateLimit:
        "Explicitly refuses to provide diagnostic verdicts or suggest medication dosage changes.",
      targetMetric:
        "-70% panic helpline escalations; 94% patient comprehension of doctor follow-up questions.",
    },
    referral_black_hole: {
      framing2Min:
        "Open with the 33% specialist drop-off: Hospital patients referred to cardiology or orthopedics disappear into a void between departments because no one owns the handoff.",
      demo3Min:
        "Walk through the 5-stage pipeline. Highlight the red-flagged patient stuck for 9 days. Click to trigger the 1-tap WhatsApp evening scheduling nudge.",
      namedPrinciple:
        "Aging Risk Algorithm with Proactive Care Coordinator Handoff.",
      deliberateLimit:
        "Cannot resolve specialist scheduling backlog if hospital department has a 3-month waitlist.",
      targetMetric:
        "Increases specialist referral completion rate from 66% to 89%.",
    },
  };

  const currentGuide = pitchGuides[activeProblem] || pitchGuides.invisible_bottleneck;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl h-full flex flex-col bg-[#0a0a0a] border-l border-white/10 shadow-2xl text-white">
        {/* Header with Pitch Timer */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-black">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black font-mono font-bold">
              <Presentation className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold">Judge Presentation Mode</h2>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  RUBRIC HUD
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                5-Minute Pitch Structure: 2 Min Problem Framing + 3 Min Live Demo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Timer Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0f0f0f] px-6 py-3">
          <div className="flex items-center space-x-3">
            <span
              className={`font-mono text-2xl font-bold tracking-tight ${
                secondsLeft < 60
                  ? "text-red-400 animate-pulse"
                  : secondsLeft < 180
                  ? "text-amber-400"
                  : "text-white"
              }`}
            >
              {formatTime(secondsLeft)}
            </span>
            <span className="text-xs font-mono text-neutral-400">
              {secondsLeft > 180
                ? "PHASE 1: Problem Framing (2 min)"
                : "PHASE 2: Live Demo + Ask (3 min)"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center space-x-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            >
              {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isRunning ? "Pause" : "Start Timer"}</span>
            </button>
            <button
              onClick={handleReset}
              className="rounded-lg border border-white/10 p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Pitch Guide Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: 2-Minute Problem Framing */}
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
            <div className="flex items-center space-x-2 mb-2 text-cyan-400">
              <Award className="h-4 w-4" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                1. Problem Framing Script (First 2 Minutes)
              </span>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              {currentGuide.framing2Min}
            </p>
          </div>

          {/* Section 2: 3-Minute Live Demo Actions */}
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
            <div className="flex items-center space-x-2 mb-2 text-emerald-400">
              <CheckSquare className="h-4 w-4" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                2. Live Demo Script (Next 3 Minutes)
              </span>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              {currentGuide.demo3Min}
            </p>
          </div>

          {/* Section 3: Visible Reasoning & Named Principle */}
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
            <div className="flex items-center space-x-2 mb-2 text-purple-400">
              <Award className="h-4 w-4" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                3. Visible Reasoning & Named Principle
              </span>
            </div>
            <p className="text-sm text-neutral-200 font-semibold mb-1 font-sans">
              {currentGuide.namedPrinciple}
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Judges specifically award higher points when you state the named logic/rule trail out loud.
            </p>
          </div>

          {/* Section 4: Deliberate Limitation / Self-Awareness */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center space-x-2 mb-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                4. Self-Awareness: Deliberate Limitation
              </span>
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              {currentGuide.deliberateLimit}
            </p>
            <p className="text-[11px] text-amber-300/70 mt-2 font-mono">
              Rubric Note: &ldquo;Self-awareness about limits reads as maturity, not weakness.&rdquo;
            </p>
          </div>

          {/* Section 5: Target Metric Moved */}
          <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-4">
            <div className="flex items-center space-x-2 mb-2 text-white">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                5. Target Business Metric to Move
              </span>
            </div>
            <p className="text-base font-bold text-emerald-400 font-mono">
              {currentGuide.targetMetric}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] bg-black p-4 text-center">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-white py-2.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors"
          >
            Ready to Present (Close Overlay)
          </button>
        </div>
      </div>
    </div>
  );
}
