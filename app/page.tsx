"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Zap, ChevronDown, ChevronUp, Layers, Bot, Check,
} from "lucide-react";
import { CrowdCanvas } from "@/components/ui/skiper39";
import { TextReveal } from "@/components/ui/text-reveal";

/* -- Typewriter -- */
function TypewriterWords({ words }: { words: string[] }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const target = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < target.length)
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 70);
    else if (!deleting && displayed.length === target.length)
      timeout = setTimeout(() => setDeleting(true), 1800);
    else if (deleting && displayed.length > 0)
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    else { setDeleting(false); setWordIdx(i => (i + 1) % words.length); }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIdx, words]);
  return (
    <span style={{ color: "rgb(18,19,23)", fontWeight: 600 }}>
      {displayed}
      <span style={{ display: "inline-block", width: "2px", height: "1em", background: "linear-gradient(180deg,#4B7FE8,#2563EB)", marginLeft: "2px", verticalAlign: "text-bottom", animation: "blink 1.1s step-end infinite" }} />
    </span>
  );
}

/* -- Fade-in on scroll -- */
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

/* -- Nav -- */
function Nav() {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(240,240,240,0.82)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", height: "54px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontFamily: '"Google Sans","Sora",sans-serif', fontWeight: 600, fontSize: "16px", color: "rgb(18,19,23)", textDecoration: "none", letterSpacing: "-0.01em" }}>
          UnStuck Med
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[
            { href: "/dashboard", label: "Worklist" },
            { href: "/classify",  label: "Classifier" },
            { href: "/security",  label: "Security" },
            { href: "/workflow",  label: "Workflow" },
            { href: "/gtm",       label: "GTM / Funnel" },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: "13.5px", fontWeight: 450, color: "rgb(60,60,65)", padding: "6px 14px", borderRadius: "9999px", textDecoration: "none", transition: "background 0.15s" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard" style={{ background: "rgb(18,19,23)", color: "#fff", fontSize: "13.5px", fontWeight: 450, padding: "8px 20px", borderRadius: "9999px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          Open Worklist <ArrowRight style={{ width: 13, height: 13 }} />
        </Link>
      </div>
    </header>
  );
}

