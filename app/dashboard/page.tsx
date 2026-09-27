"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckCircle, AlertTriangle, Zap,
  Search, Eye, X, TrendingUp, Shield,
  Building2, MapPin, Check, RefreshCw, Send, ChevronRight
} from "lucide-react";
import { useAutonomy, type ActionState, AVG_MANUAL_MINUTES } from "../../lib/autonomy";
import { AutonomyBanner } from "../components/AutonomyBanner";
import { AppHeader } from "@/components/AppHeader";

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
    nextAction: "Draft new eRx renewal request to attending provider with last fill date and adherence history.",
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
    nextAction: "Primary dispensing inventory depleted: suggest partner pharmacy transfer.",
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
    nextAction: "Submit PA justification form to Aetna PBM with diagnosis codes and treatment notes.",
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
    nextAction: "Send missing-info request via secure SMS to verify patient DOB mismatch.",
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
    nextAction: "Send patient status update and scheduling link to patient portal.",
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
    nextAction: "Urgent: 4 days stalled: draft new Rx renewal with provider escalation.",
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
    nextAction: "Pharmacist verification and bottle labeling in progress.",
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
    nextAction: "Patient notified for contactless pickup.",
  },
];

const INITIAL_QUEUE: RefillItem[] = RAW_QUEUE.map(r => ({
  ...r,
  priorityScore: computePriorityScore(r.daysStuck, r.medClass, r.blockType),
  priorityReason: `${MED_CLASS_RISK[r.medClass]?.reason ?? ""}; stuck ${r.daysStuck}d`,
})).sort((a, b) => b.priorityScore - a.priorityScore);

