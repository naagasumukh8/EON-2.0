"use client";
/**
 * UnStuck Med — Autonomy Context & State Machine Engine
 * Single source of truth for DRAFT_ONLY / AUTONOMOUS mode.
 *
 * Requirements:
 * - Real boolean/mode with Org-level default and User-level setting (user overrides org default).
 * - State machine transitions: ACTION_DRAFTED -> ACTION_CONFIRMED -> ACTION_SENT.
 * - In Draft-Only mode: every action requires a human click to move ACTION_DRAFTED -> ACTION_CONFIRMED.
 * - In Autonomous mode: only whitelisted low-risk action types skip directly to ACTION_CONFIRMED -> ACTION_SENT.
 * - Therapy-affecting actions (new Rx, dosage change, PA justification) ALWAYS require human confirmation regardless of mode.
 * - State is persisted to localStorage so it survives page navigation and persists across sessions.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type AutonomyMode = "DRAFT_ONLY" | "AUTONOMOUS";

export type ActionState = "ACTION_DRAFTED" | "ACTION_CONFIRMED" | "ACTION_SENT";

/**
 * Whitelist of low-risk action types that can auto-execute in AUTONOMOUS mode.
 * Notification / data verification only — zero clinical or therapeutic changes.
 */
export const AUTONOMY_WHITELIST = [
  "send missing-info request",
  "send patient status update",
  "SEND_MISSING_INFO_SMS",
  "SEND_PATIENT_STATUS",
  "LOG_INSURANCE_REQUEST",
  "SEND_PROVIDER_ALERT",
  "suggest alternative partner pharmacy transfer",
  "partner pharmacy transfer",
  "pharmacy inventory",
  "pharmacy stock",
  "inventory exhausted",
  "request transfer",
  "TRANSFER_RX",
] as const;

/**
 * Therapy-affecting actions that ALWAYS require human confirmation regardless of mode.
 * Safety invariant: Hardcoded guardrail — cannot be bypassed by any setting.
 */
export const THERAPY_AFFECTING_ACTIONS = [
  "new rx",
  "new rx request",
  "dosage change",
  "dose change",
  "pa justification",
  "prior auth appeal",
  "clinical condition review",
  "clinical argument",
  "NEW_RX_REQUEST",
  "DOSAGE_CHANGE",
  "PA_JUSTIFICATION",
  "ESCALATE",
] as const;

export const AVG_MANUAL_MINUTES = 192; // Industry estimate: 3.2 hrs avg manual resolution time

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  refillId: string;
  actionType: string;
  fromState: ActionState;
  toState: ActionState;
  actor: string;
  mode: AutonomyMode;
  isAutoExecuted: boolean;
  notes: string;
}

interface AutonomyContextValue {
  // Effective active mode (user setting overrides org default)
  mode: AutonomyMode;
  // Org default
  orgDefault: AutonomyMode;
  setOrgDefault: (m: AutonomyMode) => void;
  // User override
  userOverride: AutonomyMode | null;
  setUserOverride: (m: AutonomyMode | null) => void;
  // Direct toggle (sets user override)
  setMode: (m: AutonomyMode) => void;
  resetUserOverride: () => void;
  
  // Guardrail checks
  isTherapyAffecting: (actionType: string) => boolean;
  canAutoExecute: (actionType: string) => boolean;
  
  // State machine helper
  evaluateTransition: (actionType: string) => {
    canAuto: boolean;
    reason: string;
    nextState: ActionState;
  };
  
  // Audit log
  auditLogs: AuditLogEntry[];
  recordAudit: (entry: Omit<AuditLogEntry, "id" | "timestamp" | "mode">) => void;
}

const AutonomyContext = createContext<AutonomyContextValue | null>(null);

const LS_USER_KEY = "unstuckmed_user_autonomy_mode";
const LS_ORG_KEY = "unstuckmed_org_autonomy_mode";

