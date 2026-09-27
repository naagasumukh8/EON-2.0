"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Lock,
  Building2,
  FileText,
  Activity,
  Workflow,
  Clock,
  HeartPulse,
} from "lucide-react";

/* ── Antigravity Particle Field Canvas ────────────────────────── */
function AntigravityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight * 0.9);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight * 0.9;
    };
    window.addEventListener("resize", handleResize);

    // Particle pool: blue dashes and dots radiating upward in a gentle liftoff vortex
    const PARTICLE_COUNT = 110;
    interface Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      radius: number;
      length: number;
      angle: number;
      speed: number;
      opacity: number;
      color: string;
      distFromCenter: number;
    }

    const particles: Particle[] = [];
    const colors = ["#2563EB", "#3B82F6", "#60A5FA", "#1D4ED8", "#93C5FD"];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.random() * Math.PI) - (Math.PI / 2); // -90 to +90 deg
      const dist = 60 + Math.random() * 460;
      const x = width / 2 + Math.cos(angle) * dist * 1.5;
      const y = height * 0.68 + Math.sin(angle) * (dist * 0.85);

      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        radius: Math.random() * 1.6 + 0.8,
        length: Math.random() * 6 + 3,
        angle: angle - Math.PI / 2, // tilted upward
        speed: Math.random() * 0.4 + 0.15,
        opacity: Math.random() * 0.65 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
        distFromCenter: dist,
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let t = 0;
    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.72;

      particles.forEach((p, idx) => {
        // Gentle float upward with subtle orbital sway
        p.baseY -= p.speed * 0.7;
        const sway = Math.sin(t + idx * 0.2) * 1.2;

        // Reset particle when it floats too high or out of view
        if (p.baseY < height * 0.08) {
          p.baseY = centerY + Math.random() * 80;
          p.baseX = centerX + (Math.random() - 0.5) * (width * 0.75);
        }

        // Slight gentle repulsion from mouse
        const dx = mouseX - p.baseX;
        const dy = mouseY - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let offsetX = 0;
        let offsetY = 0;
        if (dist < 140) {
          const force = (140 - dist) / 140;
          offsetX = -(dx / dist) * force * 18;
          offsetY = -(dy / dist) * force * 18;
        }

        p.x = p.baseX + sway + offsetX;
        p.y = p.baseY + offsetY;

        // Draw particle dash / pill rotated in liftoff vector
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.rect(-p.radius, -p.length / 2, p.radius * 2, p.length);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
}

/* ── Live Single Stat Counter ────────────────────────────────── */
function SingleStatCountUp({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return;
        triggered.current = true;
        const duration = 1400;
        const start = Date.now();
        const frame = () => {
          const p = Math.min((Date.now() - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(ease * target));
          if (p < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>;
}

/* ── Antigravity Geometric Brand Logo Mark ───────────────────── */
function AntigravityMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 14C32 14 36 62 18 80C10 88 18 90 22 86C38 74 38 52 50 52C62 52 62 74 78 86C82 90 90 88 82 80C64 62 68 14 50 14Z"
        fill="url(#ag-grad)"
      />
      <defs>
        <linearGradient id="ag-grad" x1="15" y1="85" x2="85" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="45%" stopColor="#38BDF8" />
          <stop offset="75%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Top Navigation Bar (Antigravity Floating Translucent) ───── */
function TopNav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
      }}
      className="w-full transition-all"
    >
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 text-decoration-none group">
          <AntigravityMark />
          <span
            style={{
              fontFamily: '"Google Sans Flex", "Google Sans", "Sora", sans-serif',
              fontWeight: 500,
              fontSize: "17px",
              color: "rgb(18, 19, 23)",
              letterSpacing: "-0.01em",
            }}
          >
            UnStuck Med
          </span>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/dashboard", label: "Queue" },
            { href: "/classify", label: "AI Classifier" },
            { href: "/security", label: "Security & Trust" },
            { href: "/workflow", label: "Workflow Matrix" },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: "14px",
                fontWeight: 450,
                color: "rgb(69, 71, 77)",
                padding: "6px 14px",
                borderRadius: "9999px",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              className="hover:text-black hover:bg-black/5"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            style={{
              background: "rgb(18, 19, 23)",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 450,
              padding: "8px 18px",
              borderRadius: "9999px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
              transition: "transform 0.15s ease",
            }}
            className="hover:scale-[1.02] active:scale-95"
          >
            <span>Open Queue</span>
            <ArrowRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ═════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div
      style={{
        background: "#FFFFFF",
        color: "rgb(18, 19, 23)",
        fontFamily: '"Google Sans Flex", "Google Sans", "Sora", sans-serif',
        minHeight: "100vh",
      }}
      className="relative overflow-x-hidden selection:bg-blue-100 selection:text-blue-900"
    >
      <TopNav />

      {/* ── HERO SECTION: 1:1 Antigravity Aesthetics ────────────── */}
      <section className="relative min-h-[82vh] flex items-center justify-center text-center overflow-hidden px-6 pt-16 pb-24">
        {/* Dynamic canvas particle liftoff vortex */}
        <AntigravityCanvas />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Centered Small Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "9999px",
              background: "rgba(37, 99, 235, 0.06)",
              border: "1px solid rgba(37, 99, 235, 0.12)",
              marginBottom: "28px",
            }}
          >
            <AntigravityMark />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "rgb(18, 19, 23)",
                letterSpacing: "-0.01em",
              }}
            >
              UnStuck Med
            </span>
          </div>

          {/* Antigravity Giant Confident Typography Headline */}
          <h1
            style={{
              fontSize: "clamp(2.75rem, 5.8vw, 5rem)",
              fontWeight: 450,
              lineHeight: 1.08,
              letterSpacing: "-0.035em",
              color: "rgb(18, 19, 23)",
              margin: "0 0 24px 0",
              maxWidth: "880px",
            }}
          >
            Experience liftoff with next-gen refill intelligence
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.6,
              color: "rgb(69, 71, 77)",
              maxWidth: "600px",
              margin: "0 0 36px 0",
              fontWeight: 400,
            }}
          >
            Prescription refills stuck on provider review, insurance holds, or pharmacy inventory.
            Unstuck in minutes with deterministic AI triage and human safety guardrails.
          </p>

          {/* Antigravity Pill Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              style={{
                background: "rgb(18, 19, 23)",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: 450,
                padding: "12px 28px",
                borderRadius: "9999px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                transition: "all 0.15s ease",
              }}
              className="hover:scale-[1.02] active:scale-95"
            >
              <Zap style={{ width: 15, height: 15, color: "#60A5FA" }} />
              <span>Open Refill Queue</span>
            </Link>

            <Link
              href="/classify"
              style={{
                background: "rgba(183, 191, 217, 0.1)",
                color: "rgb(18, 19, 23)",
                fontSize: "15px",
                fontWeight: 450,
                padding: "12px 28px",
                borderRadius: "9999px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid rgba(33, 34, 38, 0.08)",
                backdropFilter: "blur(6px)",
                transition: "all 0.15s ease",
              }}
              className="hover:bg-black/5 active:scale-95"
            >
              <span>Explore AI Classifier</span>
              <ArrowRight style={{ width: 14, height: 14, color: "rgb(69, 71, 77)" }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION: Horizontal Pill Icons Marquee & Statement ─── */}
      <section className="border-t border-black/5 py-14 px-6 bg-gradient-to-b from-white to-slate-50/50">
        <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center">
          {/* Circular Icon Pills Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10 opacity-85">
            {[
              { icon: Sparkles, tip: "AI Triage" },
              { icon: Check, tip: "Auto-Verify" },
              { icon: HeartPulse, tip: "Adherence" },
              { icon: Workflow, tip: "Handoff" },
              { icon: Lock, tip: "PII Stripped" },
              { icon: Building2, tip: "Partner Stock" },
              { icon: FileText, tip: "Prior Auth" },
              { icon: Activity, tip: "State Machine" },
              { icon: Clock, tip: "192m Saved" },
              { icon: Shield, tip: "Guardrail" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgb(69, 71, 77)",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
                className="hover:scale-110 hover:border-blue-400 hover:text-blue-600"
                title={item.tip}
              >
                <item.icon style={{ width: 17, height: 17 }} />
              </div>
            ))}
          </div>

          {/* Large Antigravity Editorial Statement */}
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3.6vw, 2.75rem)",
              fontWeight: 450,
              lineHeight: 1.25,
              letterSpacing: "-0.025em",
              color: "rgb(18, 19, 23)",
              maxWidth: "840px",
              margin: "0 auto",
            }}
          >
            UnStuck Med is our clinical triage platform, allowing clinics and pharmacies to collaborate seamlessly in the AI era.
          </h2>
        </div>
      </section>

      {/* ── SECTION: Product Showcase (Like Antigravity 2.0 Card) ── */}
      <section className="py-20 px-6 max-w-screen-xl mx-auto">
        <div
          style={{
            borderRadius: "32px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,247,250,0.8) 100%)",
            border: "1px solid rgba(0, 0, 0, 0.07)",
            boxShadow: "0 24px 64px -16px rgba(37, 99, 235, 0.08), 0 2px 10px rgba(0, 0, 0, 0.03)",
            padding: "48px 40px",
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              right: "-10%",
              width: "480px",
              height: "480px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(249, 115, 22, 0.05) 50%, transparent 80%)",
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          {/* Left Column: Copy & Live Metric */}
          <div className="lg:col-span-5 space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Refill Intelligence 2.0
            </div>

            <h3
              style={{
                fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
                fontWeight: 450,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "rgb(18, 19, 23)",
                margin: 0,
              }}
            >
              Your cross-organizational triage command center.
            </h3>

            <p style={{ fontSize: "16px", color: "rgb(69, 71, 77)", lineHeight: 1.65, margin: 0 }}>
              Group stalled refills across clinics, PBMs, and pharmacies into one prioritized clinical worklist.
              Execute verified resolutions automatically or with one human click.
            </p>

            {/* Live Metric */}
            <div className="pt-4 border-t border-black/5 flex items-baseline gap-4">
              <div>
                <div
                  style={{
                    fontSize: "44px",
                    fontWeight: 700,
                    color: "#15803D",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                  }}
                >
                  <SingleStatCountUp target={192} /> min
                </div>
                <div style={{ fontSize: "12.5px", color: "rgb(69, 71, 77)", marginTop: "4px" }}>
                  Avg manual coordination time replaced per refill
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/dashboard"
                style={{
                  background: "rgb(18, 19, 23)",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 450,
                  padding: "10px 22px",
                  borderRadius: "9999px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                className="hover:opacity-90"
              >
                <span>Launch Worklist</span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>
          </div>

          {/* Right Column: Antigravity UI Card Preview Mockup */}
          <div className="lg:col-span-7 relative z-10">
            <div
              style={{
                borderRadius: "20px",
                background: "#FFFFFF",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow: "0 16px 40px -10px rgba(0,0,0,0.06)",
                padding: "24px",
              }}
              className="space-y-3"
            >
              {/* Card topbar */}
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-semibold text-slate-700">LIVE WORKLIST · 6 ACTIVE STALLS</span>
                </div>
                <span className="text-xs font-mono text-slate-400">STATE_MACHINE: AUTONOMOUS</span>
              </div>

              {/* Sample Refill Rows */}
              {[
                {
                  id: "RF-009",
                  token: "pt-4k8m",
                  med: "Amoxicillin 500mg",
                  block: "Pharmacy Out of Stock",
                  action: "Suggested 2 nearby partner pharmacies in stock",
                  tag: "SIMULATED DATA",
                  tagColor: "bg-amber-100 text-amber-800 border-amber-300",
                },
                {
                  id: "RF-001",
                  token: "pt-7a3f",
                  med: "Metformin 500mg",
                  block: "Zero Refills Remaining",
                  action: "Drafted eRx renewal to Dr. Chen (human review)",
                  tag: "THERAPY PROTECTED",
                  tagColor: "bg-red-50 text-red-700 border-red-200",
                },
                {
                  id: "RF-005",
                  token: "pt-1e6c",
                  med: "Levothyroxine 50mcg",
                  block: "Demographic DOB Mismatch",
                  action: "Auto-dispatched demographic verification SMS",
                  tag: "AUTO-EXECUTED",
                  tagColor: "bg-blue-50 text-blue-700 border-blue-200",
                },
              ].map(row => (
                <div
                  key={row.id}
                  style={{
                    background: "#FAFAFA",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                  }}
                  className="flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-slate-400 font-semibold">{row.id}</span>
                      <strong className="text-slate-900 font-medium">{row.med}</strong>
                      <span className="text-slate-400 font-mono text-[11px]">({row.token})</span>
                    </div>
                    <div className="text-slate-500">{row.action}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${row.tagColor}`}>
                    {row.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: Opal Scroll Narrative (1 idea at a time) ──── */}
      <section className="py-20 px-6 max-w-screen-xl mx-auto border-t border-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Sequential Narrative
            </div>
            <h2
              style={{
                fontSize: "clamp(2rem, 3.4vw, 2.75rem)",
                fontWeight: 450,
                lineHeight: 1.18,
                letterSpacing: "-0.03em",
                color: "rgb(18, 19, 23)",
                margin: "0 0 16px 0",
              }}
            >
              Three steps.<br />Zero phone tag.
            </h2>
            <p style={{ fontSize: "16px", color: "rgb(69, 71, 77)", lineHeight: 1.65, margin: "0 0 24px 0" }}>
              Every stall is resolved without administrative friction while preserving human clinician authority over therapy.
            </p>

            <button
              onClick={() => setShowWorkflow(!showWorkflow)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(183, 191, 217, 0.1)",
                border: "1px solid rgba(33, 34, 38, 0.08)",
                color: "rgb(18, 19, 23)",
                padding: "9px 18px",
                borderRadius: "9999px",
                fontSize: "13.5px",
                fontWeight: 450,
                cursor: "pointer",
              }}
              className="hover:bg-black/5"
            >
              <Layers style={{ width: 14, height: 14, color: "#2563EB" }} />
              <span>{showWorkflow ? "Hide Actor Matrix" : "See Full Workflow Table"}</span>
              {showWorkflow ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
            </button>
          </div>

          <div className="lg:col-span-7 space-y-12">
            {[
              {
                step: "01",
                title: "Classify the root block",
                tag: "AI Engine · <4s",
                desc: "Staff logs the stall. The classifier de-identifies PII and deterministically detects the exact cause: zero refills remaining, prior authorization hold, demographic mismatch, or pharmacy stock shortage.",
              },
              {
                step: "02",
                title: "Assemble the cross-organizational action",
                tag: "Triage Routing",
                desc: "The system pre-fills the required resolution: drafting a new eRx renewal to the attending physician, appealing an insurance step-therapy exclusion, or querying nearby partner pharmacy inventory.",
              },
              {
                step: "03",
                title: "Enforce human-in-the-loop sign-off",
                tag: "Safety Invariant",
                desc: "In Draft-Only mode, every action requires explicit human confirmation. In Autonomous mode, only whitelisted low-risk alerts auto-execute — any therapy-affecting change strictly requires human sign-off.",
              },
            ].map((s, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "rgb(18, 19, 23)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {s.step}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h4 style={{ fontSize: "20px", fontWeight: 500, margin: 0, color: "rgb(18, 19, 23)" }}>
                      {s.title}
                    </h4>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      {s.tag}
                    </span>
                  </div>
                  <p style={{ fontSize: "15px", color: "rgb(69, 71, 77)", lineHeight: 1.65, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable Actor Matrix Table */}
        {showWorkflow && (
          <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-black/5 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-semibold text-slate-900">
                Cross-Organizational Actor Handoff Matrix
              </h4>
              <Link href="/workflow" className="text-xs font-semibold text-blue-600 hover:underline">
                Open dedicated page →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono">
                    <th className="py-2.5 px-3">BLOCK TYPE</th>
                    <th className="py-2.5 px-3">CONVENTIONAL DELAY</th>
                    <th className="py-2.5 px-3">UNSTUCK MED ACTION</th>
                    <th className="py-2.5 px-3">HUMAN SAFETY GUARDRAIL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Zero Refills Remaining</td>
                    <td className="py-2.5 px-3 text-slate-500">Fax sits in inbox 3-5 days</td>
                    <td className="py-2.5 px-3 text-blue-600 font-medium">Drafts eRx renewal with adherence history</td>
                    <td className="py-2.5 px-3 font-semibold">Attending physician signs</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Prior Authorization Hold</td>
                    <td className="py-2.5 px-3 text-slate-500">Patient denied at register</td>
                    <td className="py-2.5 px-3 text-blue-600 font-medium">Assembles diagnosis & formulary appeal</td>
                    <td className="py-2.5 px-3 font-semibold">Practice staff submits</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">Pharmacy Out of Stock</td>
                    <td className="py-2.5 px-3 text-slate-500">Patient calls 5 stores</td>
                    <td className="py-2.5 px-3 text-blue-600 font-medium">Queries partner stock (Simulated)</td>
                    <td className="py-2.5 px-3 font-semibold">Clinician clicks &apos;Request Transfer&apos;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── CORE DESIGN PRINCIPLE (Continuity invariant) ─────────── */}
      <section className="py-16 px-6 bg-slate-50 border-t border-black/5 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue-700 mb-3">
            <Shield style={{ width: 13, height: 13 }} />
            Core Clinical Design Principle
          </div>
          <h3
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              fontWeight: 450,
              lineHeight: 1.25,
              letterSpacing: "-0.025em",
              color: "rgb(18, 19, 23)",
              margin: "0 0 14px 0",
            }}
          >
            We deliberately do not suggest alternate providers.
          </h3>
          <p style={{ fontSize: "15px", color: "rgb(69, 71, 77)", lineHeight: 1.7, margin: 0 }}>
            Clinical continuity stays with the assigned physician. Rerouting a patient to a different doctor simply to bypass an administrative refill bottleneck damages longitudinal care.
            UnStuck Med moves the paperwork, not the patient relationship.
          </p>
        </div>
      </section>

      {/* ── GIANT TYPOGRAPHY FOOTER (Like Antigravity Footer) ──── */}
      <footer
        style={{
          background: "rgb(18, 19, 23)",
          color: "#FFFFFF",
          padding: "80px 24px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="max-w-screen-xl mx-auto relative z-10 flex flex-col justify-between min-h-[300px]">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <AntigravityMark />
                <span style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "-0.02em" }}>
                  UnStuck Med
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", maxWidth: "340px", margin: 0 }}>
                Autonomous &amp; Human-in-the-Loop Prescription Refill Triage Platform.
              </p>
            </div>

            <div className="flex gap-10 text-xs">
              <div className="space-y-2">
                <div className="font-mono text-slate-400 font-semibold uppercase">Product</div>
                <div><Link href="/dashboard" className="text-white/80 hover:text-white text-decoration-none">Queue Worklist</Link></div>
                <div><Link href="/classify" className="text-white/80 hover:text-white text-decoration-none">AI Classifier</Link></div>
                <div><Link href="/workflow" className="text-white/80 hover:text-white text-decoration-none">Workflow Matrix</Link></div>
              </div>
              <div className="space-y-2">
                <div className="font-mono text-slate-400 font-semibold uppercase">Governance</div>
                <div><Link href="/security" className="text-white/80 hover:text-white text-decoration-none">Security &amp; Trust</Link></div>
                <div><span className="text-white/40">HIPAA Aligned</span></div>
                <div><span className="text-white/40">Zero-PII Pipeline</span></div>
              </div>
            </div>
          </div>

          {/* Giant Antigravity-Style Typographic Treatment */}
          <div
            style={{
              fontSize: "clamp(3.5rem, 12vw, 9.5rem)",
              fontWeight: 500,
              letterSpacing: "-0.04em",
              color: "rgba(255, 255, 255, 0.08)",
              lineHeight: 0.9,
              marginTop: "48px",
              userSelect: "none",
              pointerEvents: "none",
              textAlign: "center",
            }}
          >
            UnStuck Med
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-white/50">
            <span>© 2026 UnStuck Med · Polymath Innovae × Eonexea AI Hackathon</span>
            <span>Google Antigravity Design Language</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
