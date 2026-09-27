"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronUp, Layers, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

/* ── Minimal Nav ─────────────────────────────────────── */
function Nav() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid #F0F2F4",
      height: 54, display: "flex", alignItems: "center",
    }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "#0D1117", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "monospace", color: "#fff", fontSize: 10, fontWeight: 800 }}>Rx</span>
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: "#0D1117", letterSpacing: "-0.02em" }}>
            UnStuck Med
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[
            { href: "/dashboard", label: "Queue" },
            { href: "/classify",  label: "Classifier" },
            { href: "/security",  label: "Security & Trust" },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              fontSize: 13, fontWeight: 500, color: "#4B5563",
              padding: "6px 12px", borderRadius: 6, textDecoration: "none",
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        <Link href="/dashboard" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "#0D1117", color: "#fff", fontSize: 13, fontWeight: 600,
          padding: "7px 16px", borderRadius: 9999, textDecoration: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        }}>
          Open Queue <ArrowRight style={{ width: 13, height: 13 }} />
        </Link>
      </div>
    </nav>
  );
}

/* ── Antigravity-discipline single visual element: Cursor-responsive gradient mesh ── */
function SubtleMesh() {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--mx", `${x}%`);
    ref.current.style.setProperty("--my", `${y}%`);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div ref={ref} style={{
      position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      "--mx": "50%", "--my": "40%",
    } as React.CSSProperties}>
      {/* Soft interactive radial glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle 500px at var(--mx) var(--my), rgba(37, 99, 235, 0.05) 0%, transparent 80%)`,
        transition: "background 0.25s ease-out",
      }} />
      {/* Subtle fine geometric grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(#CBD5E1 0.75px, transparent 0.75px)",
        backgroundSize: "32px 32px",
        opacity: 0.45,
      }} />
    </div>
  );
}

/* ── Live Single Stat Counter ─────────────────────────── */
function SingleStatCountUp({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
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
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>;
}

/* ── Opal-Discipline Scroll Narrative Step ────────────── */
function NarrativeStep({
  stepNumber,
  headline,
  description,
  actorTag,
  isLast,
}: {
  stepNumber: string;
  headline: string;
  description: string;
  actorTag: string;
  isLast?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(true);
      },
      { threshold: 0.35 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: "grid", gridTemplateColumns: "54px 1fr", gap: "0 28px",
        paddingBottom: isLast ? 0 : 56,
        opacity: active ? 1 : 0.25,
        transform: active ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: active ? "#0D1117" : "#F3F4F6",
          color: active ? "#FFFFFF" : "#9CA3AF",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "monospace", fontSize: 13, fontWeight: 700,
          transition: "all 0.4s ease",
          boxShadow: active ? "0 2px 8px rgba(13,17,23,0.25)" : "none",
        }}>
          {stepNumber}
        </div>
        {!isLast && (
          <div style={{
            width: 1.5, flex: 1, marginTop: 12,
            background: active ? "#CBD5E1" : "#E5E7EB",
            transition: "background 0.5s ease",
          }} />
        )}
      </div>

      <div style={{ paddingTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <h3 style={{
            fontFamily: "'Sora', sans-serif", fontSize: 21, fontWeight: 700,
            color: "#0D1117", letterSpacing: "-0.02em", margin: 0,
          }}>
            {headline}
          </h3>
          <span style={{
            fontFamily: "monospace", fontSize: 10, fontWeight: 700,
            padding: "2px 8px", borderRadius: 4,
            background: "#F3F4F6", color: "#4B5563",
          }}>
            {actorTag}
          </span>
        </div>
        <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, margin: 0, maxWidth: 540 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function HomePage() {
  const [showWorkflow, setShowWorkflow] = useState(false);

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh", color: "#0D1117" }}>
      <Nav />

      {/* ── HERO SECTION (Antigravity discipline) ─────────── */}
      <section style={{
        position: "relative", minHeight: "86vh", display: "flex",
        alignItems: "center", overflow: "hidden",
      }}>
        <SubtleMesh />

        <div style={{
          position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto",
          padding: "100px 24px 80px", width: "100%",
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB" }} />
            <span style={{
              fontFamily: "monospace", fontSize: 11.5, fontWeight: 700,
              color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              Prescription Refill Intelligence · 60-Min Protocol
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(2.9rem, 6.2vw, 5.2rem)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            color: "#0D1117",
            maxWidth: 820,
            marginBottom: 28,
          }}>
            Prescription refills.<br />
            <span style={{ color: "#2563EB" }}>Unstuck in minutes.</span>
          </h1>

          <p style={{
            fontSize: 18, color: "#6B7280", lineHeight: 1.65,
            maxWidth: 560, marginBottom: 42,
          }}>
            When a refill needs provider intervention, it stalls across fax trays, EHR inboxes, and phone tag.
            UnStuck Med classifies the block and routes the fix — with verified human-in-the-loop safety.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#0D1117", color: "#fff", fontSize: 14, fontWeight: 600,
              padding: "12px 24px", borderRadius: 9999, textDecoration: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
            }}>
              Open Refill Queue <ArrowRight style={{ width: 15, height: 15 }} />
            </Link>

            <Link href="/classify" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#FFFFFF", color: "#0D1117", fontSize: 14, fontWeight: 600,
              padding: "12px 24px", borderRadius: 9999, textDecoration: "none",
              border: "1px solid #E5E7EB",
            }}>
              Try AI Classifier
            </Link>
          </div>
        </div>
      </section>

      {/* ── ONE LIVE STAT HIGHLIGHT (Cut density to 1 metric) ── */}
      <section style={{ borderTop: "1px solid #F0F2F4", borderBottom: "1px solid #F0F2F4", background: "#FAFAFA" }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "48px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 36,
        }}>
          <div>
            <div style={{
              fontFamily: "'Sora', sans-serif", fontSize: "clamp(3rem, 5vw, 4.2rem)",
              fontWeight: 800, color: "#15803D", lineHeight: 1, letterSpacing: "-0.04em",
            }}>
              <SingleStatCountUp target={192} /> min
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0D1117", marginTop: 8 }}>
              Average manual resolution time per blocked prescription
            </div>
            <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 2 }}>
              Industry benchmark for phone/fax coordination · What UnStuck Med condenses into minutes
            </div>
          </div>

          <div style={{ maxWidth: 440, fontSize: 14.5, color: "#6B7280", lineHeight: 1.7 }}>
            Over 80% of delay is dead time — waiting for the right clinician to see the right alert.
            By classifying root cause at the point of failure, we eliminate the administrative wait state.
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: Step-by-Step Scroll Narrative (Opal discipline) ── */}
      <section style={{ maxWidth: 1160, margin: "0 auto", padding: "96px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 72, alignItems: "start" }}>
          {/* Sticky narrative headline */}
          <div style={{ position: "sticky", top: 88 }}>
            <div style={{
              fontFamily: "monospace", fontSize: 11, fontWeight: 700,
              color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12,
            }}>
              How It Works
            </div>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 800,
              color: "#0D1117", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 16,
            }}>
              One workflow.<br />
              Zero phone tag.
            </h2>
            <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 28 }}>
              Each step advances the refill without administrative friction, keeping clinical decisions strictly in human hands.
            </p>

            {/* Collapsed Workflow section toggle */}
            <button
              onClick={() => setShowWorkflow(!showWorkflow)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#F3F4F6", border: "1px solid #E5E7EB", color: "#1F2937",
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Layers style={{ width: 14, height: 14, color: "#2563EB" }} />
              {showWorkflow ? "Hide full handoff table" : "See the full workflow table"}
              {showWorkflow ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
            </button>
          </div>

          {/* Sequential scroll narrative */}
          <div>
            <NarrativeStep
              stepNumber="01"
              headline="Classify the root block"
              actorTag="AI Engine · <4s"
              description="Staff or pharmacy logs the stall. The classifier de-identifies PII and deterministically detects the exact cause: zero refills remaining, prior authorization, missing demographic data, or pharmacy stock shortage."
            />
            <NarrativeStep
              stepNumber="02"
              headline="Assemble the exact action"
              actorTag="Cross-Org Triage"
              description="The system pre-fills the required resolution: drafting a new eRx renewal to the attending physician, appealing an insurance step-therapy exclusion, or querying nearby partner pharmacy inventory."
            />
            <NarrativeStep
              stepNumber="03"
              headline="Enforce human-in-the-loop sign-off"
              actorTag="Autonomy Invariant"
              description="In Draft-Only mode, every action requires explicit human confirmation. In Autonomous mode, only whitelisted low-risk SMS alerts auto-execute — any therapy-affecting change strictly requires human sign-off."
              isLast
            />
          </div>
        </div>

        {/* ── EXPANDABLE: Full Provider / Pharmacy / PBM Workflow Table ── */}
        {showWorkflow && (
          <div style={{
            marginTop: 56, padding: 32, borderRadius: 16,
            background: "#F9FAFB", border: "1px solid #E5E7EB",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h4 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Cross-Organizational Actor Handoff Matrix
                </h4>
                <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>
                  How responsibility shifts between Provider, Pharmacy, and PBM during a stalled refill
                </p>
              </div>
              <Link href="/workflow" style={{ fontSize: 13, color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>
                Open dedicated workflow page →
              </Link>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid #E5E7EB", textAlign: "left" }}>
                    <th style={{ padding: "10px 12px", color: "#4B5563", fontWeight: 600 }}>Stage</th>
                    <th style={{ padding: "10px 12px", color: "#4B5563", fontWeight: 600 }}>Standard Stall Point</th>
                    <th style={{ padding: "10px 12px", color: "#4B5563", fontWeight: 600 }}>UnStuck Med Automated Handoff</th>
                    <th style={{ padding: "10px 12px", color: "#4B5563", fontWeight: 600 }}>Human Invariant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#111827" }}>No Refills Remaining</td>
                    <td style={{ padding: "12px", color: "#6B7280" }}>Pharmacy faxes clinic; sits in inbox for days</td>
                    <td style={{ padding: "12px", color: "#2563EB", fontWeight: 500 }}>Pre-drafts renewal request with adherence history</td>
                    <td style={{ padding: "12px", color: "#111827" }}>Attending physician signs eRx</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#111827" }}>Insurance / Prior Auth</td>
                    <td style={{ padding: "12px", color: "#6B7280" }}>Claim rejected; patient surprised at counter</td>
                    <td style={{ padding: "12px", color: "#2563EB", fontWeight: 500 }}>Assembles formulary alternatives &amp; PA draft</td>
                    <td style={{ padding: "12px", color: "#111827" }}>Practice staff submits appeal</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#111827" }}>Pharmacy Stock Shortage</td>
                    <td style={{ padding: "12px", color: "#6B7280" }}>Patient calls 5 pharmacies to find medication</td>
                    <td style={{ padding: "12px", color: "#2563EB", fontWeight: 500 }}>AI queries partner inventory (Simulated)</td>
                    <td style={{ padding: "12px", color: "#111827" }}>Clinician clicks &apos;Request Transfer&apos;</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px", fontWeight: 600, color: "#111827" }}>Demographic Mismatch</td>
                    <td style={{ padding: "12px", color: "#6B7280" }}>Prescription rejected; sits in error bucket</td>
                    <td style={{ padding: "12px", color: "#2563EB", fontWeight: 500 }}>Auto-sends generic SMS for patient confirmation</td>
                    <td style={{ padding: "12px", color: "#111827" }}>Whitelisted in Autonomous mode</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ── CORE DESIGN PRINCIPLE: We deliberately do not suggest alternate providers ── */}
      <section style={{ borderTop: "1px solid #F0F2F4", background: "#FFFFFF", padding: "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#EFF6FF", border: "1px solid #DBEAFE", color: "#1E40AF",
            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 9999,
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16,
          }}>
            <ShieldCheck style={{ width: 13, height: 13 }} />
            Core Clinical Design Principle
          </div>

          <h3 style={{
            fontFamily: "'Sora', sans-serif", fontSize: "clamp(1.6rem, 3.5vw, 2.3rem)",
            fontWeight: 800, color: "#0D1117", letterSpacing: "-0.03em", lineHeight: 1.25, marginBottom: 18,
          }}>
            We deliberately do not suggest alternate providers.
          </h3>

          <p style={{ fontSize: 16, color: "#6B7280", lineHeight: 1.75, maxWidth: 640, margin: "0 auto 32px" }}>
            Clinical continuity stays with the assigned physician. Casually rerouting a patient to a different doctor simply to bypass an administrative refill bottleneck damages longitudinal care and violates our safety ethics.
            UnStuck Med moves the paperwork, not the patient relationship.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            <Link href="/security" style={{
              fontSize: 13, fontWeight: 600, color: "#2563EB", textDecoration: "none",
            }}>
              Read our full Security &amp; Trust safeguards →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #F0F2F4", padding: "32px 24px", background: "#FAFAFA" }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", display: "flex",
          alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 22, height: 22, background: "#0D1117", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "monospace", color: "#fff", fontSize: 9, fontWeight: 800 }}>Rx</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0D1117" }}>UnStuck Med</span>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>· Prescription Refill Intelligence Prototype</span>
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            {[
              { href: "/dashboard", label: "Queue" },
              { href: "/classify",  label: "Classifier" },
              { href: "/security",  label: "Security & Trust" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: 12.5, color: "#6B7280", textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