export function AutonomyProvider({ children }: { children: ReactNode }) {
  const [orgDefault, setOrgDefaultState] = useState<AutonomyMode>("DRAFT_ONLY");
  const [userOverride, setUserOverrideState] = useState<AutonomyMode | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: "LOG-001",
      timestamp: "10 min ago",
      refillId: "RF-005",
      actionType: "SEND_MISSING_INFO_SMS",
      fromState: "ACTION_DRAFTED",
      toState: "ACTION_SENT",
      actor: "Autonomous Bot",
      mode: "AUTONOMOUS",
      isAutoExecuted: true,
      notes: "Whitelisted low-risk action: Patient DOB mismatch SMS sent automatically",
    },
    {
      id: "LOG-002",
      timestamp: "25 min ago",
      refillId: "RF-001",
      actionType: "NEW_RX_REQUEST",
      fromState: "ACTION_DRAFTED",
      toState: "ACTION_CONFIRMED",
      actor: "Dr. Chen (Staff)",
      mode: "AUTONOMOUS",
      isAutoExecuted: false,
      notes: "Therapy-affecting action: Autonomy blocked by safety guardrail. Required manual confirmation.",
    },
  ]);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const storedOrg = localStorage.getItem(LS_ORG_KEY) as AutonomyMode | null;
      if (storedOrg === "AUTONOMOUS" || storedOrg === "DRAFT_ONLY") {
        setOrgDefaultState(storedOrg);
      }
      const storedUser = localStorage.getItem(LS_USER_KEY) as AutonomyMode | null;
      if (storedUser === "AUTONOMOUS" || storedUser === "DRAFT_ONLY") {
        setUserOverrideState(storedUser);
      }
    } catch {}
  }, []);

  const setOrgDefault = useCallback((m: AutonomyMode) => {
    setOrgDefaultState(m);
    try { localStorage.setItem(LS_ORG_KEY, m); } catch {}
  }, []);

  const setUserOverride = useCallback((m: AutonomyMode | null) => {
    setUserOverrideState(m);
    try {
      if (m) localStorage.setItem(LS_USER_KEY, m);
      else localStorage.removeItem(LS_USER_KEY);
    } catch {}
  }, []);

  // Effective mode: user override takes precedence over org default
  const effectiveMode: AutonomyMode = userOverride ?? orgDefault;

  const setMode = useCallback((m: AutonomyMode) => {
    setUserOverride(m);
  }, [setUserOverride]);

  const resetUserOverride = useCallback(() => {
    setUserOverride(null);
  }, [setUserOverride]);

  const isTherapyAffecting = useCallback((actionType: string): boolean => {
    const lower = actionType.toLowerCase();
    return THERAPY_AFFECTING_ACTIONS.some(a => lower.includes(a.toLowerCase()));
  }, []);

  const canAutoExecute = useCallback((actionType: string): boolean => {
    // Rule 1: Therapy-affecting actions NEVER auto-execute under any condition
    if (isTherapyAffecting(actionType)) return false;
    // Rule 2: Draft-only mode requires human click for everything
    if (effectiveMode === "DRAFT_ONLY") return false;
    // Rule 3: Only whitelisted low-risk action types can auto-execute in Autonomous mode
    const lower = actionType.toLowerCase();
    return AUTONOMY_WHITELIST.some(w => lower.includes(w.toLowerCase()));
  }, [effectiveMode, isTherapyAffecting]);

  const evaluateTransition = useCallback((actionType: string) => {
    const isTherapy = isTherapyAffecting(actionType);
    if (isTherapy) {
      return {
        canAuto: false,
        reason: "Therapy-affecting action (new Rx, dosage change, or PA): Human confirmation strictly required by clinical safety guardrail.",
        nextState: "ACTION_CONFIRMED" as ActionState,
      };
    }
    if (effectiveMode === "DRAFT_ONLY") {
      return {
        canAuto: false,
        reason: "Draft-Only mode active: Every action requires human review and confirmation before sending.",
        nextState: "ACTION_CONFIRMED" as ActionState,
      };
    }
    const isWhitelisted = AUTONOMY_WHITELIST.some(w => actionType.toLowerCase().includes(w.toLowerCase()));
    if (isWhitelisted) {
      return {
        canAuto: true,
        reason: "Autonomous mode: Whitelisted low-risk action auto-executed (ACTION_DRAFTED ➔ ACTION_CONFIRMED ➔ ACTION_SENT).",
        nextState: "ACTION_SENT" as ActionState,
      };
    }
    return {
      canAuto: false,
      reason: "Action not on autonomous whitelist: Human confirmation required.",
      nextState: "ACTION_CONFIRMED" as ActionState,
    };
  }, [effectiveMode, isTherapyAffecting]);

  const recordAudit = useCallback((entry: Omit<AuditLogEntry, "id" | "timestamp" | "mode">) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: "Just now",
      mode: effectiveMode,
    };
    setAuditLogs(prev => [newEntry, ...prev.slice(0, 19)]);
  }, [effectiveMode]);

  return (
    <AutonomyContext.Provider
      value={{
        mode: effectiveMode,
        orgDefault,
        setOrgDefault,
        userOverride,
        setUserOverride,
        setMode,
        resetUserOverride,
        isTherapyAffecting,
        canAutoExecute,
        evaluateTransition,
        auditLogs,
        recordAudit,
      }}
    >
      {children}
    </AutonomyContext.Provider>
  );
}

export function useAutonomy(): AutonomyContextValue {
  const ctx = useContext(AutonomyContext);
  if (!ctx) throw new Error("useAutonomy must be used within <AutonomyProvider>");
  return ctx;
}
