"use client";

import React, { useState } from "react";
import {
  LOYALTY_MECHANICS,
  FRICTION_CASE,
} from "@/lib/sample-data";
import {
  Heart,
  TrendingDown,
  TrendingUp,
  Percent,
  Sparkles,
  ShoppingBag,
  Clock,
  ArrowRight,
  ShieldCheck,
  Share2,
  CheckCircle,
} from "lucide-react";

interface Track2Props {
  activeProblem: string;
}

export function Track2ConsumerGrowth({ activeProblem }: Track2Props) {
  // Problem 1: Loyalty Model state
  const [activeLoyaltyTab, setActiveLoyaltyTab] = useState<"traditional" | "behavioral">("behavioral");

  // Problem 2: Friction State
  const [hasFrictionPause, setHasFrictionPause] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(2);

  // Problem 3: Referral Peak Moment State
  const [unboxingStage, setUnboxingStage] = useState<"dispatched" | "delivered" | "opened">("opened");
  const [baselineReferrals, setBaselineReferrals] = useState(120);

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* PROBLEM 1: THE LOYALTY ILLUSION */}
      {/* ========================================================================= */}
      {activeProblem === "loyalty_illusion" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 backdrop-blur-md">
            <div className="inline-flex items-center space-x-2 rounded-full bg-cyan-950/40 px-3 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-800/40 mb-2">
              <span>PROBLEM 01</span>
              <span>·</span>
              <span>CONSUMER GROWTH & APPLIED PSYCHOLOGY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The Loyalty Illusion: Preference vs. Repetition
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              &ldquo;Buy 9, get the 10th free&rdquo; trains price sensitivity and creates churn right after redemption. Replacing discounts with named psychological principles builds authentic brand equity.
            </p>

            {/* Model Comparison Switcher */}
            <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center space-x-3">
              <span className="text-xs font-mono text-neutral-500">COMPARE MECHANICS:</span>
              <div className="inline-flex rounded-xl border border-white/10 bg-black p-1">
                <button
                  onClick={() => setActiveLoyaltyTab("traditional")}
                  className={`rounded-lg px-3.5 py-1 text-xs font-medium transition-all ${
                    activeLoyaltyTab === "traditional"
                      ? "bg-red-500/20 text-red-300 font-semibold border border-red-500/30"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Traditional Discount (Buy 9 Get 1)
                </button>
                <button
                  onClick={() => setActiveLoyaltyTab("behavioral")}
                  className={`rounded-lg px-3.5 py-1 text-xs font-medium transition-all ${
                    activeLoyaltyTab === "behavioral"
                      ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Behavioral &ldquo;Roaster&rsquo;s Circle&rdquo; Loop
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Model Display */}
          {activeLoyaltyTab === "traditional" ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-950/[0.06] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-red-400 font-semibold">
                  FLAWED PARADIGM: REPEAT TRANSACTION OPTIMIZATION
                </span>
                <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-mono text-red-300">
                  42% Post-Reward Churn
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {LOYALTY_MECHANICS.traditionalDiscount.name}
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                {LOYALTY_MECHANICS.traditionalDiscount.flaw}
              </p>

              <div className="rounded-xl border border-red-500/30 bg-black/60 p-4">
                <span className="text-xs font-mono text-neutral-400 block mb-1">
                  CUSTOMER PSYCHOLOGY QUOTE (Sunk-Cost Trap):
                </span>
                <p className="text-xs text-red-200 italic font-sans">
                  {LOYALTY_MECHANICS.traditionalDiscount.customerQuote}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/[0.06] p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  SYSTEMS SOLUTION: IDENTITY & ENDOWMENT LOOP
                </span>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-mono text-emerald-300">
                  +38% 6-Month Retention
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {LOYALTY_MECHANICS.behavioralModel.name}
              </h3>

              {/* 3 Named Psychological Principles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {LOYALTY_MECHANICS.behavioralModel.psychologicalPrinciples.map((principle, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-black/60 p-4 space-y-1.5"
                  >
                    <div className="text-xs font-mono text-cyan-400 font-semibold">
                      0{idx + 1}. {principle.name}
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                      {principle.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-black/60 p-4">
                <span className="text-xs font-mono text-neutral-400 block mb-1">
                  CUSTOMER EMOTIONAL HOOK:
                </span>
                <p className="text-xs text-emerald-200 italic font-sans">
                  {LOYALTY_MECHANICS.behavioralModel.customerQuote}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROBLEM 2: FRICTION AS A FEATURE */}
      {/* ========================================================================= */}
      {activeProblem === "friction_feature" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 backdrop-blur-md">
            <div className="inline-flex items-center space-x-2 rounded-full bg-purple-950/40 px-3 py-0.5 text-xs font-mono text-purple-300 border border-purple-800/40 mb-2">
              <span>PROBLEM 02</span>
              <span>·</span>
              <span>CONSUMER GROWTH & APPLIED PSYCHOLOGY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Friction as a Feature: Deliberate Cognitive Pause
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Frictionless 1-click buying boosted instant checkout but drove returns above 30%. Introducing an intentional 15-second fit commitment pause cuts returns by over half.
            </p>

            {/* Toggle Switch */}
            <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-neutral-400">CHECKOUT FLOW MODE:</span>
                <button
                  onClick={() => setHasFrictionPause(!hasFrictionPause)}
                  className={`rounded-full px-4 py-1.5 text-xs font-mono font-semibold transition-all ${
                    hasFrictionPause
                      ? "bg-purple-500 text-black shadow-glow"
                      : "bg-white/10 text-neutral-400 border border-white/10"
                  }`}
                >
                  {hasFrictionPause ? "✓ Reflective Pause Active" : "✕ Frictionless 1-Click"}
                </button>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">
                Psychological Mechanism: Reflective Delay Heuristic
              </span>
            </div>
          </div>

          {/* Metric Comparison Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-4">
              <span className="text-xs font-mono text-neutral-500">RETURN RATE</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {hasFrictionPause ? `${FRICTION_CASE.projectedReturnRate}%` : `${FRICTION_CASE.baselineReturnRate}%`}
              </div>
              <span
                className={`text-[11px] font-mono mt-1 block ${
                  hasFrictionPause ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {hasFrictionPause ? "↓ 17.2% reduction in returns" : "High reverse logistics loss"}
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-4">
              <span className="text-xs font-mono text-neutral-500">NET MARGIN EXPANSION</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {hasFrictionPause ? `+${FRICTION_CASE.netMarginLift}%` : "0% Baseline"}
              </div>
              <span className="text-[11px] font-mono text-neutral-400 mt-1 block">
                Saved shipping & restocking fees
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-4">
              <span className="text-xs font-mono text-neutral-500">CART DROPOFF DIP</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {hasFrictionPause ? `+${FRICTION_CASE.cartDropoffIncrease}%` : "0%"}
              </div>
              <span className="text-[11px] font-mono text-neutral-400 mt-1 block">
                Controlled, acceptable trade-off
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-4">
              <span className="text-xs font-mono text-neutral-500">OVERALL CSAT</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {hasFrictionPause ? "4.8 / 5" : "3.7 / 5"}
              </div>
              <span className="text-[11px] font-mono text-neutral-400 mt-1 block">
                Eliminates remorse reviews
              </span>
            </div>
          </div>

          {/* Interactive Wireframe Preview */}
          <div className="rounded-2xl border border-white/10 bg-black p-6">
            <h3 className="text-xs font-mono font-semibold uppercase text-neutral-400 mb-4">
              Simulated Checkout Journey Wireframe
            </h3>

            <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-5 max-w-lg mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="text-xs font-mono text-neutral-400">Order Summary: Italian Wool Blazer</span>
                <span className="text-xs font-mono font-bold text-white">₹8,499</span>
              </div>

              {hasFrictionPause ? (
                <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-4 space-y-2.5">
                  <div className="flex items-center space-x-2 text-purple-300 font-mono text-xs font-bold">
                    <Clock className="h-4 w-4" />
                    <span>DELIBERATE 15-SECOND FIT COMMITMENT PAUSE</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    &ldquo;This tailored jacket runs slim in the shoulders. Your last purchase was a Zara 40 Slim. Would you like us to confirm 42 Regular to avoid an exchange?&rdquo;
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 rounded-lg bg-white/10 py-1.5 text-xs text-white hover:bg-white/20">
                      Confirm Size 42
                    </button>
                    <button className="flex-1 rounded-lg border border-white/20 py-1.5 text-xs text-neutral-300">
                      Keep Size 40
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-neutral-500 font-mono">
                  [1-Click Instant Buy with zero fit validation — impulse purchase vulnerable]
                </div>
              )}

              <button className="w-full rounded-xl bg-white py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition-colors">
                Complete Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROBLEM 3: WORD-OF-MOUTH, ENGINEERED */}
      {/* ========================================================================= */}
      {activeProblem === "word_of_mouth" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 backdrop-blur-md">
            <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-950/40 px-3 py-0.5 text-xs font-mono text-emerald-300 border border-emerald-800/40 mb-2">
              <span>PROBLEM 03</span>
              <span>·</span>
              <span>CONSUMER GROWTH & APPLIED PSYCHOLOGY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Word-of-Mouth, Engineered: Peak Moment Referral
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Generic post-checkout referral prompts pay for advocacy that was already going to happen for free. Triggering the ask precisely at the unboxing emotional high isolates incremental organic advocacy.
            </p>

            {/* Stage Selector */}
            <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center space-x-3">
              <span className="text-xs font-mono text-neutral-500">SIMULATE COURIER STAGE:</span>
              <div className="inline-flex rounded-xl border border-white/10 bg-black p-1">
                {(["dispatched", "delivered", "opened"] as const).map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setUnboxingStage(stage)}
                    className={`rounded-lg px-3.5 py-1 text-xs font-medium capitalize transition-all ${
                      unboxingStage === stage
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger Screen Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase text-neutral-400">
                Peak-End Trigger Notification
              </h3>

              {unboxingStage === "opened" ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                    <span className="flex items-center">
                      <Share2 className="h-3.5 w-3.5 mr-1.5" />
                      TRIGGER FIRED: 4 MINS POST-DELIVERY SCAN
                    </span>
                    <span>WHATSAPP INTENT</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    &ldquo;Smell that freshly roasted aroma? ☕&rdquo;
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    &ldquo;Your Ethiopian Honey micro-lot just arrived! Tap below to gift a complimentary tasting flight (on our tab) to one friend who takes coffee seriously.&rdquo;
                  </p>
                  <div className="pt-2">
                    <button className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition-colors">
                      Share Flight on WhatsApp (+₹0 out-of-pocket)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/40 p-8 text-center text-xs text-neutral-500 font-mono">
                  [Waiting for package delivery scan. Trigger remains dormant to avoid low-intent spam.]
                </div>
              )}
            </div>

            {/* Incremental Math Calculator */}
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase text-neutral-400">
                Advocacy Isolation Calculator
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-black border border-white/[0.08]">
                  <span className="text-neutral-400">Baseline Word-of-Mouth (Organic):</span>
                  <span className="font-mono text-white font-bold">{baselineReferrals} / month</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-black border border-white/[0.08]">
                  <span className="text-neutral-400">Peak Moment Incremental Lift:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    +{Math.round(baselineReferrals * 0.42)} referrals (+42%)
                  </span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                  <span className="text-emerald-300 font-semibold">Total Verified Viral Coefficient:</span>
                  <span className="font-mono text-emerald-300 font-bold">K = 1.34 (Self-Sustaining)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
