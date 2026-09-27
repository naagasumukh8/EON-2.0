"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Star, CheckCircle, Phone, Mail, MapPin,
  Clock, Zap, Users, FileText, AlertTriangle,
  ChevronRight, Activity, Bell, BarChart3,
  Check, Menu, X, Calendar, Shield
} from "lucide-react";

/* ─── SWAP: Brand ───────────────────────────────────────── */
const BRAND_NAME = "RefillOS";
const BRAND_TAG  = "Prescription Intelligence";

/* ─── SWAP: Nav links ───────────────────────────────────── */
const NAV_LINKS = ["Home", "For Pharmacies", "For Practices", "AI Features", "Contact"];

/* ─── SWAP: Hero floating cards ─────────────────────────── */
const HERO_CARDS = [
  { icon: "💊", iconBg: "#dcfce7", label: "Refill Queue",    value: "42",    sub: "Active refills today",    pos: "top-[18%] left-[4%]"   },
  { icon: "⚡", iconBg: "#dbeafe", label: "AI Classifier",   value: "3.2s",  sub: "Block detected",          pos: "top-[20%] right-[3%]"  },
  { icon: "🔔", iconBg: "#fef3c7", label: "Provider Alert",  value: "Sent",  sub: "Dr. R. Kumar notified",   pos: "bottom-[28%] left-[3%]"},
  { icon: "✅", iconBg: "#f3e8ff", label: "Resolved Today",  value: "38",    sub: "< 4 hr avg",              pos: "bottom-[26%] right-[2%]"},
];

/* ─── SWAP: Block Failure Modes ─────────────────────────── */
const BLOCK_MODES = [
  { icon: "🔄", color: "#dcfce7", name: "No Refills Left",      desc: "Prescription has expired — new Rx needed",        tag: "34% of cases" },
  { icon: "📋", color: "#dbeafe", name: "Provider Approval",     desc: "Explicit approval required before dispensing",    tag: "22% of cases" },
  { icon: "🏥", color: "#fef3c7", name: "Visit Required",        desc: "Patient must see provider before refill",         tag: "17% of cases" },
  { icon: "❓", color: "#fee2e2", name: "Missing Information",   desc: "Incomplete or unclear Rx / patient data",         tag: "13% of cases" },
  { icon: "👁️",  color: "#f3e8ff", name: "Condition Review",     desc: "Provider must review current patient status",     tag: "9% of cases"  },
  { icon: "🛡️", color: "#ccfbf1", name: "Insurance Block",       desc: "PBM / prior auth requirement blocking fulfillment", tag: "5% of cases" },
];

/* ─── SWAP: Staff personas ──────────────────────────────── */
const STAFF = [
  { name: "Sarah M.",     role: "Practice Manager", specialty: "Manages 3–15 provider practice", rating: 4.9, reviews: "2.1k practices", pain: "Drowning in refill phone calls",          tag: "Practice", tagStyle: "tag-green"  },
  { name: "Dr. R. Kumar", role: "Physician",         specialty: "Interrupted mid-care for refills", rating: 4.8, reviews: "8.4k providers", pain: "Needs refill context at a glance",     tag: "Provider", tagStyle: "tag-blue"   },
  { name: "S. Lee",       role: "Pharmacist",        specialty: "Patient at counter — Rx stuck",  rating: 4.9, reviews: "6.2k pharmacies", pain: "Fax queue blocking every fill",          tag: "Pharmacy", tagStyle: "tag-purple" },
  { name: "Tom L.",       role: "Medical Assistant", specialty: "Routes refill requests all day", rating: 4.7, reviews: "4.8k staff",      pain: "18 min per refill manually",             tag: "Staff",    tagStyle: "tag-amber"  },
];

/* ─── SWAP: Dashboard features ──────────────────────────── */
const FEATURES = [
  { icon: "🔍", title: "AI Block Classifier",    desc: "Detects why a refill is stuck in under 4 seconds"                },
  { icon: "🗺️", title: "Smart Action Router",    desc: "Assigns next-action owner with full context attached"            },
  { icon: "📲", title: "Patient Status Updates", desc: "Automated SMS / portal status — no phone tag"                   },
  { icon: "📊", title: "Digital Audit Trail",    desc: "Every state transition logged, HIPAA-ready"                     },
];

