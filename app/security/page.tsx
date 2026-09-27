"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Eye, FileText, Server, Key, Users, AlertTriangle, CheckCircle } from "lucide-react";

/* ── Nav (workflow removed from primary) ────────────────── */
function Nav() {
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
          {[
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

const MEASURES = [
  {
    icon: Shield,
    title: "Authentication & Session Governance",
    status: "Implemented",
    items: [
      "Supabase Auth with email/password authentication and MFA (TOTP) enforcement per clinic organization",
      "Session expiry: 1-hour idle timeout, 24-hour absolute maximum JWT duration",
      "Cryptographic refresh tokens rotated on each handshake; immediate invalidation on sign-out",
    ],
  },
  {
    icon: Lock,
    title: "Row-Level Security (RLS) Isolation",
    status: "Implemented",
    items: [
      "RLS policies on all tables containing patient or refill data: refill_requests, refill_events, profiles",
      "Tenant separation: org_id strictly matched to authenticated user JWT claim — zero cross-tenant query leaks",
      "Insert-only policy on refill_events: UPDATE and DELETE are prohibited at database engine level",
    ],
  },
  {
    icon: Eye,
    title: "Zero-PII Machine Learning Pipeline",
    status: "Implemented",
    items: [
      "Patient names, phone numbers, addresses, and dates of birth are stripped before classifier evaluation",
      "Only structured, de-identified parameters are analyzed: med_class, days_stuck, and block_type",
      "Each de-identification step is stamped as a PII_STRIPPED event in the append-only audit table",
    ],
  },
  {
    icon: FileText,
    title: "Immutable Append-Only Audit Trail",
    status: "Implemented",
    items: [
      "refill_events audit table is insert-only: prevents modification or deletion of past compliance actions",
      "Every state transition recorded: CLASSIFIED, ACTION_DRAFTED, ACTION_CONFIRMED, ACTION_SENT, RESOLVED",
      "Captures: actor_id, timestamp, event_type, active autonomy_mode, and sanitized payload",
    ],
  },
  {
    icon: Users,
    title: "Role-Based Access Control (RBAC)",
    status: "Implemented",
    items: [
      "Four segregated roles: staff, provider, pharmacist, admin stored in the profiles schema",
      "Practice staff: manage triage queue and communicate with patients; cannot edit clinical diagnoses",
      "Attending providers: review and authorize therapeutic changes and new eRx orders",
      "Pharmacists: manage dispensing status, stock verification, and transfer requests",
    ],
  },
  {
    icon: Server,
    title: "At-Rest and In-Transit Encryption",
    status: "Supabase-managed",
    items: [
      "Data at rest: AES-256 encryption managed via PostgreSQL underlying storage",
      "Data in transit: TLS 1.3 enforced on all API routes and database connections",
      "Zero sensitive clinical data cached in local storage or unencrypted client memory",
    ],
  },
  {
    icon: Key,
    title: "Patient Notification Content Privacy",
    status: "Enforced in code",
    items: [
      "Patient-facing SMS and email notifications refer to refills generically",
      "Message bodies NEVER include medication name, dosage, or medical condition",
      "Example: 'Your prescription refill requires attention. Please view your secure portal link.'",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Clinical Autonomy Guardrails",
    status: "Enforced in code",
    items: [
      "Autonomous mode only auto-executes whitelisted low-risk administrative actions (missing-info SMS, status alerts)",
      "Therapy-affecting decisions (new Rx, dosage change, prior auth justification) ALWAYS require human clinician confirmation",
      "Every auto-executed action is flagged with autonomy_mode = AUTONOMOUS in the immutable audit log",
    ],
  },
];

const PRINCIPLES = [
  {
    title: "We deliberately do not suggest alternate providers",
    body: "Clinical continuity stays with the assigned provider. Rerouting a patient to a different doctor simply to bypass an administrative refill bottleneck damages longitudinal care and violates our human-in-the-loop ethics. We route paperwork and suggest partner pharmacy inventory, but never route around the patient-physician relationship.",
  },
  {
    title: "Pharmacy alternative transfers are drafts, not automatic reroutes",
    body: "When a pharmacy suffers a stock outage, the system surfaces simulated partner pharmacy availability as a draft recommendation. A human clinician or patient must explicitly click 'Request Transfer' to initiate it.",
  },
];

const CAVEATS = [
  "This is a hackathon prototype built in a constrained 60–90 minute window. It demonstrates technical compliance architecture, but has not undergone a formal third-party SOC 2 or HIPAA security audit.",
  "HIPAA-aligned architecture claim: We implement technical safeguards (encryption, access controls, audit logs, PII de-identification), but formal compliance requires organizational BAA execution and institutional operational policies.",
  "All patient tokens, prescriptions, and pharmacy partner inventory shown in this demonstration are simulated test data.",
];

export default function SecurityPage() {
  return (
    <div className="page-frame min-h-screen bg-white">
      <Nav />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="section-label">Security &amp; Trust</div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-ink-900 tracking-tight mb-3">
            What we built. What we claim. What we don&apos;t.
          </h1>
          <p className="text-sm text-ink-400 leading-relaxed max-w-2xl">
            Healthcare interoperability requires radical honesty. This document details our implemented
            cryptographic and clinical safeguards, alongside deliberate boundaries we refuse to cross.
          </p>
        </div>

        {/* High-level summary strip */}
        <div className="bg-ink-900 text-white rounded-xl p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
            {[
              { icon: Lock,     label: "AES-256 At Rest" },
              { icon: Shield,   label: "TLS 1.3 In Transit" },
              { icon: FileText, label: "Insert-Only Audit Trail" },
              { icon: Eye,      label: "Pre-Triage PII Stripping" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-ok-400 flex-shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CORE DESIGN PRINCIPLES (Explicit Provider Boundary) ── */}
        <div className="card p-6 border-2 border-accent-200 bg-accent-50/50 rounded-xl mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-800 mb-3">
            <Shield className="h-4 w-4 text-accent-600" />
            Core Clinical Design Principles &amp; Guardrails
          </div>
          <div className="space-y-4">
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-accent-100">
                <h3 className="text-sm font-bold text-ink-900 mb-1">{p.title}</h3>
                <p className="text-xs text-ink-600 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Measures */}
        <div className="space-y-4 mb-8">
          {MEASURES.map(m => (
            <div key={m.title} className="card p-5 border border-ink-100 shadow-sm rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-ink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <m.icon className="h-4 w-4 text-ink-900" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-ink-900">{m.title}</h3>
                    <span className="badge badge-resolved text-[10px]">
                      <CheckCircle className="h-2.5 w-2.5" /> {m.status}
                    </span>
                  </div>
                </div>
              </div>
              <ul className="space-y-1.5 pl-11">
                {m.items.map((item, i) => (
                  <li key={i} className="text-xs text-ink-500 leading-relaxed flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-ink-300 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Caveats */}
        <div className="card p-5 border border-warn-200 bg-warn-50/70 rounded-xl mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warn-700" />
            <h3 className="text-sm font-bold text-warn-800">Prototype Transparency &amp; Real-World Limitations</h3>
          </div>
          <ul className="space-y-2">
            {CAVEATS.map((c, i) => (
              <li key={i} className="text-xs text-warn-900 leading-relaxed flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-warn-600 mt-1.5 flex-shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="border-t border-ink-100 pt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-ink-400">Architecture verified for hackathon judging presentation.</p>
          <div className="flex gap-3">
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Open Queue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/" className="btn btn-secondary btn-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