/* ── PRICING SECTION with Monthly / Yearly toggle ──────── */
function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const yearly = billing === "yearly";

  const plans = [
    {
      label: "Usage",
      title: "Per-Resolved Stall",
      price: yearly ? "$1.02" : "$1.20",
      unit: "/ resolved refill",
      note: "Breaks even on 1st saved call",
      recommended: false,
      dark: false,
      features: ["Triage Queue Access", "Deterministic Classifier", "Human Clinician Sign-off"],
    },
    {
      label: "Ambulatory Group",
      title: "Clinic Provider SaaS",
      price: yearly ? "$392" : "$490",
      unit: "/ provider / month",
      note: yearly ? "Save $1,176/yr · billed annually" : "Payback: 3 hrs staff phone tag",
      recommended: true,
      dark: true,
      features: ["Unlimited Refill Triage", "Bi-directional EHR Connector", "Therapy Protected Protocol", "Partner Pharmacy Stock Lookup"],
    },
    {
      label: "Enterprise",
      title: "Health System Campus",
      price: "Custom",
      unit: "volume tiered",
      note: "Includes custom integration",
      recommended: false,
      dark: false,
      features: ["Dedicated FHIR R4 Bridge", "Custom Formulary Rule Engine", "99.9% High Availability SLA", "Enterprise BAA & Audit Logs"],
    },
  ];

  return (
    <section style={{ padding: "0 32px 100px", maxWidth: "1200px", margin: "0 auto" }}>
      <FadeIn>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", marginBottom: "48px" }}>
          <div>
            <p style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(18,19,23,0.38)", margin: "0 0 12px" }}>Pricing</p>
            <h2 style={{ fontSize: "clamp(2rem,3.2vw,3rem)", fontWeight: 650, lineHeight: 1.12, letterSpacing: "-0.035em", color: "rgb(18,19,23)", margin: "0 0 8px" }}>
              Simple, usage-based pricing.
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(18,19,23,0.5)", margin: 0 }}>
              Pays for itself within 3 hours of deflected staff phone tag.
            </p>
          </div>

          {/* Monthly / Yearly toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0", background: "rgba(0,0,0,0.06)", borderRadius: "9999px", padding: "3px", border: "1px solid rgba(0,0,0,0.07)" }}>
            {(["monthly", "yearly"] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setBilling(opt)}
                style={{
                  fontSize: "13px", fontWeight: 550, padding: "8px 20px", borderRadius: "9999px",
                  border: "none", cursor: "pointer", transition: "all 0.18s ease",
                  background: billing === opt ? "rgb(18,19,23)" : "transparent",
                  color: billing === opt ? "#fff" : "rgba(18,19,23,0.5)",
                  display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                {opt === "yearly" && (
                  <span style={{ fontSize: "10px", fontWeight: 700, background: billing === "yearly" ? "#4ADE80" : "rgba(74,222,128,0.2)", color: billing === "yearly" ? "rgb(18,19,23)" : "#16a34a", padding: "1px 6px", borderRadius: "9999px" }}>
                    Save 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", alignItems: "start" }}>
          {plans.map(plan => (
            <div
              key={plan.title}
              style={{
                background: plan.dark ? "rgb(18,19,23)" : "#fff",
                border: plan.recommended ? "2px solid #8AB4F8" : plan.dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                borderRadius: "20px",
                padding: "36px 32px",
                display: "flex", flexDirection: "column", gap: "24px",
                position: "relative",
                boxShadow: plan.recommended ? "0 8px 40px rgba(138,180,248,0.18)" : "none",
                transition: "transform 0.2s ease",
              }}
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <span style={{
                  position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                  background: "#8AB4F8", color: "rgb(18,19,23)",
                  fontFamily: "monospace", fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "4px 14px", borderRadius: "9999px", whiteSpace: "nowrap",
                }}>
                  Recommended
                </span>
              )}

              <div>
                <p style={{
                  fontFamily: "monospace", fontSize: "10px", fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: plan.dark ? "#8AB4F8" : "rgba(18,19,23,0.38)",
                  margin: "0 0 10px",
                }}>{plan.label}</p>
                <h3 style={{
                  fontSize: "19px", fontWeight: 650, letterSpacing: "-0.02em",
                  color: plan.dark ? "#fff" : "rgb(18,19,23)", margin: "0 0 12px",
                }}>{plan.title}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{
                    fontSize: "42px", fontWeight: 700, letterSpacing: "-0.04em",
                    color: plan.dark ? "#fff" : "rgb(18,19,23)", lineHeight: 1,
                    transition: "all 0.2s",
                  }}>{plan.price}</span>
                  <span style={{ fontSize: "13px", color: plan.dark ? "rgba(255,255,255,0.4)" : "rgba(18,19,23,0.45)" }}>
                    {plan.unit}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${plan.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, paddingTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "13.5px", color: plan.dark ? "rgba(255,255,255,0.72)" : "rgba(18,19,23,0.7)" }}>
                    <Check style={{ width: 14, height: 14, color: plan.dark ? "#4ADE80" : "#22c55e", flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link
                  href="/dashboard"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    padding: "11px 20px", borderRadius: "9999px",
                    background: plan.dark ? "#fff" : "rgb(18,19,23)",
                    color: plan.dark ? "rgb(18,19,23)" : "#fff",
                    fontSize: "14px", fontWeight: 550, textDecoration: "none",
                    transition: "opacity 0.15s",
                  }}
                >
                  {plan.title === "Health System Campus" ? "Contact Sales" : "Get Started"}
                  <ArrowRight style={{ width: 13, height: 13 }} />
                </Link>
                <p style={{
                  fontFamily: "monospace", fontSize: "11px",
                  color: plan.dark ? "rgba(255,255,255,0.3)" : "rgba(18,19,23,0.35)",
                  margin: 0, textAlign: "center",
                }}>{plan.note}</p>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

export default function HomePage() {
  const [showWorkflow, setShowWorkflow] = useState(false);
  return (
    <>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box}
      `}</style>
      <div style={{ background: "#F0F0F0", color: "rgb(18,19,23)", fontFamily: '"Google Sans","Sora","Inter",sans-serif', minHeight: "100vh", overflowX: "hidden" }}>
        <Nav />

        {/* HERO */}
        <section style={{ position: "relative", minHeight: "92vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "50px 32px 300px", overflow: "hidden" }}>
          <div style={{ position: "relative", zIndex: 1, maxWidth: "860px", margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", padding: "6px 18px", borderRadius: "9999px", background: "rgb(18,19,23)", color: "#fff", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.01em", marginBottom: "26px" }}>
              UnStuck Med
            </div>
            <h1 style={{ fontSize: "clamp(2.8rem,6vw,5.2rem)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-0.04em", color: "rgb(18,19,23)", margin: "0 0 28px" }}>
              Prescription refills.<br />Unstuck in minutes.
            </h1>
            <p style={{ fontSize: "clamp(1rem,1.6vw,1.2rem)", lineHeight: 1.6, color: "rgb(80,80,85)", margin: "0 auto 40px", maxWidth: "560px", fontWeight: 400 }}>
              One shared worklist. Deterministic AI triage.<br />
              Built for <TypewriterWords words={["pharmacy staff", "practice teams", "provider review", "cross-org care"]} />
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/dashboard" style={{ background: "rgb(18,19,23)", color: "#fff", fontSize: "15px", fontWeight: 500, padding: "13px 28px", borderRadius: "9999px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <Zap style={{ width: 15, height: 15, color: "#8AB4F8" }} />
                Open Worklist
              </Link>
              <Link href="/classify" style={{ background: "rgba(0,0,0,0.05)", color: "rgb(18,19,23)", fontSize: "15px", fontWeight: 450, padding: "13px 28px", borderRadius: "9999px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid rgba(0,0,0,0.09)" }}>
                <Bot style={{ width: 15, height: 15 }} />
                Explore AI Classifier
              </Link>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, overflow: "hidden", lineHeight: 0, width: "100%", height: "clamp(280px, 33vh, 380px)", pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "70px", background: "linear-gradient(to bottom, #F0F0F0 25%, rgba(240,240,240,0))", zIndex: 3, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "15px", background: "linear-gradient(to top, #F0F0F0 10%, rgba(240,240,240,0))", zIndex: 3, pointerEvents: "none" }} />
            <CrowdCanvas src="/peeps.png" rows={15} cols={7} className="w-full h-full block" />
          </div>
        </section>

        {/* STATEMENT */}
        <section style={{ background: "#F0F0F0", borderTop: "1px solid rgba(0,0,0,0.07)", padding: "96px 32px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <TextReveal
              as="p" preset="fade-in-blur" per="word" speedReveal={1.2}
              viewport={{ once: true, amount: 0.35 }}
              style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 450, lineHeight: 1.35, letterSpacing: "-0.025em", color: "rgb(18,19,23)", margin: 0 }}
            >
              UnStuck Med is our clinical triage platform, allowing clinics and pharmacies to collaborate in the AI era.
            </TextReveal>
          </div>
        </section>

        {/* BLACK FEATURE CARD */}
        <section style={{ padding: "0 32px 80px", maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ background: "rgb(18,19,23)", borderRadius: "28px", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "420px" }}>
              <div style={{ padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8AB4F8" }}>Refill Intelligence</span>
                <h2 style={{ fontSize: "clamp(1.8rem,2.8vw,2.6rem)", fontWeight: 650, lineHeight: 1.15, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
                  Your cross-org triage command center.
                </h2>
                <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>
                  Stalled refills across clinics, PBMs, and pharmacies — one prioritized worklist. Resolutions in minutes, not days.
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ fontSize: "48px", fontWeight: 700, color: "#4ADE80", letterSpacing: "-0.05em", lineHeight: 1 }}>192</span>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>minutes of manual coordination<br />replaced per refill</span>
                </div>
                <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#8AB4F8", fontSize: "14px", fontWeight: 500, textDecoration: "none", width: "fit-content" }}>
                  Launch worklist <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderLeft: "1px solid rgba(255,255,255,0.06)", padding: "40px 32px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Live · 6 Active Stalls</span>
                </div>
                {[
                  { id: "RF-001", med: "Metformin 500mg", block: "Zero refills remaining", state: "THERAPY PROTECTED", sc: "#FCA5A5" },
                  { id: "RF-005", med: "Levothyroxine 50mcg", block: "DOB mismatch — SMS sent", state: "AUTO-EXECUTED", sc: "#8AB4F8" },
                  { id: "RF-009", med: "Amoxicillin 500mg", block: "Out of stock", state: "PENDING REVIEW", sc: "#FCD34D" },
                ].map(row => (
                  <div key={row.id} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{row.id}</span>
                          <span style={{ fontSize: "13px", fontWeight: 500, color: "#fff" }}>{row.med}</span>
                        </div>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)" }}>{row.block}</span>
                      </div>
                      <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, color: row.sc, whiteSpace: "nowrap", paddingLeft: "10px" }}>{row.state}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </section>

        {/* THREE STEPS */}
        <section style={{ padding: "80px 32px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>
            <div style={{ position: "sticky", top: "80px" }}>
              <FadeIn>
                <p style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(18,19,23,0.38)", margin: "0 0 16px" }}>How it works</p>
                <h2 style={{ fontSize: "clamp(2rem,3.2vw,3rem)", fontWeight: 650, lineHeight: 1.12, letterSpacing: "-0.035em", color: "rgb(18,19,23)", margin: "0 0 20px" }}>
                  Three steps.<br />Zero phone tag.
                </h2>
                <p style={{ fontSize: "15.5px", color: "rgba(18,19,23,0.55)", lineHeight: 1.7, margin: "0 0 32px" }}>
                  Every stall resolved without administrative friction, while preserving clinician authority over every therapy decision.
                </p>
                <button onClick={() => setShowWorkflow(!showWorkflow)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: showWorkflow ? "rgba(0,0,0,0.07)" : "rgb(18,19,23)", color: showWorkflow ? "rgb(18,19,23)" : "#fff", border: "none", padding: "10px 20px", borderRadius: "9999px", fontSize: "13.5px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s ease" }}>
                  <Layers style={{ width: 13, height: 13 }} />
                  {showWorkflow ? "Hide workflow table" : "See the full workflow table"}
                  {showWorkflow ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
                </button>
              </FadeIn>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { n: "01", title: "Classify the root block", tag: "AI Engine · <4s", body: "Staff logs the stall. The classifier de-identifies PII and deterministically detects the exact cause — zero refills, prior auth hold, demographic mismatch, or pharmacy stock shortage." },
                { n: "02", title: "Assemble the cross-org action", tag: "Triage Routing", body: "System pre-fills the required resolution: a new eRx renewal draft, an insurance step-therapy appeal, or a partner pharmacy inventory query." },
                { n: "03", title: "Enforce human sign-off", tag: "Safety Invariant", body: "Draft-Only: every action needs a human click. Autonomous: only whitelisted low-risk alerts auto-execute. Therapy changes always require sign-off." },
              ].map((s, i) => (
                <FadeIn key={i} delay={i * 100}>
                  <div style={{ padding: "36px 0", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", gap: "24px", alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: "rgba(18,19,23,0.28)", paddingTop: "4px", flexShrink: 0 }}>{s.n}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 550, margin: 0, letterSpacing: "-0.015em" }}>{s.title}</h3>
                        <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: "rgba(0,0,0,0.05)", color: "rgba(18,19,23,0.5)" }}>{s.tag}</span>
                      </div>
                      <p style={{ fontSize: "14.5px", color: "rgba(18,19,23,0.55)", lineHeight: 1.7, margin: 0 }}>{s.body}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }} />
            </div>
          </div>
          {showWorkflow && (
            <FadeIn>
              <div style={{ marginTop: "48px", background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "18px", overflow: "hidden" }}>
                <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>Cross-Organizational Actor Handoff Matrix</span>
                  <Link href="/workflow" style={{ fontSize: "13px", color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>Full page →</Link>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                        {["Block Type","Conventional Delay","UnStuck Med Action","Human Guardrail"].map(h => (
                          <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontFamily: "monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(18,19,23,0.4)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Zero Refills Remaining","Fax sits in inbox 3–5 days","Drafts eRx renewal with adherence history","Physician signs"],
                        ["Prior Authorization Hold","Patient denied at register","Assembles diagnosis & formulary appeal","Practice staff submits"],
                        ["Pharmacy Out of Stock","Patient calls 5 stores","Queries partner stock inventory","Clinician requests transfer"],
                        ["Demographic Mismatch","Manual callback loop","Auto-dispatches verification SMS","Auto-executed (low-risk)"],
                      ].map((row, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                          <td style={{ padding: "14px 20px", fontWeight: 500 }}>{row[0]}</td>
                          <td style={{ padding: "14px 20px", color: "rgba(18,19,23,0.45)" }}>{row[1]}</td>
                          <td style={{ padding: "14px 20px", color: "#2563EB", fontWeight: 500 }}>{row[2]}</td>
                          <td style={{ padding: "14px 20px", fontWeight: 600 }}>{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>
          )}
        </section>

        {/* PRICING */}
        <PricingSection />

        {/* DARK FOOTER */}
        <footer style={{ background: "#0D0E12", position: "relative", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", minHeight: "440px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ position: "relative", zIndex: 2, maxWidth: "1240px", width: "100%", margin: "0 auto", padding: "64px 48px 36px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "60px", alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontFamily: '"Google Sans","Sora","Inter",sans-serif', fontWeight: 700, fontSize: "19px", color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                  UnStuck Med
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.48)", lineHeight: 1.65, margin: 0, maxWidth: "340px", fontWeight: 400 }}>
                Autonomous & Human-in-the-Loop Prescription<br />
                Refill Triage Platform.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "40px" }}>
              <div>
                <p style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>PRODUCT</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[{ href: "/dashboard", label: "Queue Worklist" }, { href: "/classify", label: "AI Classifier" }, { href: "/workflow", label: "Workflow Matrix" }].map(l => (
                    <Link key={l.label} href={l.href} style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", textDecoration: "none" }}>{l.label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>GOVERNANCE</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[{ href: "/security", label: "Security & Trust" }, { href: "/security", label: "HIPAA Aligned" }, { href: "/security", label: "Zero-PII Pipeline" }].map((l, i) => (
                    <Link key={i} href={l.href} style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", textDecoration: "none" }}>{l.label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>STRATEGY</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[{ href: "/gtm", label: "GTM Funnel" }, { href: "/gtm", label: "Commercial Model" }, { href: "/gtm", label: "Buyer vs. User" }].map((l, i) => (
                    <Link key={i} href={l.href} style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", textDecoration: "none" }}>{l.label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1, width: "100%", textAlign: "center", padding: "10px 24px 28px", userSelect: "none", pointerEvents: "none" }}>
            <span style={{ display: "inline-block", fontSize: "clamp(64px, 12vw, 155px)", fontWeight: 800, letterSpacing: "-0.04em", color: "rgba(255, 255, 255, 0.085)", lineHeight: 0.95, fontFamily: '"Google Sans","Sora","Inter",sans-serif', whiteSpace: "nowrap" }}>
              UnStuck Med
            </span>
          </div>

          <div style={{ position: "relative", zIndex: 2, borderTop: "1px solid rgba(255,255,255,0.06)", maxWidth: "1240px", width: "100%", margin: "0 auto", padding: "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", fontFamily: "monospace" }}>© 2026 UnStuck Med</span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)", fontFamily: "monospace" }}>Polymath Innovae × Eonexea AI Hackathon</span>
          </div>
        </footer>
      </div>
    </>
  );
}
