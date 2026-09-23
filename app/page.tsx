"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Play,
  Layers,
  Cpu,
  CheckCircle2,
  Terminal,
  Activity,
  Zap,
} from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState(
    "Triage customer support tickets and escalate emergency damage claims"
  );
  const [activeStep, setActiveStep] = useState<number>(0); // 0 = idle, 1 = input, 2 = reasoner, 3 = output
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  // Quick Opal suggestion prompts
  const samplePrompts = [
    { label: "@Triage Bot", text: "Classify D2C return requests into AI resolve vs Human escalations" },
    { label: "@Build vs Buy", text: "Evaluate in-house build cost vs off-the-shelf SaaS vendor lock-in" },
    { label: "@Adherence Nudge", text: "Diagnose asymptomatic diabetes drop-off and trigger WhatsApp care nudge" },
    { label: "@Lab Explainer", text: "Translate borderline fasting glucose test into plain English with safety limits" },
  ];

  // Button 1: Generate / Reconfigure Opal Flow
  const handleGenerateFlow = () => {
    setActiveStep(1);
    setExecutionResult(null);
    setTimeout(() => setActiveStep(2), 250);
    setTimeout(() => setActiveStep(0), 600);
  };

  // Button 2: Run Fullstack Execution (Calls Next.js Backend)
  const handleRunExecution = async () => {
    setLoading(true);
    setActiveStep(1);
    const start = performance.now();

    try {
      // Step 1: Input Ingested
      await new Promise((r) => setTimeout(r, 300));
      setActiveStep(2);

      // Step 2: Backend API Call
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, workflow: "Google Opal Node Chain" }),
      });
      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);

      setActiveStep(3);
      setLatency(elapsed);
      setExecutionResult(data);
    } catch (err: any) {
      setExecutionResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#ededed] flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Google Opal Subtle Iridescent Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-600/10 via-cyan-500/10 to-pink-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Vercel Triangle */}
          <div className="h-7 w-7 flex items-center justify-center bg-white text-black rounded-lg shadow-sm">
            <svg
              className="h-3.5 w-3.5 fill-current"
              viewBox="0 0 115 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M57.5 0L115 100H0L57.5 0Z" />
            </svg>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm tracking-tight text-white">EON 2.0</span>
            <span className="rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
              OPAL CANVAS
            </span>
          </div>
        </div>

        {/* Live Backend Indicator */}
        <div className="flex items-center space-x-2 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-xs text-neutral-300">Fullstack API Connected</span>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-mono text-neutral-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>GOOGLE OPAL STYLE · 60-MIN EXECUTION ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Build Autonomous Flows{" "}
            <span className="bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
              In Seconds.
            </span>
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed font-sans">
            Describe any hackathon problem. Construct visual workflow nodes, execute fullstack logic via Next.js backend, and present defensible reasoning.
          </p>
        </div>

        {/* Google Opal Prompt Bar */}
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#121212] to-[#0a0a0a] p-4 sm:p-5 shadow-2xl space-y-3">
          <div className="relative flex items-center">
            <Sparkles className="absolute left-4 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your workflow or prompt..."
              className="w-full rounded-xl border border-white/10 bg-black/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all font-sans"
            />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-neutral-500 mr-1">SUGGESTED FLOWS:</span>
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(s.text)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-mono text-neutral-300 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* 2 Primary Working Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleGenerateFlow}
              disabled={loading}
              className="flex items-center justify-center space-x-2 rounded-xl border border-white/15 bg-white/5 py-3 px-4 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all font-mono"
            >
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>1. Re-Wire Opal Graph</span>
            </button>

            <button
              onClick={handleRunExecution}
              disabled={loading}
              className="flex items-center justify-center space-x-2 rounded-xl bg-white py-3 px-4 text-xs font-semibold text-black hover:bg-neutral-200 transition-all font-mono shadow-glow"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{loading ? "Executing Flow..." : "2. Run Fullstack Execution →"}</span>
            </button>
          </div>
        </div>

        {/* Visual Workflow Node Graph Canvas (Opal Style) */}
        <div className="rounded-2xl border border-white/10 bg-[#080808] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>OPAL VISUAL NODE GRAPH</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">
              Status: {activeStep === 0 ? "Standby" : `Executing Step ${activeStep} of 3`}
            </span>
          </div>

          {/* Connected Nodes Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Node 1: Ingestion */}
            <div
              className={`rounded-xl border p-4 transition-all duration-300 ${
                activeStep === 1
                  ? "border-cyan-400 bg-cyan-950/20 shadow-glow-cyan"
                  : "border-white/10 bg-[#0e0e0e]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-neutral-400">NODE 01</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300">
                  INPUT
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Prompt Ingestion</h3>
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {prompt}
              </p>
            </div>

            {/* Node 2: Opal Reasoner */}
            <div
              className={`rounded-xl border p-4 transition-all duration-300 ${
                activeStep === 2
                  ? "border-purple-400 bg-purple-950/20 shadow-glow-purple"
                  : "border-white/10 bg-[#0e0e0e]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-neutral-400">NODE 02</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  REASONER
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Systems Judgment</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Applies decision criteria, valence scoring, and boundary guardrails.
              </p>
            </div>

            {/* Node 3: Action Execution */}
            <div
              className={`rounded-xl border p-4 transition-all duration-300 ${
                activeStep === 3
                  ? "border-emerald-400 bg-emerald-950/20 shadow-glow"
                  : "border-white/10 bg-[#0e0e0e]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-neutral-400">NODE 03</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  OUTPUT
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Action Dispatch</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Formats final decision payload and logs to client console.
              </p>
            </div>
          </div>
        </div>

        {/* Live Response Terminal Console */}
        <div className="rounded-2xl border border-white/10 bg-[#060606] p-5 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-white/[0.08]">
            <div className="flex items-center space-x-2">
              <Terminal className="h-3.5 w-3.5 text-neutral-400" />
              <span>LIVE BACKEND TELEMETRY</span>
            </div>
            {latency !== null && (
              <span className="text-emerald-400">{latency}ms latency · HTTP 200</span>
            )}
          </div>

          <pre className="text-xs text-neutral-300 overflow-x-auto p-3 bg-black/60 rounded-xl max-h-56 leading-relaxed border border-white/[0.04]">
            {loading
              ? `// Dispatching execution to /api/action...
// Streaming Opal Node 01 -> Node 02 -> Node 03...`
              : executionResult
              ? JSON.stringify(executionResult, null, 2)
              : `// Google Opal Execution Engine Ready.
// Click "Run Fullstack Execution" to test live client-server communication.`}
          </pre>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-6 text-center text-xs font-mono text-neutral-600">
        EON 2.0 · Google Opal Canvas × Vercel Runtime · Ready for September 28
      </footer>
    </div>
  );
}
