"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Clock, CheckCircle, AlertTriangle, Zap,
  Shield, Activity, Users, BarChart3, ChevronRight,
  Lock, Eye, FileText
} from "lucide-react";

/* ── Shared Nav ───────────────────────────────────────── */
function Nav({ active }: { active?: string }) {
  const links = [
    { href: "/",          label: "Home"         },
    { href: "/workflow",  label: "Workflow"      },
    { href: "/dashboard", label: "Queue"         },
    { href: "/classify",  label: "Classifier"    },
    { href: "/security",  label: "Security"      },
  ];
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
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`top-nav__link ${active === l.href ? "top-nav__link--active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="top-nav__right">
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Open Queue <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Count-up hook ────────────────────────────────────── */
function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return { value, ref };
}

/* ── Data ─────────────────────────────────────────────── */
const BLOCK_TYPES = [
  { label: "No Refills Remaining",  share: "34%", actor: "Provider",      color: "warn"   },
  { label: "Insurance / PBM Block", share: "22%", actor: "Practice Staff", color: "warn"   },
  { label: "Visit Required",        share: "17%", actor: "Patient",        color: "accent" },
  { label: "Missing Information",   share: "13%", actor: "Practice Staff", color: "warn"   },
  { label: "Condition Review",      share: "9%",  actor: "Provider",       color: "accent" },
  { label: "Admin / Compliance",    share: "5%",  actor: "Staff",          color: "neutral" },
];

const PRINCIPLES = [
  { icon: Shield,   label: "HIPAA-aligned architecture" },
  { icon: Lock,     label: "Row-level security by org"  },
  { icon: Eye,      label: "PII stripped before AI"     },
  { icon: FileText, label: "Insert-only audit trail"    },
];

/* ═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const hours = useCountUp(1847);
  const refills = useCountUp(573);
  const mins = useCountUp(192);

  return (
    <div className="page-frame">
      <Nav active="/" />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="hero-grid-bg border-b border-ink-100">
        <div className="container py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded bg-accent-50 border border-accent-100">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-600 animate-pulse" />
              <span className="text-xs font-semibold text-accent-700 font-mono tracking-wide">TRACK: CLINICAL & HEALTHTECH</span>
            </div>

            <h1 className="hero-display mb-5">
              Prescription refills.<br />
              <span>Unstuck in minutes.</span>
            </h1>

            <p className="text-base text-ink-400 max-w-xl leading-relaxed mb-8">
              When a refill needs provider intervention, it fragments across phone calls, faxes and EHR inboxes.
              UnStuck Med classifies the block — automatically routes the right action to the right person.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/classify" className="btn btn-primary btn-lg">
                Try AI Classifier <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="btn btn-secondary btn-lg">
                Open Live Queue
              </Link>
              <Link href="/workflow" className="btn btn-ghost btn-lg">
                See Workflow
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ROW ────────────────────────────────────── */}
      <section className="border-b border-ink-100 bg-white">
        <div className="container">
          <div className="grid grid-cols-3 divide-x divide-ink-100">
            {[
              { ref: hours.ref,  value: hours.value,  unit: " hrs",  label: "Staff hours saved this session",           sub: "Est. at 3.2 hr avg per manual resolution" },
              { ref: refills.ref, value: refills.value, unit: "",    label: "Refills resolved without phone tag",       sub: "In the current demo session" },
              { ref: mins.ref,   value: mins.value,   unit: " min",  label: "Average manual resolution time",           sub: "Industry baseline — what we're replacing" },
            ].map((s, i) => (
              <div key={i} ref={s.ref} className="py-8 px-8">
                <div className="counter-display">{s.value.toLocaleString()}{s.unit}</div>
                <div className="text-sm font-medium text-ink-900 mt-2">{s.label}</div>
                <div className="text-xs text-ink-400 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ──────────────────────────────────────── */}
      <section className="section bg-ink-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="section-label">The Problem</div>
              <h2 className="section-title mb-4">
                A refill can stall the moment provider intervention is required
              </h2>
              <p className="text-sm text-ink-400 leading-relaxed mb-6">
                The result: Patient → Pharmacy → Provider → Practice Staff → Patient → Provider → Pharmacy —
                across phone calls, faxes, and EHR inbox messages. Average resolution: <strong className="text-ink-900">3.2 days</strong>.
                Most of that time is waiting for the right person to see the right message.
              </p>
              <div className="space-y-2">
                {["No refills remain — new Rx required", "Prior auth blocking the fill", "Provider requires a visit before approving",
                  "Missing or incorrect patient information", "Clinical condition review needed"].map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-ink-400">
                    <AlertTriangle className="h-3.5 w-3.5 text-warn-600 mt-0.5 flex-shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="section-label">6 Block Types — AI Identifies Which</div>
              <div className="card overflow-hidden">
                {BLOCK_TYPES.map((b, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 text-sm ${i < BLOCK_TYPES.length - 1 ? "border-b border-ink-100" : ""}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-ink-400 w-7">{b.share}</span>
                      <span className="text-ink-900 font-medium">{b.label}</span>
                    </div>
                    <span className="text-xs text-ink-400 font-medium">{b.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="section bg-white border-t border-ink-100">
        <div className="container">
          <div className="text-center mb-12">
            <div className="section-label">How It Works</div>
            <h2 className="section-title">Three steps. No phone calls.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { n: "01", Icon: Zap,         title: "Classify",  desc: "AI reads the fax note, EHR message, or staff input and names the exact block reason in under 4 seconds." },
              { n: "02", Icon: Activity,    title: "Route",     desc: "The right action is assigned to the right actor — provider, staff, pharmacist, or patient — with full context attached." },
              { n: "03", Icon: CheckCircle, title: "Resolve",   desc: "Action confirmed (or auto-executed in Autonomous mode for low-risk actions). Audit trail logged. Patient notified generically." },
            ].map((s, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-xs text-ink-400">{s.n}</span>
                  <s.Icon className="h-4 w-4 text-accent-600" />
                </div>
                <h3 className="text-xl font-semibold font-display text-ink-900 mb-2">{s.title}</h3>
                <p className="text-sm text-ink-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY STRIP ───────────────────────────────── */}
      <section className="section--sm bg-ink-900">
        <div className="container">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-ink-200">HIPAA-aligned architecture</p>
              <p className="text-xs text-ink-400 mt-0.5">Hackathon prototype — not a certified compliance claim. See Security page.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {PRINCIPLES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-ink-400">
                  <Icon className="h-3.5 w-3.5 text-ok-600" />
                  {label}
                </div>
              ))}
            </div>
            <Link href="/security" className="btn btn-ghost text-ink-400 hover:text-ink-200 btn-sm">
              Security & Trust <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-ink-100 bg-white py-6">
        <div className="container flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-ink-900 rounded flex items-center justify-center">
              <span className="font-mono text-white text-[9px] font-bold">Rx</span>
            </div>
            <span className="text-xs font-semibold text-ink-900">UnStuck Med</span>
            <span className="text-xs text-ink-400">· Polymath Innovae × Eonexea AI Hackathon 2026</span>
          </div>
          <div className="flex gap-4">
            {["/workflow", "/dashboard", "/classify", "/security"].map(href => (
              <Link key={href} href={href} className="text-xs text-ink-400 hover:text-ink-900 transition-colors capitalize">
                {href.replace("/", "")}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
