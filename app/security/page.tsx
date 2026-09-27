"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, Lock, Eye, FileText, Server, Key, Users, AlertTriangle, CheckCircle } from "lucide-react";

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
          {(["/", "/workflow", "/dashboard", "/classify", "/security"] as const).map(href => (
            <Link key={href} href={href}
              className={`top-nav__link ${href === "/security" ? "top-nav__link--active" : ""}`}>
              {href === "/" ? "Home" : href.replace("/", "").charAt(0).toUpperCase() + href.slice(2)}
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

const MEASURES = [
  {
    icon: Shield,
    title: "Authentication & Session Management",
    status: "Implemented",
    items: [
      "Supabase Auth with email/password login — MFA (TOTP) can be enabled per organization in Supabase Auth settings",
      "Session expiry: 1-hour idle timeout, 24-hour absolute maximum — configured via Supabase JWT expiry",
      "Refresh tokens rotated on each use; revoked on logout",
    ],
  },
  {
    icon: Lock,
    title: "Row-Level Security (RLS)",
    status: "Implemented",
    items: [
      "RLS policies on all tables containing patient or refill data: refill_requests, refill_events, profiles",
      "Policy: org_id must equal the org_id in the authenticated user's JWT claim — a pharmacy org cannot query another org's data",
      "insert-only policy on refill_events: UPDATE and DELETE are prohibited at the database level, not just the application layer",
    ],
  },
  {
    icon: Eye,
    title: "PII De-identification Before AI",
    status: "Implemented",
    items: [
      "Patient names, dates of birth, contact information, and addresses are never sent to the classifier",
      "Only structured, de-identified fields are used: med_class (chronic_high_risk / chronic_standard / acute), block_type, days_stuck, and org_id",
      "Each de-identification step is logged as a PII_STRIPPED event in the refill_events audit table — this is auditable",
    ],
  },
  {
    icon: FileText,
    title: "Insert-Only Audit Trail",
    status: "Implemented",
    items: [
      "refill_events is an append-only table: no UPDATE or DELETE permitted via RLS",
      "Every state transition is logged: CLASSIFIED, ACTION_DRAFTED, ACTION_CONFIRMED, PII_STRIPPED, RESOLVED, ESCALATED",
      "Each event captures: timestamp, actor_id, event_type, autonomy_mode active, de-identified payload",
    ],
  },
  {
    icon: Users,
    title: "Role-Based Access Control",
    status: "Implemented",
    items: [
      "Four roles: staff, provider, pharmacist, admin — stored in the profiles table",
      "Staff: see queue and take actions; cannot view provider clinical notes",
      "Provider: see refills assigned to them; approve/deny; cannot modify queue of other providers",
      "Pharmacist: see pharmacy-side queue only; cannot see practice-internal notes",
      "Admin: full queue access + autonomy settings + audit log viewer",
    ],
  },
  {
    icon: Server,
    title: "Encryption",
    status: "Supabase-managed",
    items: [
      "Data at rest: AES-256 encryption — managed by Supabase (AWS RDS)",
      "Data in transit: TLS 1.3 enforced on all connections between client and Supabase",
      "No patient data is written to local storage or browser cache",
    ],
  },
  {
    icon: Key,
    title: "Patient Notification Content Policy",
    status: "Enforced in code",
    items: [
      "Patient-facing SMS and portal notifications reference the refill generically",
      "Message bodies never include: medication name, diagnosis, dosage, or any clinical detail",
      "Example message: 'Your prescription refill request needs your attention. Please visit [link] for next steps.' — medication name intentionally omitted",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Autonomy Guardrails",
    status: "Implemented",
    items: [
      "Autonomous mode only auto-executes a whitelisted set of low-risk actions: SEND_MISSING_INFO_SMS, SEND_PROVIDER_ALERT, LOG_INSURANCE_REQUEST",
      "Actions that affect therapy (new Rx, dose change, escalation) always require explicit human confirmation — this cannot be disabled",
      "Every auto-executed action is logged with autonomy_mode = AUTONOMOUS in the audit trail",
    ],
  },
];

const CAVEATS = [
  "This is a hackathon prototype built in a constrained 60–90 minute window. It implements the architecture patterns described above, but has not undergone third-party security audit.",
  "This is not a HIPAA certification claim. We describe our build as 'HIPAA-aligned architecture' — meaning we implement the technical safeguards (encryption, access controls, audit logging, de-identification) that HIPAA requires, but certified compliance requires organizational policies, BAAs, risk assessments, and ongoing procedures that are out of scope for this prototype.",
  "The sample data used in this prototype is entirely fabricated — no real patient data was used at any stage of development.",
  "Production deployment would require a Business Associate Agreement (BAA) with Supabase (available on paid plans), a formal HIPAA risk assessment, and staff training.",
];

export default function SecurityPage() {
  return (
    <div className="page-frame">
      <Nav />

      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="section-label">Security & Trust</div>
          <h1 className="text-4xl font-display font-bold text-ink-900 mb-3">
            What we built. What we claim. What we don&apos;t.
          </h1>
          <p className="text-sm text-ink-400 leading-relaxed max-w-2xl">
            Healthcare data demands transparency about security architecture.
            This page describes what is implemented in this prototype and is explicit about the boundary
            between good architecture and certified compliance.
          </p>
        </div>

        {/* Summary strip */}
        <div className="card-dark p-5 rounded-xl mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Lock,     label: "AES-256 at rest"       },
              { icon: Shield,   label: "TLS 1.3 in transit"    },
              { icon: FileText, label: "Insert-only audit log" },
              { icon: Eye,      label: "PII stripped pre-AI"   },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-ink-200">
                <Icon className="h-4 w-4 text-ok-400 flex-shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Measures */}
        <div className="space-y-4 mb-8">
          {MEASURES.map(m => (
            <div key={m.title} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-ink-100 rounded flex items-center justify-center flex-shrink-0">
                  <m.icon className="h-4 w-4 text-ink-900" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink-900">{m.title}</h3>
                    <span className="badge badge-resolved text-[10px]">
                      <CheckCircle className="h-2.5 w-2.5" /> {m.status}
                    </span>
                  </div>
                </div>
              </div>
              <ul className="space-y-2 pl-11">
                {m.items.map((item, i) => (
                  <li key={i} className="text-xs text-ink-400 leading-relaxed flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-ink-300 mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Caveats */}
        <div className="card p-5 border-warn-200 bg-warn-50 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-warn-700" />
            <h3 className="text-sm font-semibold text-warn-700">What this prototype is not</h3>
          </div>
          <ul className="space-y-3">
            {CAVEATS.map((c, i) => (
              <li key={i} className="text-xs text-warn-700 leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-warn-600 mt-1.5 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="divider mb-6" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-ink-400">Questions about the security architecture?</p>
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
