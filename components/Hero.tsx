"use client";

import React from "react";
import { ArrowRight, Sparkles, Terminal, Activity, Layers, CheckCircle2 } from "lucide-react";

interface HeroProps {
  activeTrack: number;
  setActiveTrack: (track: number) => void;
  activeProblem: string;
  setActiveProblem: (problem: string) => void;
}

export function Hero({
  activeTrack,
  setActiveTrack,
  activeProblem,
  setActiveProblem,
}: HeroProps) {
  const problemsByTrack: Record<number, { id: string; num: string; title: string; desc: string }[]> = {
    1: [
      { id: "invisible_bottleneck", num: "01", title: "The Invisible Bottleneck", desc: "D2C Ticket Triage Judgment Layer (AI vs Human)" },
      { id: "build_vs_buy", num: "02", title: "Build vs. Buy Decided by AI", desc: "4-Constraint Sensitivity Tradeoff Calculator" },
      { id: "feedback_loop", num: "03", title: "The Feedback Loop No One Closes", desc: "Messy Review Cluster & Quiet Insight Ranking" },
    ],
    2: [
      { id: "loyalty_illusion", num: "01", title: "The Loyalty Illusion", desc: "Identity & Endowment Loop vs. Discount Churn" },
      { id: "friction_feature", num: "02", title: "Friction as a Feature", desc: "Checkout Reflective Pause & Return Elasticity" },
      { id: "word_of_mouth", num: "03", title: "Word-of-Mouth, Engineered", desc: "Peak Moment Referral Trigger & Incremental Lift" },
    ],
    3: [
      { id: "adherence_gap", num: "01", title: "The Adherence Gap", desc: "3-Week Bottleneck Diagnosis & WhatsApp Nudge" },
      { id: "second_opinion", num: "02", title: "The Second Opinion Problem", desc: "Ambiguous Lab Plain-English Safety Translator" },
      { id: "referral_black_hole", num: "03", title: "The Referral Black Hole", desc: "Hospital Specialist Pipeline & Aging Drop-Off Alert" },
    ],
  };

  const currentTrackProblems = problemsByTrack[activeTrack] || problemsByTrack[1];

  return (
    <div className="relative overflow-hidden border-b border-white/[0.08] bg-black pt-12 pb-10 sm:pt-16 sm:pb-14">
      {/* Vercel Ambient Spotlight */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[350px] w-[800px] rounded-full bg-gradient-to-b from-white/[0.07] via-cyan-500/[0.03] to-transparent blur-3xl" />
      
      {/* Background Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-grid-vercel opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-white/[0.12] bg-[#0c0c0c] px-3.5 py-1 text-xs font-mono text-neutral-300 backdrop-blur-md mb-6 hover:border-white/20 transition-all">
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            <span>POLYMATH INNOVAE × EONEXEA AI</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">HACKATHON RUNTIME</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 sm:leading-tight">
            Systems Thinking &{" "}
            <span className="text-gradient-white">AI-First Problem Solving</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-neutral-400 mb-8 max-w-2xl mx-auto font-normal leading-relaxed">
            Pre-engineered workbenches for all 9 hackathon problem statements. Built for a 60–90 minute sprint with defensible judgment layers, live sensitivity controls, and zero database friction.
          </p>

          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto mb-8 text-left">
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0c]/80 p-3 backdrop-blur-sm">
              <div className="text-xs text-neutral-500 font-mono">PROBLEM SOLVERS</div>
              <div className="text-lg font-bold text-white mt-0.5">9 Pre-Built</div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0c]/80 p-3 backdrop-blur-sm">
              <div className="text-xs text-neutral-500 font-mono">API SLOTS</div>
              <div className="text-lg font-bold text-cyan-400 mt-0.5">15 Ready</div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0c]/80 p-3 backdrop-blur-sm">
              <div className="text-xs text-neutral-500 font-mono">DATABASE NEEDED</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">Zero (Offline Safe)</div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0c]/80 p-3 backdrop-blur-sm">
              <div className="text-xs text-neutral-500 font-mono">VERCEL DEPLOY</div>
              <div className="text-lg font-bold text-white mt-0.5">Auto-Linked</div>
            </div>
          </div>
        </div>

        {/* Problem Statement Quick Selector Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Active Track Problems (Click to inspect)
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              Track {activeTrack} of 3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentTrackProblems.map((prob) => {
              const isSelected = activeProblem === prob.id;
              return (
                <button
                  key={prob.id}
                  onClick={() => setActiveProblem(prob.id)}
                  className={`group relative text-left rounded-xl p-4 transition-all duration-200 border ${
                    isSelected
                      ? "border-white/40 bg-[#121212] shadow-glow"
                      : "border-white/[0.08] bg-[#0a0a0a] hover:border-white/20 hover:bg-[#0f0f0f]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white text-black"
                          : "bg-white/[0.06] text-neutral-400 group-hover:text-white"
                      }`}
                    >
                      SAMPLE {prob.num}
                    </span>
                    {isSelected && (
                      <span className="flex items-center text-[10px] font-mono text-cyan-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mr-1 animate-pulse" />
                        ACTIVE WORKBENCH
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                    {prob.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {prob.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