/* ─── SWAP: Mock queue rows ─────────────────────────────── */
const MOCK_QUEUE = [
  { initials: "MR", name: "M. Rivera",   med: "Metformin 500mg",  status: "No refills",    priority: "HIGH", blocked: true  },
  { initials: "JT", name: "J. Thompson", med: "Lisinopril 10mg",  status: "Auth req.",      priority: "HIGH", blocked: true  },
  { initials: "AP", name: "A. Patel",    med: "Sertraline 50mg",  status: "Visit needed",  priority: "MED",  blocked: true  },
  { initials: "RJ", name: "R. Johnson",  med: "Atorvastatin",     status: "In Progress",   priority: "LOW",  blocked: false },
];

/* ─── SWAP: Stats ───────────────────────────────────────── */
const STATS = [
  { value: "98k+",  label: "Refills resolved"     },
  { value: "2.5k+", label: "Practices onboarded"  },
  { value: "< 4hr", label: "Avg resolution time"  },
  { value: "98%",   label: "Same-day resolution"   },
];

/* ─── SWAP: AI cards ────────────────────────────────────── */
const AI_CARDS = [
  { title: "Block Classifier",    desc: "Reads fax/EHR text and classifies the block in seconds.", icon: "🧠", bg: "#f0fdf4", border: "#bbf7d0" },
  { title: "Medical Continuity",  desc: "Predicts refill gaps 72hrs ahead for chronic patients.",   icon: "💡", bg: "#eff6ff", border: "#bfdbfe" },
  { title: "Action Recommender",  desc: "Suggests exact next action — draft auth, call, escalate.",icon: "⚙️", bg: "#fdf4ff", border: "#e9d5ff" },
  { title: "Human Guardrails",    desc: "Clinical decisions always with authorized providers.",      icon: "🛡️", bg: "#fff7ed", border: "#fed7aa" },
];

/* ─── Stars ──────────────────────────────────────────────── */
function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < Math.floor(n) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
      ))}
    </span>
  );
}

function LiveDot() {
  return <span className="live-dot" />;
}

/* ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0f172a]">

      {/* ══ NAVBAR ══════════════════════════════════════════════ */}
      <nav className="navbar" style={{ boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none" }}>
        <div className="max-w-screen-xl flex items-center justify-between py-3.5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl text-white font-black text-sm"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
              Rx
            </div>
            <div>
              <span className="font-black text-[15px] tracking-tight text-[#0f172a]">{BRAND_NAME}</span>
              <div className="text-[10px] text-[#22c55e] font-semibold leading-none tracking-wide uppercase">{BRAND_TAG}</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#" className="nav-link active">Home</a>
            <Link href="/workflow" className="nav-link">Workflow</Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/classify" className="nav-link">AI Classifier</Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748b] bg-[#f0fdf4] rounded-full px-3 py-1.5 border border-[#bbf7d0]">
              <LiveDot /> <span className="font-medium">Live System</span>
            </div>
            <Link href="/classify" className="btn-green text-sm hidden sm:flex">
              Try AI Demo <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="md:hidden p-2 rounded-lg text-[#64748b]" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#e2e8f0] py-4 px-6 space-y-1">
            {NAV_LINKS.map(link => (
              <a key={link} href="#" className="block py-2 text-sm font-medium text-[#334155] hover:text-[#22c55e]">{link}</a>
            ))}
            <button className="btn-green w-full mt-3 justify-center">Request Demo</button>
          </div>
        )}
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="hero-section">
        {/* Background circles */}
        <div className="hero-bg-circle w-[600px] h-[600px] bg-[#22c55e]/5 -top-48 -left-48" />
        <div className="hero-bg-circle w-[400px] h-[400px] bg-[#06b6d4]/8 bottom-0 right-0" />

        <div className="max-w-screen-xl w-full relative py-10 sm:py-16">
          {/* Huge outline text LEFT */}
          <div className="hero-title-outline left-[-2%] top-[50%] -translate-y-1/2 pointer-events-none">REFILL</div>
          {/* Huge outline text RIGHT */}
          <div className="hero-title-outline right-[-2%] top-[50%] -translate-y-1/2 pointer-events-none">OS</div>

          <div className="flex flex-col items-center text-center px-4 relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm border border-[#e2e8f0] mb-6 text-xs font-semibold text-[#64748b]">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              B2B Healthcare Infrastructure · AI-Powered
            </div>

            {/* Hero image + floating cards */}
            <div className="relative w-[280px] sm:w-[340px] md:w-[400px] h-[360px] sm:h-[420px] md:h-[500px]">
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80">
                <Image
                  src="/images/hero.jpg"
                  alt="Pharmacist and physician collaborating on prescription refills"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* Floating cards */}
              {HERO_CARDS.map((card, i) => (
                <div key={i} className={`float-card z-20 ${card.pos}`}>
                  <div className="float-card__icon" style={{ background: card.iconBg }}>{card.icon}</div>
                  <div className="float-card__label">{card.label}</div>
                  <div className="float-card__value">{card.value}</div>
                  <div className="float-card__sub">{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Headline + CTA */}
            <div className="mt-8 max-w-xl">
              <h1 className="font-black text-3xl sm:text-4xl text-[#0f172a] leading-tight mb-3"
                style={{ fontFamily: "Poppins, sans-serif" }}>
                Find the block. Route the fix.{" "}
                <span style={{ color: "#22c55e" }}>Fill the script.</span>
              </h1>
              <p className="text-[#64748b] text-sm sm:text-base leading-relaxed mb-6">
                When a prescription refill needs provider intervention, it fragments across phone calls,
                faxes and EHR inboxes. RefillOS knows exactly why it&apos;s stuck — and what to do next.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button className="btn-green px-6 py-3">
                  Book a Demo <ArrowRight className="h-4 w-4" />
                </button>
                <button className="btn-outline px-6 py-3">See How It Works</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MISSION STATEMENT ══════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl text-center px-4">
          <p className="text-[#0f172a] text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed max-w-4xl mx-auto"
            style={{ fontFamily: "Poppins,sans-serif" }}>
            At <span style={{ color: "#22c55e" }}>RefillOS</span>, we believe that medication continuity{" "}
            <em>shouldn&apos;t</em> depend on who answers the phone first 💊 — it&apos;s about closing{" "}
            <span style={{ color: "#22c55e" }}>🔁</span> the hand-off gap with intelligence, visibility, and care.
            We&apos;re dedicated to resolving every stalled refill through{" "}
            <em>AI judgment and human oversight</em>.
          </p>
          <button className="btn-outline mt-10 mx-auto">
            Learn More <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════ */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-screen-xl px-4">
          <div className="text-center mb-12">
            <div className="section-eyebrow">Workflow</div>
            <h2 className="section-title">Your Journey to a <span>Resolved Refill</span></h2>
            <p className="section-subtitle mx-auto mt-3 text-center">
              We handle the hand-offs so every refill reaches its destination.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: "01", icon: "📤", label: "Submitted",     color: "#dbeafe" },
              { step: "02", icon: "🔍", label: "AI Classifies", color: "#f3e8ff" },
              { step: "03", icon: "🚫", label: "Block Found",   color: "#fee2e2" },
              { step: "04", icon: "⚡", label: "Action Routed", color: "#fef3c7" },
              { step: "05", icon: "✅", label: "Resolved",      color: "#dcfce7" },
              { step: "06", icon: "💊", label: "Script Filled", color: "#ccfbf1" },
            ].map((s, i) => (
              <div key={i} className="specialty-card group relative">
                <div className="specialty-card__icon group-hover:scale-110 transition-transform" style={{ background: s.color }}>
                  {s.icon}
                </div>
                <div className="text-[10px] font-mono text-[#94a3b8] mb-1">{s.step}</div>
                <div className="specialty-card__name">{s.label}</div>
                {i < 5 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#22c55e] font-bold z-10">›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BLOCK FAILURE MODES ════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-screen-xl px-4">
          <div className="text-center mb-10">
            <div className="section-eyebrow">AI Classifier</div>
            <h2 className="section-title">Leads To <span>Know Everything</span> You Need</h2>
            <p className="section-subtitle mx-auto mt-3 text-center">
              6 failure modes — AI detects the block reason from fax or EHR text in seconds.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BLOCK_MODES.map((m, i) => (
              <div key={i} className="specialty-card text-left">
                <div className="flex items-start gap-3 mb-3">
                  <div className="specialty-card__icon !m-0 flex-shrink-0" style={{ background: m.color }}>{m.icon}</div>
                  <div>
                    <div className="specialty-card__name text-left">{m.name}</div>
                    <span className="tag tag-gray text-[10px] mt-1">{m.tag}</span>
                  </div>
                </div>
                <p className="specialty-card__desc text-left">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS + FEATURE HIGHLIGHT ══════════════════════════ */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-screen-xl px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: Image + award */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white h-[420px] relative">
                <Image src="/images/hero.jpg" alt="Healthcare collaboration" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3 border border-[#e2e8f0]">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">🏆</div>
                <div>
                  <div className="font-bold text-sm text-[#0f172a]">Top Rated</div>
                  <div className="text-xs text-[#64748b]">Refill Platform 2026</div>
                </div>
              </div>
            </div>

            {/* Right: Stats */}
            <div>
              <div className="section-eyebrow">Award-Winning Intelligence</div>
              <h2 className="section-title mb-4">
                Trusted by <span>Practices &amp; Pharmacies</span> Nationwide
              </h2>
              <p className="section-subtitle mb-8">
                RefillOS cuts average refill resolution time from 3–7 days to under 4 hours — for 80% of
                non-visit-required cases.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {STATS.map((s, i) => (
                  <div key={i} className="card-white p-5">
                    <div className="text-2xl font-black text-[#22c55e]" style={{ fontFamily: "Poppins" }}>{s.value}</div>
                    <div className="text-xs text-[#64748b] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button className="btn-green-sm">See Results</button>
                <button className="btn-outline-sm">Read Case Study →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STAFF PERSONAS ═════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-screen-xl px-4">
          <div className="text-center mb-10">
            <div className="section-eyebrow">Built For</div>
            <h2 className="section-title">
              Top Roles <span>Dedicated to</span> Your Refill Health
            </h2>
            <p className="section-subtitle mx-auto mt-3 text-center">
              Skilled professionals using RefillOS to eliminate the daily refill grind.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STAFF.map((s, i) => (
              <div key={i} className="staff-card">
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#f0fdf4] to-[#e0f2fe]">
                  <Image
                    src="/images/staff.jpg"
                    alt={s.name}
                    fill
                    className="object-cover"
                    style={{ objectPosition: `${i * 25}% top` }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`tag ${s.tagStyle}`}>{s.tag}</span>
                  </div>
                </div>
                <div className="staff-card__body">
                  <div className="staff-card__name">{s.name}</div>
                  <div className="staff-card__role">{s.role}</div>
                  <div className="staff-card__stat">
                    <Stars n={s.rating} />
                    <span className="ml-1 text-[#0f172a] font-semibold">{s.rating}</span>
                    <span className="text-[#94a3b8]">({s.reviews})</span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-2 italic">&quot;{s.pain}&quot;</p>
                  <div className="flex gap-2 mt-4">
                    <button className="btn-outline-sm flex-1 justify-center">View Details</button>
                    <button className="btn-green-sm flex-1 justify-center">Book Demo</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DASHBOARD MOCKUP ═══════════════════════════════════ */}
      <section className="app-section py-16">
        <div className="max-w-screen-xl px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: mockup */}
            <div className="dashboard-mockup">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#f1f5f9] bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs"
                    style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>Rx</div>
                  <span className="font-bold text-sm text-[#0f172a]">RefillOS</span>
                  <span className="tag tag-green text-[9px]">LIVE</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                  <LiveDot /> <span>42 active</span>
                </div>
              </div>
              <div className="p-3 bg-white">
                <div className="flex items-center justify-between px-2 py-2 mb-2">
                  <span className="text-xs font-bold text-[#0f172a]">Live Refill Queue</span>
                  <span className="text-xs text-[#22c55e] font-medium">Sorted by priority</span>
                </div>
                {MOCK_QUEUE.map((row, i) => (
                  <div key={i} className="queue-row">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${row.blocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                      {row.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0f172a] truncate">{row.name}</p>
                      <p className="text-[11px] text-[#94a3b8] truncate">{row.med}</p>
                    </div>
                    <span className={`tag text-[10px] ${row.blocked ? "tag-red" : "tag-green"}`}>{row.status}</span>
                    <span className={`tag text-[9px] ${row.priority === "HIGH" ? "tag-red" : row.priority === "MED" ? "tag-amber" : "tag-green"}`}>{row.priority}</span>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2 mt-3 px-2">
                  {[
                    { label: "Blocked",     val: "31", color: "text-red-500"   },
                    { label: "In Progress", val: "8",  color: "text-amber-500" },
                    { label: "Resolved",    val: "38", color: "text-green-600" },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#f8fafc] rounded-xl p-3 text-center">
                      <div className={`font-black text-lg ${s.color}`} style={{ fontFamily: "Poppins" }}>{s.val}</div>
                      <div className="text-[10px] text-[#94a3b8]">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: features */}
            <div>
              <div className="section-eyebrow">Key Features</div>
              <h2 className="section-title mb-2">
                Key Features That Make <span>Our Platform</span> Stand Out
              </h2>
              <p className="section-subtitle mb-8">
                Skilled professionals using RefillOS resolve refills 5× faster with complete visibility.
              </p>
              <div className="space-y-1">
                {FEATURES.map((f, i) => (
                  <div key={i} className="feature-check-item">
                    <div className="feature-check-icon">{f.icon}</div>
                    <div>
                      <div className="font-semibold text-sm text-[#0f172a]">{f.title}</div>
                      <div className="text-xs text-[#64748b] mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-green mt-8">
                Download Case Study <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ AI FEATURE CARDS ═══════════════════════════════════ */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-screen-xl px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="section-eyebrow">AI Intelligence</div>
              <h2 className="section-title">Plus AI-Powered <span>Refill Intelligence</span></h2>
            </div>
            <button className="btn-outline-sm hidden md:flex">View All →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_CARDS.map((c, i) => (
              <div key={i} className="card-white p-6 cursor-pointer group"
                style={{ borderColor: c.border, background: `linear-gradient(145deg, ${c.bg}, #ffffff)` }}>
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">{c.icon}</div>
                <h3 className="font-bold text-[#0f172a] text-sm mb-2">{c.title}</h3>
                <p className="text-xs text-[#64748b] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUSTED BY ═════════════════════════════════════════ */}
      <section className="py-10 bg-[#f8fafc] border-y border-[#e2e8f0]">
        <div className="max-w-screen-xl px-4">
          <p className="text-center text-xs text-[#94a3b8] font-semibold uppercase tracking-wider mb-6">
            Plus 2,500 medical practices all over the country
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {["CareFirst Medical Group", "Summit Pharmacy Partners", "Valley Health Systems",
              "RxBridge Network", "ClearPath Clinics", "MedReach Practices"].map((org, i) => (
              <div key={i} className="px-5 py-2.5 bg-white rounded-xl border border-[#e2e8f0] shadow-sm text-xs font-semibold text-[#334155] whitespace-nowrap hover:border-[#22c55e] hover:text-[#22c55e] transition-all cursor-pointer">
                {org}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════ */}
      <footer className="footer-dark">
        <div className="max-w-screen-xl px-4 pt-16 pb-12">
          <div className="text-center mb-12">
            <div className="footer-title mb-4">Contact US</div>
            <p className="text-[#94a3b8] max-w-lg mx-auto text-sm">
              Ready to close the prescription refill gap? Talk to our team.
            </p>
            <button className="btn-green mt-6 mx-auto">
              Get in Touch <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="divider-light opacity-10 mb-12" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs"
                  style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>Rx</div>
                <span className="font-black text-white">{BRAND_NAME}</span>
              </div>
              <p className="text-[#64748b] text-xs leading-relaxed">
                AI-powered prescription refill intelligence for pharmacies and physician practices.
              </p>
              <div className="flex gap-3 mt-4">
                {["Twitter", "LinkedIn", "GitHub"].map(s => (
                  <a key={s} href="#" className="text-[#64748b] hover:text-[#22c55e] text-xs transition-colors">{s}</a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              {["Refill Queue", "AI Classifier", "Action Router", "Audit Trail", "Security"].map(l => (
                <a key={l} href="#" className="footer-link">{l}</a>
              ))}
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
              {["About Us", "Careers", "Blog", "Press", "Partners"].map(l => (
                <a key={l} href="#" className="footer-link">{l}</a>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
              <div className="space-y-3">
                {[
                  { Icon: Mail,   text: "hello@refillos.com"  },
                  { Icon: Phone,  text: "+1 (800) RX-REFIL"   },
                  { Icon: MapPin, text: "San Francisco, CA"    },
                ].map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#64748b]">
                    <Icon className="h-3.5 w-3.5 text-[#22c55e] flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <button className="btn-green-sm mt-5">Book a Demo</button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-5 px-4">
          <div className="max-w-screen-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569]">
            <span>© 2026 RefillOS · Polymath Innovae × Eonexea AI Hackathon</span>
            <div className="flex gap-4">
              {["Privacy Policy", "Terms of Service", "HIPAA Compliance"].map(l => (
                <a key={l} href="#" className="hover:text-[#22c55e] transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