/* ── Status badges ────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  if (status === "BLOCKED") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 650, color: "#B45309", background: "#FFFBEB", border: "1px solid #FDE68A", padding: "3px 9px", borderRadius: "9999px" }}>
        <AlertTriangle style={{ width: 10, height: 10 }} /> Blocked
      </span>
    );
  }
  if (status === "FILLING") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 650, color: "#2563EB", background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "3px 9px", borderRadius: "9999px" }}>
        <RefreshCw style={{ width: 10, height: 10 }} /> Filling
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 650, color: "#166534", background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "3px 9px", borderRadius: "9999px" }}>
      <CheckCircle style={{ width: 10, height: 10 }} /> Resolved
    </span>
  );
}

function PriorityIndicator({ score }: { score: number }) {
  const color = score >= 75 ? "#DC2626" : score >= 45 ? "#B45309" : "#6E7681";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ width: "42px", height: "6px", background: "rgba(0,0,0,0.06)", borderRadius: "9999px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: "9999px" }} />
      </div>
      <span style={{ fontSize: "11.5px", fontFamily: "monospace", fontWeight: 650, color: "rgb(18,19,23)" }}>{score}</span>
    </div>
  );
}

/* ── Animated Savings Counter ──────────────────────────── */
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
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "24px",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(18,19,23,0.45)" }}>
        <TrendingUp style={{ width: 14, height: 14, color: "#166534" }} /> Hours Saved This Session
      </div>
      <div style={{ fontSize: "38px", fontWeight: 750, letterSpacing: "-0.03em", color: "rgb(18,19,23)", margin: "8px 0 4px" }}>
        {hrs} hrs
      </div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "#166534" }}>
        {displayed} min automated
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const {
    mode,
    canAutoExecute,
    evaluateTransition,
    recordAudit,
  } = useAutonomy();

  const [queue, setQueue]                 = useState<RefillItem[]>(INITIAL_QUEUE);
  const [selected, setSelected]           = useState<string | null>("RF-009");
  const [search, setSearch]               = useState("");
  const [minutesSaved, setMinutesSaved]   = useState(192);
  const [notification, setNotification]   = useState<{ msg: string; type: "info" | "success" | "warn" } | null>(null);
  const [approvalItem, setApprovalItem]   = useState<RefillItem | null>(null);
  const [approvalNote, setApprovalNote]   = useState<string>("");

  // Auto-execute whitelisted items when mode is AUTONOMOUS
  const prevModeRef = useRef<string | null>(null);
  useEffect(() => {
    if (mode !== "AUTONOMOUS") {
      prevModeRef.current = mode;
      return;
    }
    if (prevModeRef.current === "AUTONOMOUS") return;
    prevModeRef.current = mode;

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
          notes: `[AUTONOMOUS MODE ACTIVATED] Auto-executed: ${r.nextAction}`,
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
        msg: `Autonomous mode active — ${autoCount} action${autoCount > 1 ? "s" : ""} auto-dispatched (+${minutesAdded} min saved).`,
        type: "success",
      });
    }
  }, [mode, canAutoExecute, recordAudit]);

  const selectedItem = queue.find(r => r.id === selected);

  const filtered = queue.filter(r =>
    !search ||
    r.med.toLowerCase().includes(search.toLowerCase()) ||
    r.token.includes(search) ||
    r.blockType.toLowerCase().includes(search.toLowerCase())
  );

  const blockedCount = queue.filter(r => r.status === "BLOCKED").length;

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
      notes: customNote || `[HUMAN SIGN-OFF] Dr. Sarah Chen, PharmD approved: ${item.nextAction}`,
    });
    setNotification({
      msg: `✅ Approved & dispatched for ${item.med} (${item.id}) by Dr. S. Chen, PharmD`,
      type: "success",
    });
    setApprovalItem(null);
  };

  const handlePerformAction = (item: RefillItem) => {
    const transition = evaluateTransition(item.nextAction);

    if (item.actionState === "ACTION_DRAFTED") {
      if (transition.canAuto) {
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
          notes: `[AUTO-EXECUTE] Action dispatched: ${item.nextAction}`,
        });
        setNotification({
          msg: `Auto-executed for ${item.id}: Action dispatched (+${AVG_MANUAL_MINUTES} min saved).`,
          type: "success",
        });
      } else {
        setQueue(prev =>
          prev.map(r =>
            r.id === item.id
              ? { ...r, actionState: "ACTION_CONFIRMED" }
              : r
          )
        );
        setNotification({
          msg: `Confirmed ${item.id}. Click Send to dispatch.`,
          type: "info",
        });
      }
    } else if (item.actionState === "ACTION_CONFIRMED") {
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
                ? "Transfer Rx dispatched to CarePoint Pharmacy (0.8 mi away): stock reserved"
                : "Transfer Rx requested to CarePoint Pharmacy (0.8 mi away): awaiting acceptance",
            }
          : r
      )
    );
    if (isAuto) {
      setMinutesSaved(m => m + AVG_MANUAL_MINUTES);
    }
    setNotification({
      msg: isAuto
        ? `Stock reserved & transferred for ${item.med} to CarePoint Pharmacy!`
        : `Transfer request logged for ${item.med} to CarePoint Pharmacy.`,
      type: "success",
    });
  };

  return (
    <div style={{ background: "#F0F0F0", color: "rgb(18,19,23)", fontFamily: '"Google Sans","Sora",-apple-system,BlinkMacSystemFont,sans-serif', minHeight: "100vh" }}>
      <AppHeader activePath="/dashboard" />
      <AutonomyBanner />

      {/* System Toast Notification */}
      {notification && (
        <div style={{ maxWidth: "1240px", margin: "16px auto 0", padding: "0 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 20px",
              borderRadius: "16px",
              border: notification.type === "success" ? "1px solid rgba(22,101,52,0.15)" : "1px solid rgba(180,83,9,0.2)",
              background: notification.type === "success" ? "#F0FDF4" : "#FFFBEB",
              color: notification.type === "success" ? "#14532D" : "#78350F",
              fontSize: "13.5px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            {notification.type === "success" ? (
              <CheckCircle style={{ width: 16, height: 16, flexShrink: 0, color: "#166534" }} />
            ) : (
              <Zap style={{ width: 16, height: 16, flexShrink: 0, color: "#B45309" }} />
            )}
            <span style={{ flex: 1, fontWeight: 550 }}>{notification.msg}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", padding: "4px" }}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Header Title */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.035em", color: "rgb(18,19,23)", margin: "0 0 6px" }}>
              Prescription Refill Queue
            </h1>
            <p style={{ fontSize: "15px", color: "rgba(18,19,23,0.55)", margin: 0 }}>
              Cross-organization worklist · Prioritized by clinical risk and days stalled
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#166534", background: "rgba(22,101,52,0.06)", border: "1px solid rgba(22,101,52,0.15)", padding: "6px 14px", borderRadius: "9999px", fontWeight: 600 }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
            Connected (Local Simulation)
          </div>
        </div>

        {/* 2 Clean Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <SavingsCounter minutesSaved={minutesSaved} />

          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#B45309" }}>
              <AlertTriangle style={{ width: 14, height: 14, color: "#B45309" }} /> Blocked Refills Requiring Action
            </div>
            <div style={{ fontSize: "38px", fontWeight: 750, letterSpacing: "-0.03em", color: "rgb(18,19,23)", margin: "8px 0 4px" }}>
              {blockedCount} Blocked
            </div>
            <div style={{ fontSize: "13px", color: "rgba(18,19,23,0.5)" }}>
              Stalled on provider renewal, prior auth, or pharmacy stock
            </div>
          </div>
        </div>

        {/* Search Bar Row */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FFFFFF", borderRadius: "9999px", border: "1px solid rgba(0,0,0,0.08)", padding: "8px 18px", width: "100%", maxWidth: "340px", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
            <Search style={{ width: 14, height: 14, color: "rgba(18,19,23,0.4)", flexShrink: 0 }} />
            <input
              style={{ fontSize: "13.5px", background: "transparent", outline: "none", border: "none", color: "rgb(18,19,23)", width: "100%", fontFamily: '"Google Sans","Sora",sans-serif' }}
              placeholder="Search medication, token, or block..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ fontSize: "13px", color: "rgba(18,19,23,0.55)", fontWeight: 500 }}>
            {filtered.length} refills in queue
          </div>
        </div>

        {/* Main Grid: Clean Table + Detail Panel */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "minmax(0, 1fr) minmax(360px, 390px)" : "1fr", gap: "20px", alignItems: "flex-start" }}>
          {/* Table Container */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", minWidth: "640px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#FAFAFA", color: "rgba(18,19,23,0.45)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "12px 14px" }}>Priority</th>
                    <th style={{ padding: "12px 10px" }}>Token</th>
                    <th style={{ padding: "12px 14px" }}>Medication</th>
                    <th style={{ padding: "12px 10px" }}>Block Reason</th>
                    <th style={{ padding: "12px 10px" }}>Status</th>
                    <th style={{ padding: "12px 10px" }}>Stalled</th>
                    <th style={{ padding: "12px 14px", textAlign: "center" }}>Quick Action</th>
                    <th style={{ padding: "12px 8px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => {
                    const isSelected = selected === row.id;
                    const isStockBlock = row.blockType === "PHARMACY_STOCK";
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelected(isSelected ? null : row.id)}
                        style={{
                          borderBottom: "1px solid rgba(0,0,0,0.04)",
                          cursor: "pointer",
                          background: isSelected ? "rgba(0,0,0,0.03)" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.background = "rgba(0,0,0,0.015)";
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <td style={{ padding: "14px 18px" }}>
                          <PriorityIndicator score={row.priorityScore} />
                        </td>
                        <td style={{ padding: "14px 14px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "11.5px", background: "rgba(0,0,0,0.04)", padding: "3px 8px", borderRadius: "6px", color: "rgba(18,19,23,0.7)" }}>
                            {row.token}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: 650, color: "rgb(18,19,23)", display: "flex", alignItems: "center", gap: "6px" }}>
                            {row.med}
                            {isStockBlock && (
                              <span style={{ fontSize: "10px", background: "#FEF3C7", color: "#92400E", padding: "2px 6px", borderRadius: "9999px", fontWeight: 700 }}>
                                Stock Shortage
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "14px 14px", color: "rgba(18,19,23,0.65)" }}>
                          {row.blockType === "PHARMACY_STOCK" ? "Pharmacy Stock" : row.blockType.replace(/_/g, " ")}
                        </td>
                        <td style={{ padding: "14px 14px" }}>
                          <StatusBadge status={row.status} />
                        </td>
                        <td style={{ padding: "14px 14px", fontFamily: "monospace", color: row.daysStuck >= 3 ? "#B45309" : "rgba(18,19,23,0.5)", fontWeight: 600 }}>
                          {row.daysStuck > 0 ? `${row.daysStuck}d` : "—"}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
                          {row.status === "RESOLVED" ? (
                            <span style={{ fontSize: "11px", fontWeight: 600, color: "#166534", background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "4px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle style={{ width: 12, height: 12 }} /> Resolved
                            </span>
                          ) : row.actionState === "ACTION_SENT" ? (
                            <span style={{ fontSize: "11px", fontWeight: 600, color: "#166534", background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "4px 10px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Check style={{ width: 12, height: 12 }} /> Dispatched
                            </span>
                          ) : row.actionState === "ACTION_CONFIRMED" ? (
                            <button
                              onClick={() => handlePerformAction(row)}
                              style={{
                                background: "rgb(18,19,23)",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "9999px",
                                padding: "5px 14px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Send style={{ width: 12, height: 12 }} /> Dispatch
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setApprovalItem(row);
                                setApprovalNote(`Clinical review verified for ${row.med} (${row.id}). Approved under standard clinical protocol.`);
                              }}
                              style={{
                                background: "#D97706",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "9999px",
                                padding: "6px 14px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                boxShadow: "0 1px 3px rgba(217, 119, 6, 0.35)",
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#B45309")}
                              onMouseLeave={e => (e.currentTarget.style.background = "#D97706")}
                            >
                              <Shield style={{ width: 12, height: 12, color: "#FFFFFF" }} /> Review & Sign
                            </button>
                          )}
                        </td>
                        <td style={{ padding: "14px 12px", textAlign: "right" }}>
                          <ChevronRight style={{ width: 14, height: 14, color: isSelected ? "rgb(18,19,23)" : "rgba(18,19,23,0.2)" }} />
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "rgba(18,19,23,0.4)" }}>
                        No prescription refills match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Detail Drawer */}
          {selectedItem && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "24px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 16px 36px -8px rgba(0,0,0,0.04)",
                  padding: "24px",
                }}
              >
                {/* Detail Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: "rgba(18,19,23,0.45)" }}>{selectedItem.id}</span>
                      <span style={{ color: "rgba(0,0,0,0.2)" }}>·</span>
                      <span style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(18,19,23,0.45)" }}>{selectedItem.token}</span>
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, color: "rgb(18,19,23)", margin: "0 0 2px" }}>
                      {selectedItem.med}
                    </h3>
                    <div style={{ fontSize: "12px", color: "rgba(18,19,23,0.5)" }}>
                      {selectedItem.practice} · {selectedItem.insurance}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelected(null)}
                    style={{ background: "rgba(0,0,0,0.04)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  >
                    <X style={{ width: 14, height: 14, color: "rgb(18,19,23)" }} />
                  </button>
                </div>

                {/* Priority Bar */}
                <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "16px", padding: "14px 16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px", fontWeight: 700, color: "rgba(18,19,23,0.5)", textTransform: "uppercase", marginBottom: "8px" }}>
                    <span>Clinical Risk Score</span>
                    <span style={{ fontFamily: "monospace", fontSize: "13px", color: "rgb(18,19,23)" }}>{selectedItem.priorityScore}/100</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(0,0,0,0.06)", borderRadius: "9999px", overflow: "hidden", marginBottom: "8px" }}>
                    <div style={{ height: "100%", width: `${selectedItem.priorityScore}%`, background: selectedItem.priorityScore >= 75 ? "#DC2626" : selectedItem.priorityScore >= 45 ? "#B45309" : "#6E7681", borderRadius: "9999px" }} />
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(18,19,23,0.6)", lineHeight: 1.4 }}>
                    {selectedItem.priorityReason}
                  </div>
                </div>

                {/* Pharmacy Shortage Feature Card */}
                {selectedItem.blockType === "PHARMACY_STOCK" && (
                  <div
                    style={{
                      background: "#FFFBEB",
                      border: "1px solid #FDE68A",
                      borderRadius: "16px",
                      padding: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#92400E" }}>
                        <Building2 style={{ width: 14, height: 14 }} /> In-Network Partner Inventory
                      </div>
                      <span style={{ fontSize: "10px", background: "#FEF3C7", color: "#78350F", padding: "2px 6px", borderRadius: "9999px", fontWeight: 700 }}>
                        2 Found
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                      <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: 650, color: "rgb(18,19,23)" }}>CarePoint Pharmacy</div>
                          <div style={{ fontSize: "11px", color: "rgba(18,19,23,0.5)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <MapPin style={{ width: 11, height: 11 }} /> 0.8 mi away · 140 units on hand
                          </div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534", background: "#F0FDF4", padding: "2px 8px", borderRadius: "9999px" }}>Same-Day</span>
                      </div>

                      <div style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: 650, color: "rgb(18,19,23)" }}>Metro Health Pharmacy</div>
                          <div style={{ fontSize: "11px", color: "rgba(18,19,23,0.5)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <MapPin style={{ width: 11, height: 11 }} /> 1.4 mi away · 90 units on hand
                          </div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534", background: "#F0FDF4", padding: "2px 8px", borderRadius: "9999px" }}>Available</span>
                      </div>
                    </div>

                    {selectedItem.transferRequested || selectedItem.actionState === "ACTION_SENT" ? (
                      <div style={{ fontSize: "12px", color: "#166534", background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Check style={{ width: 14, height: 14 }} /> Transfer dispatched to CarePoint Pharmacy. Stock reserved.
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRequestTransfer(selectedItem)}
                        style={{
                          width: "100%",
                          background: "rgb(18,19,23)",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "9999px",
                          padding: "9px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        Request Transfer to CarePoint →
                      </button>
                    )}
                  </div>
                )}

                {/* Recommended Action */}
                <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(18,19,23,0.45)", marginBottom: "6px" }}>
                    📋 Recommended Action
                  </div>
                  <p style={{ fontSize: "13.5px", color: "rgb(18,19,23)", lineHeight: 1.5, margin: "0 0 12px", fontWeight: 550 }}>
                    {selectedItem.nextAction}
                  </p>

                  {/* Action buttons */}
                  {selectedItem.status !== "RESOLVED" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedItem.actionState === "ACTION_DRAFTED" && (
                        <button
                          onClick={() => {
                            setApprovalItem(selectedItem);
                            setApprovalNote(`Clinical review verified for ${selectedItem.med} (${selectedItem.id}). Authorized under standard clinical protocol.`);
                          }}
                          style={{
                            width: "100%",
                            background: "#D97706",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "9999px",
                            padding: "10px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            boxShadow: "0 2px 8px rgba(217, 119, 6, 0.35)",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#B45309")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#D97706")}
                        >
                          <Shield style={{ width: 14, height: 14, color: "#FFFFFF" }} /> Review & Sign-Off Action
                        </button>
                      )}

                      {selectedItem.actionState === "ACTION_CONFIRMED" && (
                        <button
                          onClick={() => handlePerformAction(selectedItem)}
                          style={{
                            width: "100%",
                            background: "rgb(18,19,23)",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "9999px",
                            padding: "10px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <Send style={{ width: 14, height: 14 }} /> Send & Dispatch Now
                        </button>
                      )}

                      {selectedItem.actionState === "ACTION_SENT" && (
                        <div style={{ fontSize: "12.5px", color: "#166534", background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "9px 12px", borderRadius: "10px", textAlign: "center", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                          <CheckCircle style={{ width: 14, height: 14 }} /> Dispatched to Care Team
                        </div>
                      )}

                      <button
                        onClick={() => handleResolve(selectedItem.id)}
                        style={{
                          width: "100%",
                          background: "#FFFFFF",
                          color: "rgb(18,19,23)",
                          border: "1px solid rgba(0,0,0,0.1)",
                          borderRadius: "9999px",
                          padding: "9px",
                          fontSize: "12.5px",
                          fontWeight: 550,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <CheckCircle style={{ width: 13, height: 13, color: "#166534" }} /> Mark Refill Resolved
                      </button>
                    </div>
                  )}

                  {selectedItem.status === "RESOLVED" && (
                    <div style={{ fontSize: "12.5px", color: "#166534", background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "10px", borderRadius: "10px", textAlign: "center", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <CheckCircle style={{ width: 14, height: 14 }} /> Resolved &amp; Archived
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clinician Sign-Off Modal */}
      {approvalItem && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={() => setApprovalItem(null)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
              border: "1px solid rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgb(18,19,23)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield style={{ width: 16, height: 16 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "rgb(18,19,23)", margin: 0 }}>
                    Clinical Human Sign-Off
                  </h3>
                  <p style={{ fontSize: "12px", color: "rgba(18,19,23,0.5)", margin: 0 }}>
                    Provider Review & Verification Protocol
                  </p>
                </div>
              </div>

              <button
                onClick={() => setApprovalItem(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(18,19,23,0.5)", padding: "4px" }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "rgba(0,0,0,0.025)", borderRadius: "14px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", color: "rgba(18,19,23,0.45)" }}>{approvalItem.id} · {approvalItem.token}</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "rgb(18,19,23)" }}>{approvalItem.med}</div>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "rgb(18,19,23)", background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", padding: "4px 10px", borderRadius: "9999px" }}>
                  Priority {approvalItem.priorityScore}/100
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "rgba(18,19,23,0.45)", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Drafted Action
                </label>
                <div style={{ background: "#F0FDF4", border: "1px solid rgba(22,101,52,0.15)", borderRadius: "12px", padding: "12px 14px", fontSize: "13px", color: "#14532D", lineHeight: 1.5, fontWeight: 550 }}>
                  {approvalItem.nextAction}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "rgba(0,0,0,0.02)", borderRadius: "12px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", color: "#166534", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle style={{ width: 13, height: 13 }} /> Historical adherence confirmed against EHR profile
                </div>
                <div style={{ fontSize: "12px", color: "#166534", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle style={{ width: 13, height: 13 }} /> Zero controlled substance contraindications detected
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "rgba(18,19,23,0.45)", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Clinical Justification Note
                </label>
                <textarea
                  value={approvalNote}
                  onChange={e => setApprovalNote(e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.1)", fontSize: "13px", color: "rgb(18,19,23)", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: '"Google Sans","Sora",sans-serif' }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(0,0,0,0.06)", background: "#FAFAFA", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setApprovalItem(null)}
                style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "9999px", padding: "8px 18px", fontSize: "13px", fontWeight: 550, color: "rgb(18,19,23)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveAndDispatch(approvalItem, approvalNote)}
                style={{ background: "rgb(18,19,23)", border: "none", borderRadius: "9999px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, color: "#FFFFFF", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Check style={{ width: 13, height: 13 }} /> Sign &amp; Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
