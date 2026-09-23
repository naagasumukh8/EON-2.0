"use client";

import React, { useState } from "react";

export default function Home() {
  const [inputVal, setInputVal] = useState("Hackathon test query");
  const [responseLog, setResponseLog] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  // Button 1: Ping Backend GET
  const handlePing = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/action");
      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setResponseLog({ type: "GET /api/action", data, latencyMs: elapsed });
    } catch (err: any) {
      setResponseLog({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Button 2: Execute Action POST
  const handleExecute = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hackathon_workflow", payload: inputVal }),
      });
      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setResponseLog({ type: "POST /api/action", data, latencyMs: elapsed });
    } catch (err: any) {
      setResponseLog({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#ededed] flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Minimal Header */}
      <header className="border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Vercel Triangle */}
          <div className="h-6 w-6 flex items-center justify-center bg-white text-black rounded">
            <svg
              className="h-3.5 w-3.5 fill-current"
              viewBox="0 0 115 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M57.5 0L115 100H0L57.5 0Z" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight text-white">EON 2.0</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-xs text-neutral-400">Frontend ↔ Backend Live</span>
        </div>
      </header>

      {/* Main Minimalist Console */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl space-y-6">
          {/* Title Area */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-neutral-300">
              POLYMATH × EONEXEA · READY FOR SEPT 28
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              EON 2.0 Hackathon Base
            </h1>
            <p className="text-sm text-neutral-400">
              Clean, connected fullstack base. Ready for immediate execution as soon as problem statement drops.
            </p>
          </div>

          {/* Card Container */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">
                INPUT PAYLOAD:
              </label>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Enter sample input..."
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-white/40 focus:outline-none font-mono"
              />
            </div>

            {/* 2 Working Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handlePing}
                disabled={loading}
                className="w-full rounded-xl bg-white/10 border border-white/15 py-2.5 px-4 text-xs font-semibold text-white hover:bg-white/20 transition-all font-mono"
              >
                1. Ping Backend
              </button>

              <button
                onClick={handleExecute}
                disabled={loading}
                className="w-full rounded-xl bg-white py-2.5 px-4 text-xs font-semibold text-black hover:bg-neutral-200 transition-all font-mono shadow-sm"
              >
                2. Run Action →
              </button>
            </div>
          </div>

          {/* Response Terminal */}
          <div className="rounded-2xl border border-white/10 bg-[#070707] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-500 pb-2 border-b border-white/[0.08]">
              <span>TERMINAL OUTPUT</span>
              {latency !== null && (
                <span className="text-emerald-400">{latency}ms response</span>
              )}
            </div>

            <pre className="text-xs font-mono text-neutral-300 overflow-x-auto p-2 bg-black/60 rounded-lg max-h-48 leading-relaxed">
              {loading
                ? "Calling /api/action..."
                : responseLog
                ? JSON.stringify(responseLog, null, 2)
                : '// Click "Ping Backend" or "Run Action" to verify connection.'}
            </pre>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-4 text-center text-xs font-mono text-neutral-600">
        Solid Black Vercel Runtime · 60-Min Ready
      </footer>
    </div>
  );
}
