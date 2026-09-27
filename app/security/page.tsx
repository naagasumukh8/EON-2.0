"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Eye, FileText, Users, Server, Key, AlertTriangle, CheckCircle } from "lucide-react";

function Nav() {
  return (
    <nav className="top-nav">
      <div className="top-nav__inner">
        <Link href="/" className="top-nav__logo">
          <span className="top-nav__wordmark">UnStuck Med</span>
        </Link>
        <div className="top-nav__links">
          {[
            { href: "/portal",    label: "Portals" },
            { href: "/dashboard", label: "Worklist" },
            { href: "/classify",  label: "Classifier" },
            { href: "/security",  label: "Security" },
            { href: "/workflow",  label: "Workflow" },
            { href: "/gtm",       label: "GTM / Funnel" },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`top-nav__link ${l.href === "/security" ? "top-nav__link--active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="top-nav__right">
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Open Worklist <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

const PILLARS = [
  { icon: Shield,      title: "Authentication & MFA",        sub: "Supabase Auth + TOTP enforcement per clinic org. 1-hr idle timeout." },
  { icon: Lock,        title: "Row-Level Security",           sub: "RLS on all tables. org_id matched to JWT. Insert-only on audit events." },
  { icon: Eye,         title: "Zero-PII Pipeline",            sub: "Names, DOBs stripped pre-classifier. Only med_class, block_type analyzed." },
  { icon: FileText,    title: "Immutable Audit Trail",        sub: "Append-only refill_events table. Every state transition stamped." },
  { icon: Users,       title: "Role-Based Access (RBAC)",     sub: "4 roles: staff, provider, pharmacist, admin. Strict clinical separation." },
  { icon: Server,      title: "Encryption at Rest & Transit", sub: "AES-256 at rest. TLS 1.3 in transit. Zero clinical data in localStorage." },
  { icon: Key,         title: "Patient Notification Privacy", sub: "SMS bodies never include medication name, dosage, or condition." },
  { icon: AlertTriangle, title: "Autonomy Guardrails",        sub: "Therapy-affecting actions always require human sign-off. No exceptions." },
];

export default function SecurityPage() {
  return (
    <div className="page-frame min-h-screen bg-[#F0F0F0]">
      <Nav />

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-400 mb-2">Security & Trust</p>
          <h1 className="text-3xl font-display font-extrabold text-ink-900 tracking-tight mb-2">
            What we built. What we claim. What we don&apos;t.
          </h1>
          <p className="text-sm text-ink-500 max-w-xl leading-relaxed">
            Healthcare interoperability requires radical honesty — implemented safeguards, alongside deliberate boundaries we refuse to cross.
          </p>
        </div>

        {/* Quick summary bar */}
        <div className="bg-ink-900 text-white rounded-2xl px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
            {[
              { icon: Lock,     label: "AES-256 At Rest" },
              { icon: Shield,   label: "TLS 1.3 In Transit" },
              { icon: FileText, label: "Insert-Only Audit Trail" },
              { icon: Eye,      label: "Pre-Triage PII Stripping" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8 Pillars — compact headline cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PILLARS.map(p => (
            <div key={p.title} className="bg-white border border-ink-200 rounded-xl px-5 py-4 flex items-start gap-4">
              <div className="w-8 h-8 bg-ink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <p.icon className="h-4 w-4 text-ink-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-ink-900">{p.title}</h3>
                  <span className="badge badge-resolved text-[9px] py-0"><CheckCircle className="h-2.5 w-2.5" /> Live</span>
                </div>
                <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{p.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Design principles — compact */}
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" /> Core Clinical Design Invariants
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-semibold text-ink-900 mb-1">We do not suggest alternate providers</p>
              <p className="text-xs text-ink-500 leading-relaxed">Clinical continuity stays with the assigned provider. We route paperwork, never the patient-physician relationship.</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-semibold text-ink-900 mb-1">Pharmacy transfers are drafts, not reroutes</p>
              <p className="text-xs text-ink-500 leading-relaxed">When a pharmacy has a stock outage, the system surfaces transfer options as a draft. A human must explicitly dispatch.</p>
            </div>
          </div>
        </div>

        {/* Prototype caveats — condensed */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed space-y-1">
            <p><strong>Prototype transparency:</strong> Built in a constrained hackathon window. Demonstrates compliance architecture; no formal SOC 2 or HIPAA audit has been conducted.</p>
            <p>All patient tokens, prescriptions, and pharmacy inventory shown are simulated test data.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-ink-100 pt-4 flex items-center justify-between">
          <p className="text-xs text-ink-400">Architecture verified for hackathon judging presentation.</p>
          <div className="flex gap-3">
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Open Queue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/" className="btn btn-secondary btn-sm">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
