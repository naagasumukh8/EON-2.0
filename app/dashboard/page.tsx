"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckCircle, AlertTriangle, Zap,
  Search, Eye, X, TrendingUp, Shield,
  Building2, MapPin, Check, RefreshCw, Send, Lock
} from "lucide-react";
import { useAutonomy, type ActionState, AVG_MANUAL_MINUTES } from "../../lib/autonomy";
import { AutonomyBanner } from "../components/AutonomyBanner";

/* ── Nav (minimal, workflow removed from primary) ───────── */
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
              className={`top-nav__link ${l.href === "/dashboard" ? "top-nav__link--active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="top-nav__right">
          <Link href="/classify" className="btn btn-primary btn-sm">
            <Zap className="h-3.5 w-3.5" /> AI Classifier
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Risk scoring ─────────────────────────────────────── */
const MED_CLASS_RISK: Record<string, { score: number; reason: string }> = {
  chronic_high_risk: { score: 40, reason: "Chronic high-risk medication (cardiac/diabetes/hypertension)" },
  chronic_standard:  { score: 20, reason: "Chronic standard medication" },
  acute:             { score: 10, reason: "Acute / symptomatic medication" },
};

function computePriorityScore(daysStuck: number, medClass: string, blockType: string): number {
  const medScore = MED_CLASS_RISK[medClass]?.score ?? 10;
  const ageScore = Math.min(daysStuck * 12, 48);
  const blockBonus = blockType === "NO_REFILLS" ? 12 : blockType === "INSURANCE" ? 8 : 4;
  return Math.min(medScore + ageScore + blockBonus, 100);
}

interface RefillItem {
  id: string;
  token: string;
  med: string;
  medClass: string;
  blockType: "NO_REFILLS" | "INSURANCE" | "VISIT" | "MISSING_INFO" | "CLEAR" | "PHARMACY_STOCK";
  status: "BLOCKED" | "FILLING" | "RESOLVED";
  actionState: ActionState;
  daysStuck: number;
  actor: string;
  practice: string;
  insurance: string;
  nextAction: string;
  priorityScore: number;
  priorityReason: string;
  transferRequested?: boolean;
}

/* ── Mock initial queue data ──────────────────────────── */
const RAW_QUEUE = [
  {
    id: "RF-001",
    token: "pt-7a3f",
    med: "Metformin 500mg",
    medClass: "chronic_high_risk",
    blockType: "NO_REFILLS" as const,
    status: "BLOCKED" as const,
    actionState: "ACTION_DRAFTED" as ActionState,
    daysStuck: 3,
    actor: "Provider",
    practice: "CareFirst Family Health",
    insurance: "BlueCross PPO",
    nextAction: "Draft new eRx renewal request to attending provider (therapy-affecting: requires human confirmation)",
  },
  {
    id: "RF-009",
    token: "pt-4k8m",
    med: "Amoxicillin 500mg",
    medClass: "acute",
    blockType: "PHARMACY_STOCK" as const,
    status: "BLOCKED" as const,
    actionState: "ACTION_DRAFTED" as ActionState,
    daysStuck: 2,
    actor: "Pharmacy",
    practice: "Summit Medical Group",
    insurance: "Aetna Health",
    nextAction: "Pharmacy inventory exhausted: suggest alternative partner pharmacy transfer",
  },
  {
    id: "RF-002",
    token: "pt-2c1d",
    med: "Lisinopril 10mg",
    medClass: "chronic_high_risk",
    blockType: "INSURANCE" as const,
    status: "BLOCKED" as const,
    actionState: "ACTION_DRAFTED" as ActionState,
    daysStuck: 2,
    actor: "Staff",
    practice: "Summit Clinic",
    insurance: "Aetna Health",
    nextAction: "Submit PA justification form to Aetna PBM (clinical argument: requires human confirmation)",
  },
  {
    id: "RF-005",
    token: "pt-1e6c",
    med: "Levothyroxine 50mcg",
    medClass: "chronic_standard",
    blockType: "MISSING_INFO" as const,
    status: "BLOCKED" as const,
    actionState: "ACTION_DRAFTED" as ActionState,
    daysStuck: 1,
    actor: "Staff",
    practice: "ClearPath Primary Care",
    insurance: "Humana Choice",
    nextAction: "send missing-info request via SMS to verify patient DOB mismatch",
  },
  {
    id: "RF-003",
    token: "pt-9b4e",
    med: "Sertraline 50mg",
    medClass: "chronic_standard",
    blockType: "VISIT" as const,
    status: "BLOCKED" as const,
    actionState: "ACTION_DRAFTED" as ActionState,
    daysStuck: 1,
    actor: "Patient",
    practice: "Valley Medical",
    insurance: "Cigna Premier",
    nextAction: "send patient status update and scheduling link to patient portal",
  },
  {
    id: "RF-007",
    token: "pt-8a2f",
    med: "Metoprolol 25mg",
    medClass: "chronic_high_risk",
    blockType: "NO_REFILLS" as const,
    status: "BLOCKED" as const,
    actionState: "ACTION_DRAFTED" as ActionState,
    daysStuck: 4,
    actor: "Provider",
    practice: "Summit Clinic",
    insurance: "Aetna Health",
    nextAction: "Urgent: 4 days stuck: draft new Rx renewal with provider escalation",
  },
  {
    id: "RF-004",
    token: "pt-5f8a",
    med: "Atorvastatin 20mg",
    medClass: "chronic_high_risk",
    blockType: "CLEAR" as const,
    status: "FILLING" as const,
    actionState: "ACTION_SENT" as ActionState,
    daysStuck: 0,
    actor: "Pharmacy",
    practice: "MedReach Health",
    insurance: "UnitedHealthcare",
    nextAction: "Pharmacist verification and bottle labeling in progress",
  },
  {
    id: "RF-006",
    token: "pt-3d9b",
    med: "Albuterol Inhaler",
    medClass: "acute",
    blockType: "CLEAR" as const,
    status: "RESOLVED" as const,
    actionState: "ACTION_SENT" as ActionState,
    daysStuck: 0,
    actor: "Done",
    practice: "Valley Medical",
    insurance: "Cigna Premier",
    nextAction: "Patient notified for contactless pickup",
  },
];

const INITIAL_QUEUE: RefillItem[] = RAW_QUEUE.map(r => ({
  ...r,
  priorityScore: computePriorityScore(r.daysStuck, r.medClass, r.blockType),
  priorityReason: `${MED_CLASS_RISK[r.medClass]?.reason ?? ""}; stuck ${r.daysStuck}d`,
})).sort((a, b) => b.priorityScore - a.priorityScore);

/* ── Status badges ────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  if (status === "BLOCKED") return <span className="badge badge-blocked"><AlertTriangle className="h-2.5 w-2.5" />Blocked</span>;
  if (status === "FILLING") return <span className="badge badge-progress"><RefreshCw className="h-2.5 w-2.5" />Filling</span>;
  if (status === "RESOLVED") return <span className="badge badge-resolved"><CheckCircle className="h-2.5 w-2.5" />Resolved</span>;
  return <span className="badge badge-neutral">{status}</span>;
}

function ActionStateBadge({ state }: { state: ActionState }) {
  if (state === "ACTION_DRAFTED") {
    return (
      <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-warn-50 text-warn-700 border border-warn-200">
        Drafted
      </span>
    );
  }
  if (state === "ACTION_CONFIRMED") {
    return (
      <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
        Confirmed
      </span>
    );
  }
  return (
    <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-ok-50 text-ok-700 border border-ok-200">
      Sent
    </span>
  );
}

function PriorityBar({ score }: { score: number }) {
  const color = score >= 75 ? "#DC2626" : score >= 45 ? "#B45309" : "#6E7681";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-ink-400">{score}</span>
    </div>
  );
}

const ACTOR_COLORS: Record<string, string> = {
  Provider: "bg-accent-50 text-accent-700 border-accent-100",
  Staff:    "bg-ink-100 text-ink-700 border-ink-200",
  Pharmacy: "bg-warn-50 text-warn-700 border-warn-200",
  Patient:  "bg-ok-50 text-ok-700 border-ok-200",
  Done:     "bg-ok-50 text-ok-700 border-ok-200",
};

/* ── Savings counter (animates each resolve) ────────────── */
function SavingsCounter({ minutesSaved }: { minutesSaved: number }) {
  const [displayed, setDisplayed] = useState(minutesSaved);
  const prev = useRef(minutesSaved);

  useEffect(() => {
    if (minutesSaved === prev.current) return;
    const diff = minutesSaved - prev.current;
    const start = prev.current;
    prev.current = minutesSaved;
    const t0 = Date.now();
    const dur = 800;
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setDisplayed(Math.round(start + diff * p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [minutesSaved]);

  const hrs = (displayed / 60).toFixed(1);
  return (
    <div className="stat-card border-ok-200 bg-ok-50/60 p-4">
      <div className="stat-card__label flex items-center gap-1.5 text-ok-700 font-semibold text-xs uppercase tracking-wider">
        <TrendingUp className="h-3.5 w-3.5" /> Hours Saved This Session
      </div>
      <div className="text-3xl font-display font-extrabold text-ok-700 my-1">{hrs} hrs</div>
      <div className="text-xs text-ok-700/70">{displayed} min saved</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const {
    mode,
    setMode,
    isTherapyAffecting,
    canAutoExecute,
    evaluateTransition,
    recordAudit,
  } = useAutonomy();

  const [queue, setQueue] = useState<RefillItem[]>(INITIAL_QUEUE);
  const [selected, setSelected] = useState<string | null>("RF-009");
  const [search, setSearch] = useState("");
  const [minutesSaved, setMinutesSaved] = useState(192);
  const [notification, setNotification] = useState<{ msg: string; type: "info" | "success" | "warn" } | null>(null);
  const [approvalItem, setApprovalItem] = useState<RefillItem | null>(null);
  const [approvalNote, setApprovalNote] = useState<string>("");

  // ── Auto-execute all whitelisted items when mode switches to AUTONOMOUS ──
  const prevModeRef = useRef<string | null>(null);
  useEffect(() => {
    // Only trigger when switching INTO autonomous mode (not on initial mount if already autonomous)
    if (mode !== "AUTONOMOUS") {
      prevModeRef.current = mode;
      return;
    }
    if (prevModeRef.current === "AUTONOMOUS") return; // already was autonomous
    prevModeRef.current = mode;

    // Fire all whitelisted drafted items immediately
    let autoCount = 0;
    let minutesAdded = 0;
    setQueue(prev => prev.map(r => {
      if (
        r.actionState === "ACTION_DRAFTED" &&
        r.status === "BLOCKED" &&
        canAutoExecute(r.nextAction)
      ) {
        autoCount++;
        minutesAdded += AVG_MANUAL_MINUTES;
        recordAudit({
          refillId: r.id,
          actionType: r.nextAction,
          fromState: "ACTION_DRAFTED",
          toState: "ACTION_SENT",
          actor: "Autonomous System",
          isAutoExecuted: true,
          notes: `[AUTONOMOUS MODE ACTIVATED] Auto-executed on mode switch: ${r.nextAction}`,
        });
        return {
          ...r,
          actionState: "ACTION_SENT" as const,
          status: "FILLING" as const,
          daysStuck: 0,
          actor: "Autonomous Bot",
          transferRequested: r.blockType === "PHARMACY_STOCK" ? true : r.transferRequested,
        };
      }
      return r;
    }));
    if (autoCount > 0) {
      setMinutesSaved(m => m + minutesAdded);
      setNotification({
        msg: `⚡ Autonomous mode ON — ${autoCount} low-risk action${autoCount > 1 ? "s" : ""} auto-executed instantly (+${minutesAdded} min saved).`,
        type: "success",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const selectedItem = queue.find(r => r.id === selected);

  // Filtered queue
  const filtered = queue.filter(r =>
    !search ||
    r.med.toLowerCase().includes(search.toLowerCase()) ||
    r.token.includes(search) ||
    r.blockType.toLowerCase().includes(search.toLowerCase())
  );

  const blockedCount = queue.filter(r => r.status === "BLOCKED").length;

  // Mark resolved
  const handleResolve = (id: string) => {
    setQueue(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status: "RESOLVED", actor: "Done", daysStuck: 0, actionState: "ACTION_SENT" }
          : r
      )
    );
    setMinutesSaved(m => m + AVG_MANUAL_MINUTES);
    recordAudit({
      refillId: id,
      actionType: "RESOLVE_REFILL",
      fromState: "ACTION_CONFIRMED",
      toState: "ACTION_SENT",
      actor: "Staff Clinician",
      isAutoExecuted: false,
      notes: "Refill marked resolved manually. Audit log stamped.",
    });
    setNotification({
      msg: `Refill ${id} resolved. ${AVG_MANUAL_MINUTES} minutes added to session savings.`,
      type: "success",
    });
  };

  // Direct Clinician Approval & Dispatch Handler (Draft-Only / Human-in-the-Loop)
  const handleApproveAndDispatch = (item: RefillItem, customNote?: string) => {
    setQueue(prev =>
      prev.map(r =>
        r.id === item.id
          ? { ...r, actionState: "ACTION_SENT", status: "FILLING" }
          : r
      )
    );
    setMinutesSaved(m => m + AVG_MANUAL_MINUTES);
    recordAudit({
      refillId: item.id,
      actionType: item.nextAction,
      fromState: item.actionState,
      toState: "ACTION_SENT",
      actor: "Dr. Sarah Chen, PharmD (Clinical Staff)",
      isAutoExecuted: false,
      notes: customNote || `[HUMAN SIGN-OFF] Dr. Sarah Chen, PharmD approved and dispatched: ${item.nextAction}`,
    });
    setNotification({
      msg: `✅ Clinician sign-off approved & dispatched for ${item.med} (${item.id}) by Dr. S. Chen, PharmD`,
      type: "success",
    });
    setApprovalItem(null);
  };

  // State Machine Action Execution Handler
  const handlePerformAction = (item: RefillItem) => {
    const isTherapy = isTherapyAffecting(item.nextAction);
    const transition = evaluateTransition(item.nextAction);

    if (item.actionState === "ACTION_DRAFTED") {
      if (transition.canAuto) {
        // AUTONOMOUS mode & whitelisted low-risk action:
        // Skips directly ACTION_DRAFTED -> ACTION_CONFIRMED -> ACTION_SENT
        setQueue(prev =>
          prev.map(r =>
            r.id === item.id
              ? {
                  ...r,
                  actionState: "ACTION_SENT",
                  status: "FILLING",
                  daysStuck: 0,
                  actor: "Autonomous Bot",
                  transferRequested: r.blockType === "PHARMACY_STOCK" ? true : r.transferRequested,
                }
              : r
          )
        );
        setMinutesSaved(m => m + AVG_MANUAL_MINUTES);
        recordAudit({
          refillId: item.id,
          actionType: item.nextAction,
          fromState: "ACTION_DRAFTED",
          toState: "ACTION_SENT",
          actor: "Autonomous System",
          isAutoExecuted: true,
          notes: `[AUTONOMOUS AUTO-EXECUTE] Whitelisted action executed without human intervention: ${item.nextAction}`,
        });
        setNotification({
          msg: `⚡ Auto-executed for ${item.id}: Action dispatched (+${AVG_MANUAL_MINUTES} min saved).`,
          type: "success",
        });
      } else {
        // Draft-Only or Therapy-affecting: requires human click to move ACTION_DRAFTED -> ACTION_CONFIRMED
        setQueue(prev =>
          prev.map(r =>
            r.id === item.id
              ? { ...r, actionState: "ACTION_CONFIRMED" }
              : r
          )
        );
        recordAudit({
          refillId: item.id,
          actionType: item.nextAction,
          fromState: "ACTION_DRAFTED",
          toState: "ACTION_CONFIRMED",
          actor: "Human Staff",
          isAutoExecuted: false,
          notes: isTherapy
            ? `Therapy-affecting action confirmed: ${item.nextAction}`
            : `Action confirmed in Draft-Only mode: ${item.nextAction}`,
        });
        setNotification({
          msg: isTherapy
            ? `Confirmed ${item.id} (clinical sign-off). Click Send to dispatch.`
            : `Confirmed ${item.id}. Click Send to dispatch.`,
          type: "info",
        });
      }
    } else if (item.actionState === "ACTION_CONFIRMED") {
      // Moves ACTION_CONFIRMED -> ACTION_SENT
      setQueue(prev =>
        prev.map(r =>
          r.id === item.id
            ? { ...r, actionState: "ACTION_SENT", status: "FILLING", daysStuck: 0 }
            : r
        )
      );
      setMinutesSaved(m => m + AVG_MANUAL_MINUTES);
      recordAudit({
        refillId: item.id,
        actionType: item.nextAction,
        fromState: "ACTION_CONFIRMED",
        toState: "ACTION_SENT",
        actor: "Human Staff",
        isAutoExecuted: false,
        notes: `Dispatched: ${item.nextAction}`,
      });
      setNotification({
        msg: `Dispatched action for ${item.id} (+${AVG_MANUAL_MINUTES} min saved).`,
        type: "success",
      });
    }
  };

  // Pharmacy transfer request handler (Simulated data)
  const handleRequestTransfer = (item: RefillItem) => {
    const isAuto = mode === "AUTONOMOUS";
    setQueue(prev =>
      prev.map(r =>
        r.id === item.id
          ? {
              ...r,
              transferRequested: true,
              actionState: isAuto ? "ACTION_SENT" : "ACTION_CONFIRMED",
              status: isAuto ? "FILLING" : r.status,
              daysStuck: isAuto ? 0 : r.daysStuck,
              actor: isAuto ? "Autonomous Bot" : "Staff Clinician",
              nextAction: isAuto
                ? "Transfer Rx auto-dispatched to CarePoint Pharmacy (0.8 mi away): stock reserved"
                : "Transfer Rx requested to CarePoint Pharmacy (0.8 mi away): awaiting pharmacy electronic acceptance",
            }
          : r
      )
    );
    if (isAuto) {
      setMinutesSaved(m => m + AVG_MANUAL_MINUTES);
    }
    recordAudit({
      refillId: item.id,
      actionType: "REQUEST_PHARMACY_TRANSFER",
      fromState: "ACTION_DRAFTED",
      toState: isAuto ? "ACTION_SENT" : "ACTION_CONFIRMED",
      actor: isAuto ? "Autonomous Bot" : "Staff Clinician",
      isAutoExecuted: isAuto,
      notes: isAuto
        ? "Autonomous stock query: CarePoint Pharmacy stock verified and transfer dispatched automatically."
        : "Simulated partner pharmacy transfer requested by human staff. Assigned to CarePoint Pharmacy.",
    });
    setNotification({
      msg: isAuto
        ? `⚡ Auto-executed transfer for ${item.med} (${item.id}) to CarePoint Pharmacy!`
        : `Transfer request logged for ${item.med} to CarePoint Pharmacy. Awaiting pharmacist confirmation.`,
      type: "success",
    });
  };

  return (
    <div className="page-frame min-h-screen bg-[#F0F0F0]">
      <Nav />
      <AutonomyBanner />
      {/* ── System notification toast ────────────────────── */}
      {notification && (
        <div className="max-w-screen-xl mx-auto px-6 mt-3">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm shadow-sm ${
              notification.type === "success"
                ? "bg-ok-50 border-ok-200 text-ok-800"
                : notification.type === "warn"
                ? "bg-warn-50 border-warn-200 text-warn-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-ok-600" />
            ) : (
              <Zap className="h-4 w-4 flex-shrink-0 text-blue-600" />
            )}
            <span className="flex-1 font-medium">{notification.msg}</span>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:opacity-75 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {/* ── Page header ──────────────────────────────── */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <div className="section-label">Real-Time Prescription Intelligence</div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-ink-900 tracking-tight">
              Prescription Refill Queue
            </h1>
            <p className="text-sm text-ink-400 mt-1">
              Cross-organization worklist · Prioritized by clinical risk and days stalled
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-ok-700 bg-ok-50 border border-ok-200 px-3 py-1.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-ok-600 animate-pulse" />
              Connected (Local Simulation)
            </div>
          </div>
        </div>

        {/* ── SIMPLIFIED STAT ROW: ONLY 2 NUMBERS THAT MATTER ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Stat 1: Hours saved this session */}
          <SavingsCounter minutesSaved={minutesSaved} />

          {/* Stat 2: Blocked count */}
          <div className="stat-card border-warn-200 bg-warn-50/60 p-4">
            <div className="stat-card__label flex items-center gap-1.5 text-warn-700 font-semibold text-xs uppercase tracking-wider">
              <AlertTriangle className="h-3.5 w-3.5" /> Blocked Refills Requiring Action
            </div>
            <div className="text-3xl font-display font-extrabold text-warn-700 my-1">
              {blockedCount} Blocked
            </div>
            <div className="text-xs text-warn-700/70">
              Stalled on provider renewal, prior auth, or pharmacy out-of-stock
            </div>
          </div>
        </div>

        {/* ── Search & Filter Bar ──────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 input py-1.5 w-full sm:w-80">
            <Search className="h-3.5 w-3.5 text-ink-400 flex-shrink-0" />
            <input
              className="text-sm bg-transparent outline-none text-ink-900 placeholder:text-ink-400 w-full"
              placeholder="Search medication, token, or block..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-400">
            <span>Showing {filtered.length} of {queue.length} refills</span>
          </div>
        </div>

        {/* ── Main Layout: Table + Detail Panel ────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left: Queue Table (7 cols or 12 if no selection) */}
          <div className={`${selected ? "xl:col-span-7" : "xl:col-span-12"} card overflow-hidden border border-ink-100 shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Token</th>
                    <th>Medication</th>
                    <th>Block Type</th>
                    <th>Status</th>
                    <th>State</th>
                    <th>Stuck</th>
                    <th className="text-center">Action / Sign-Off</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => {
                    const isSelected = selected === row.id;
                    const isPharmacyBlock = row.blockType === "PHARMACY_STOCK";
                    return (
                      <tr
                        key={row.id}
                        className={`clickable transition-colors ${
                          isSelected ? "bg-accent-50/70 border-l-4 border-l-accent-600" : "hover:bg-ink-50/50"
                        }`}
                        onClick={() => setSelected(isSelected ? null : row.id)}
                      >
                        <td>
                          <div className="tooltip-wrap">
                            <PriorityBar score={row.priorityScore} />
                            <div className="tooltip-box max-w-[200px]">{row.priorityReason}</div>
                          </div>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-ink-500 font-semibold">{row.token}</span>
                        </td>
                        <td>
                          <div className="font-semibold text-ink-900 text-sm flex items-center gap-1.5">
                            {row.med}
                            {isPharmacyBlock && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">
                                Stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="text-xs text-ink-600 font-medium">
                            {row.blockType === "PHARMACY_STOCK"
                              ? "Pharmacy Stock"
                              : row.blockType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={row.status} />
                        </td>
                        <td>
                          <ActionStateBadge state={row.actionState} />
                        </td>
                        <td>
                          {row.daysStuck > 0 ? (
                            <span
                              className={`font-mono text-xs font-semibold ${
                                row.daysStuck >= 3 ? "text-warn-600" : "text-ink-500"
                              }`}
                            >
                              {row.daysStuck}d
                            </span>
                          ) : (
                            <span className="text-xs text-ink-400">—</span>
                          )}
                        </td>
                        {/* Direct Action / Human-in-the-Loop Sign-off Column */}
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          {row.status === "RESOLVED" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-400 bg-ink-50 px-2 py-0.5 rounded border border-ink-200">
                              <CheckCircle className="h-3 w-3 text-ok-600" /> Resolved
                            </span>
                          ) : row.actionState === "ACTION_SENT" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ok-700 bg-ok-50 px-2 py-0.5 rounded border border-ok-200">
                              <Check className="h-3 w-3 text-ok-600" /> Dispatched
                            </span>
                          ) : row.actionState === "ACTION_CONFIRMED" ? (
                            <button
                              onClick={() => handlePerformAction(row)}
                              className="btn btn-sm btn-primary text-[11px] py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm inline-flex items-center gap-1"
                            >
                              <Send className="h-3 w-3" /> Dispatch
                            </button>
                          ) : mode === "AUTONOMOUS" && canAutoExecute(row.nextAction) ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                              <RefreshCw className="h-3 w-3 animate-spin" /> Queuing...
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setApprovalItem(row);
                                setApprovalNote(`Clinical review verified for ${row.med} (${row.id}). Approved under standard clinical protocol.`);
                              }}
                              className="btn btn-sm text-[11px] py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded shadow-sm inline-flex items-center gap-1 font-semibold"
                            >
                              <Shield className="h-3 w-3" /> Review &amp; Approve
                            </button>
                          )}
                        </td>
                        <td className="text-right">
                          <Eye className={`h-4 w-4 ${isSelected ? "text-accent-600" : "text-ink-300"}`} />
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-sm text-ink-400">
                        No prescription refills match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Selected Refill Detail Panel (5 cols) */}
          {selectedItem && (
            <div className="xl:col-span-5 space-y-4">
              {/* Header Card */}
              <div className="card p-5 border border-ink-100 shadow-sm bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-ink-400">{selectedItem.id}</span>
                      <span className="text-ink-300">·</span>
                      <span className="font-mono text-xs text-ink-400">{selectedItem.token}</span>
                      <ActionStateBadge state={selectedItem.actionState} />
                    </div>
                    <h3 className="text-xl font-display font-bold text-ink-900 leading-tight">
                      {selectedItem.med}
                    </h3>
                    <div className="text-xs text-ink-400 mt-1">
                      {selectedItem.practice} · {selectedItem.insurance}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1 rounded-md text-ink-400 hover:text-ink-900 hover:bg-ink-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Priority Breakdown */}
                <div className="bg-ink-50 rounded-lg p-3 my-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">
                    <span>Clinical Priority Score</span>
                    <span className="font-mono text-sm font-bold text-ink-900">{selectedItem.priorityScore}/100</span>
                  </div>
                  <PriorityBar score={selectedItem.priorityScore} />
                  <p className="text-xs text-ink-400 mt-2 leading-relaxed">{selectedItem.priorityReason}</p>
                </div>

                {/* Attribute rows */}
                <div className="space-y-2 text-xs border-t border-ink-100 pt-3">
                  <div className="flex justify-between py-1">
                    <span className="text-ink-400">Block Category</span>
                    <span className="font-semibold text-ink-900">
                      {selectedItem.blockType === "PHARMACY_STOCK"
                        ? "Pharmacy Inventory / Backlog"
                        : selectedItem.blockType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-400">Current Actor</span>
                    <span className={`badge border text-[11px] ${ACTOR_COLORS[selectedItem.actor] ?? "badge-neutral"}`}>
                      {selectedItem.actor}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-400">State Machine Stage</span>
                    <span className="font-mono text-ink-900 font-bold">{selectedItem.actionState}</span>
                  </div>
                </div>
              </div>

              {/* ── NEW FEATURE: PHARMACY-ALTERNATIVE SUGGESTION CARD ── */}
              {selectedItem.blockType === "PHARMACY_STOCK" && (
                <div className="card p-5 border-2 border-amber-300 bg-amber-50/70 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-amber-700 flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                        Pharmacy Alternative Suggestion
                      </span>
                    </div>
                    {/* MANDATORY SIMULATED DATA TAG */}
                    <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-400">
                      SIMULATED DATA
                    </span>
                  </div>

                  <p className="text-xs text-amber-900 font-medium mb-3 leading-relaxed">
                    Primary dispensing pharmacy reports out-of-stock. AI query found 2 verified in-network partner pharmacies with verified inventory:
                  </p>

                  {/* Seeded partner pharmacies */}
                  <div className="space-y-2 mb-4">
                    <div className="bg-white p-3 rounded-lg border border-amber-200 flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                          CarePoint Pharmacy (Partner)
                          <span className="text-[10px] bg-ok-100 text-ok-800 px-1 rounded font-semibold">In Stock</span>
                        </div>
                        <div className="text-[11px] text-ink-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-ink-400" /> 0.8 miles away · 140 units on hand
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-ok-700 font-bold">Same-Day</span>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-amber-200 flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                          Metro Health Pharmacy
                          <span className="text-[10px] bg-ok-100 text-ok-800 px-1 rounded font-semibold">In Stock</span>
                        </div>
                        <div className="text-[11px] text-ink-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-ink-400" /> 1.4 miles away · 90 units on hand
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-ok-700 font-bold">Pickup/Deliver</span>
                    </div>
                  </div>

                  {/* Safe Transfer Action */}
                  {selectedItem.transferRequested || selectedItem.actionState === "ACTION_SENT" ? (
                    <div className="bg-ok-100/90 border border-ok-300 rounded-lg p-3 text-xs text-ok-800 flex items-center gap-2">
                      <Check className="h-4 w-4 text-ok-700 flex-shrink-0" />
                      <span>
                        Transfer requested to CarePoint Pharmacy. Stock reserved for patient pickup/delivery.
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestTransfer(selectedItem)}
                      className="btn btn-primary w-full justify-center text-xs py-2.5 shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" /> Request Transfer (CarePoint Pharmacy)
                    </button>
                  )}

                  {/* Clinical continuity design note */}
                  <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-[11px] text-amber-800 flex items-center justify-between">
                    <span>{mode === "AUTONOMOUS" ? "Autonomous routing · Zero phone tag" : "Draft transfer only · Human sign-off required"}</span>
                    <span className="text-amber-700/80">Clinical continuity preserved</span>
                  </div>
                </div>
              )}

              {/* ── AI ACTION & STATE MACHINE CARD ──────────── */}
              {selectedItem.status !== "RESOLVED" && (
                <div className="card p-5 border border-accent-200 bg-accent-50/50 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent-800 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-accent-600" />
                      Next Action &amp; Autonomy Engine
                    </span>
                    <span className="text-xs font-mono font-semibold text-accent-700">
                      Mode: {mode}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-ink-900 leading-snug mb-3">
                    {selectedItem.nextAction}
                  </p>

                  {/* State machine inspection */}
                  <div className="bg-white rounded-lg p-3 border border-accent-100 mb-3 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-ink-400">Current State:</span>
                      <span className={`font-mono font-bold ${selectedItem.actionState === "ACTION_SENT" ? "text-ok-700" : "text-accent-700"}`}>
                        {selectedItem.actionState === "ACTION_SENT" ? "ACTION_SENT (DISPATCHED)" : selectedItem.actionState}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-400">Therapy-Affecting:</span>
                      <span className={`font-semibold ${isTherapyAffecting(selectedItem.nextAction) ? "text-warn-600" : "text-ok-600"}`}>
                        {isTherapyAffecting(selectedItem.nextAction) ? "YES (Guardrail Active)" : "NO (Low Risk)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-400">Autonomy Whitelist:</span>
                      <span className={`font-semibold ${
                        selectedItem.actionState === "ACTION_SENT"
                          ? "text-ok-700"
                          : canAutoExecute(selectedItem.nextAction)
                          ? "text-accent-700"
                          : "text-ink-700"
                      }`}>
                        {selectedItem.actionState === "ACTION_SENT"
                          ? "✓ Auto-Executed (Dispatched)"
                          : canAutoExecute(selectedItem.nextAction)
                          ? "Eligible for Auto-Execution"
                          : "Human Sign-off Required"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {selectedItem.actionState === "ACTION_DRAFTED" && (
                      <div>
                        {mode === "AUTONOMOUS" && canAutoExecute(selectedItem.nextAction) ? (
                          <button
                            onClick={() => handlePerformAction(selectedItem)}
                            className="btn btn-primary w-full justify-center text-xs py-2.5"
                          >
                            <Zap className="h-3.5 w-3.5" />
                            Auto-Execute Action
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setApprovalItem(selectedItem);
                              setApprovalNote(`Clinical review verified for ${selectedItem.med} (${selectedItem.id}). Authorized under standard clinical protocol.`);
                            }}
                            className="btn w-full justify-center text-xs py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                          >
                            <Shield className="h-3.5 w-3.5" />
                            Review &amp; Approve Action (Human Sign-off)
                          </button>
                        )}
                      </div>
                    )}

                    {selectedItem.actionState === "ACTION_CONFIRMED" && (
                      <button
                        onClick={() => handlePerformAction(selectedItem)}
                        className="btn btn-primary w-full justify-center text-xs py-2.5 bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send &amp; Dispatch
                      </button>
                    )}

                    {selectedItem.actionState === "ACTION_SENT" && (
                      <div className="space-y-2">
                        <div className="bg-ok-100 border border-ok-200 rounded p-2.5 text-center text-xs font-semibold text-ok-800 flex items-center justify-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-ok-600" />
                          <span>Action Auto-Executed &amp; Dispatched via Autonomous Bot</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resolve Button */}
              {selectedItem.status !== "RESOLVED" && (
                <button
                  onClick={() => handleResolve(selectedItem.id)}
                  className="btn btn-secondary w-full justify-center text-xs py-2.5 text-ink-700 border-ink-200"
                >
                  <CheckCircle className="h-4 w-4 text-ok-600" />
                  Mark Refill Resolved (+{AVG_MANUAL_MINUTES} min saved)
                </button>
              )}

              {selectedItem.status === "RESOLVED" && (
                <div className="card p-4 border border-ok-200 bg-ok-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-bold text-ok-800">
                    <CheckCircle className="h-4 w-4 text-ok-600" />
                    Resolved &amp; Closed
                  </div>
                  <p className="text-xs text-ok-700 mt-1">
                    Audit trail entry created. Notification dispatched to patient portal without medication name.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── CLINICIAN SIGN-OFF MODAL (HUMAN-IN-THE-LOOP / DRAFT MODE) ── */}
      {approvalItem && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={() => setApprovalItem(null)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              maxWidth: "560px",
              width: "100%",
              maxHeight: "calc(100vh - 40px)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid rgba(0,0,0,0.1)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
            className="animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal header */}
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-950 font-display">
                    Clinical Human Sign-Off Required
                  </h3>
                  <p className="text-[11px] text-amber-800">
                    Draft-Only Protocol · Provider Review &amp; Sign-off
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovalItem(null)}
                className="text-amber-800 hover:text-amber-950 p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body (scrollable) */}
            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Prescription Context */}
              <div className="bg-ink-50 rounded-xl p-3.5 border border-ink-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-ink-500">{approvalItem.id}</span>
                    <span className="text-ink-300">·</span>
                    <span className="font-mono text-ink-500">{approvalItem.token}</span>
                    <span className="badge badge-neutral text-[10px]">{approvalItem.practice}</span>
                  </div>
                  <div className="text-base font-bold text-ink-900">{approvalItem.med}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-ink-400 uppercase font-semibold">Priority</div>
                  <div className="font-mono font-bold text-ink-900 text-sm">{approvalItem.priorityScore}/100</div>
                </div>
              </div>

              {/* Drafted Action */}
              <div>
                <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1.5">
                  Drafted AI Recommendation
                </label>
                <div className="p-3 bg-accent-50/60 border border-accent-200 rounded-lg text-ink-900 font-medium leading-relaxed">
                  {approvalItem.nextAction}
                </div>
              </div>

              {/* Safety verifications */}
              <div className="space-y-1.5 bg-ok-50/60 border border-ok-200 rounded-lg p-3">
                <div className="text-[11px] font-bold text-ok-800 uppercase tracking-wider mb-1">
                  Safety Invariant Checklist
                </div>
                <div className="flex items-center gap-2 text-ok-900 text-[11.5px]">
                  <CheckCircle className="h-3.5 w-3.5 text-ok-600 flex-shrink-0" />
                  <span>Therapy adherence and historical fill dates verified against EHR</span>
                </div>
                <div className="flex items-center gap-2 text-ok-900 text-[11.5px]">
                  <CheckCircle className="h-3.5 w-3.5 text-ok-600 flex-shrink-0" />
                  <span>Zero controlled substance contraindication (C-II exclusion enforced)</span>
                </div>
              </div>

              {/* Clinician Credential & Note */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">
                    Attending Signer
                  </label>
                  <span className="font-mono text-[10px] text-accent-700 bg-accent-50 px-2 py-0.5 rounded font-semibold">
                    Lic #CA-89211 (Active)
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-ink-200 rounded-lg mb-2 font-semibold text-ink-800 flex items-center justify-between">
                  <span>Dr. Sarah Chen, PharmD</span>
                  <span className="text-[11px] text-ink-400 font-normal">Clinical Staff Pharmacist</span>
                </div>

                <label className="block text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1">
                  Clinical Audit Justification Note
                </label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 border border-ink-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-600 font-sans"
                />
              </div>
            </div>

            {/* Modal footer (pinned, always visible) */}
            <div className="bg-ink-50 border-t border-ink-100 px-6 py-3.5 flex justify-end gap-2.5 flex-shrink-0">
              <button
                onClick={() => setApprovalItem(null)}
                className="btn btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveAndDispatch(approvalItem, approvalNote)}
                className="btn text-xs py-2 px-5 bg-ok-600 hover:bg-ok-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                Sign &amp; Dispatch to Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
