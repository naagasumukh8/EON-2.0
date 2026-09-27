"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Send, Bell, RefreshCw, CheckCircle2, XCircle, Shuffle, Shield,
  Stethoscope, Building2, User, AlertTriangle, Clock, ArrowRight, Zap
} from "lucide-react";
import {
  seedDemoData, resetDemoData, getThreads, getThreadMessages, markMessagesRead,
  getNotifications, countUnreadNotifs, providerApprove, providerSuggestAlternative,
  providerRequireVisit, providerStartedReview, timeAgo, setCurrentRole,
  type Message, type RefillThread, type Notification,
} from "../../lib/demo-messages";
import { RoleSwitcher } from "../components/RoleSwitcher";

const PROVIDER_NAME = "Dr. Marcus Chen, MD";

const SPOONFED_PROVIDER_NOTES = [
  {
    label: "Sign eRx Renewal",
    text: "Refill renewal authorized for 90-day supply with 3 repeats. eRx transmitted to Summit Rx.",
  },
  {
    label: "Authorize CCB Alternative",
    text: "Authorizing generic substitution: Amlodipine 5mg once daily to maintain blood pressure control without delay.",
  },
  {
    label: "Require In-Person Visit",
    text: "Clinical review indicates an overdue comprehensive metabolic panel (CMP). Follow-up visit required before renewal.",
  },
];

function StatusChip({ status }: { status: RefillThread["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending_pharmacy: { label: "Pending at Pharmacy", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
    pending_provider: { label: "Awaiting Your Review", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    approved:         { label: "Approved",             color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
    blocked:          { label: "Visit Required",       color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    resolved:         { label: "Ready for Pickup",     color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
  };
  const c = map[status] ?? { label: status, color: "#6B7280", bg: "#F3F4F6", border: "#E5E7EB" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: "9999px",
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {c.label}
    </span>
  );
}

function RefillPanel({ thread, onClose, onRefresh }: { thread: RefillThread; onClose: () => void; onRefresh: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("Renewal authorized under protocol. eRx electronically signed and transmitted to pharmacy.");
  const [sending, setSending] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [tab, setTab] = useState<"review" | "messages">("review");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    const all = getThreadMessages(thread.id);
    setMessages(all.filter(m => m.from === "provider" || m.to === "provider"));
    markMessagesRead("provider", thread.id);
  }, [thread.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function doAction(type: "approve" | "alternative" | "visit") {
    setActing(type);
    if (type === "approve")      providerApprove(thread.id, PROVIDER_NAME);
    if (type === "alternative")  providerSuggestAlternative(thread.id, PROVIDER_NAME);
    if (type === "visit")        providerRequireVisit(thread.id, PROVIDER_NAME);
    setTimeout(() => { setActing(null); load(); onRefresh(); }, 400);
  }

  function handleSend(canned?: string) {
    const t = canned ?? text;
    if (!t.trim()) return;
    setSending(true);
    const { addMessage } = require("../../lib/demo-messages");
    addMessage({ from: "provider", to: "pharmacy", text: t.trim(), threadId: thread.id });
    setText("");
    setTimeout(() => { setSending(false); load(); onRefresh(); }, 250);
  }

  const canAct = thread.status === "pending_provider";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#FFFFFF",
        borderRadius: "20px",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 10px 24px -6px rgba(0,0,0,0.03)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          background: "rgba(250,250,250,0.8)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "9999px",
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: "rgb(60,60,65)",
          }}
        >
          ← Queue
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "15px", color: "rgb(18,19,23)", letterSpacing: "-0.01em" }}>
            {thread.med} <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 400 }}>({thread.id})</span>
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280" }}>
            Patient: {thread.patientName} · {thread.dose}
          </div>
        </div>
        <StatusChip status={thread.status} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.06)", flexShrink: 0, background: "#FAFAFA" }}>
        {(["review", "messages"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "12px",
              background: tab === t ? "#FFFFFF" : "transparent",
              border: "none",
              borderBottom: tab === t ? "2px solid rgb(18,19,23)" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "12.5px",
              fontWeight: tab === t ? 600 : 500,
              color: tab === t ? "rgb(18,19,23)" : "#6B7280",
              transition: "all 0.15s ease",
            }}
          >
            {t === "review" ? "Clinical Review & Actions" : "Communications"}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#FCFCFC" }}>
        {tab === "review" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* 1-Click Action Bar */}
            {canAct && (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid rgb(18,19,23)",
                  borderRadius: "16px",
                  padding: "18px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "ui-monospace, monospace",
                    fontWeight: 700,
                    color: "rgb(18,19,23)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Zap style={{ width: 12, height: 12, color: "#9333EA" }} /> 1-Click Physician Sign-off Actions
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => doAction("approve")}
                    disabled={acting !== null}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 22px",
                      borderRadius: "9999px",
                      background: "rgb(18,19,23)",
                      color: "#FFFFFF",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    <CheckCircle2 style={{ width: 14, height: 14 }} />
                    {acting === "approve" ? "Signing eRx…" : "1-Click: Approve & Send eRx"}
                  </button>

                  <button
                    onClick={() => doAction("alternative")}
                    disabled={acting !== null}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "9999px",
                      background: "#FFFFFF",
                      color: "rgb(18,19,23)",
                      border: "1px solid rgba(0,0,0,0.15)",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    <Shuffle style={{ width: 13, height: 13 }} />
                    {acting === "alternative" ? "Routing…" : "1-Click: Authorize Alternative"}
                  </button>

                  <button
                    onClick={() => doAction("visit")}
                    disabled={acting !== null}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "9999px",
                      background: "#FEF2F2",
                      color: "#DC2626",
                      border: "1px solid #FECACA",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    <XCircle style={{ width: 13, height: 13 }} />
                    {acting === "visit" ? "Updating…" : "1-Click: Require Visit"}
                  </button>
                </div>
              </div>
            )}

            {/* Patient Context Card */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "16px",
                padding: "16px 20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontFamily: "ui-monospace, monospace",
                  fontWeight: 700,
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "10px",
                }}
              >
                Patient & Prescription Baseline
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                {[
                  { label: "Medication", value: thread.med },
                  { label: "Dosage", value: thread.dose },
                  { label: "Patient", value: `${thread.patientName} (DOB: 1978-04-12)` },
                  { label: "Diagnosis", value: "Type 2 Diabetes · Hypertension" },
                  { label: "Allergies", value: "Sulfa drugs" },
                  { label: "Insurance", value: "Aetna AET-88124-X" },
                  { label: "Last Refill Dispensed", value: "32 days ago" },
                  { label: "Prescribing Physician", value: PROVIDER_NAME },
                ].map(({ label, value }) => (
                  <div key={label} style={{ fontSize: "12.5px" }}>
                    <div style={{ color: "#9CA3AF", fontSize: "10px", fontFamily: "ui-monospace, monospace", textTransform: "uppercase", marginBottom: "1px" }}>
                      {label}
                    </div>
                    <div style={{ color: "rgb(20,20,25)", fontWeight: 550 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pharmacy Triage Summary */}
            {thread.clinicalSummary && (
              <div
                style={{
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: "16px",
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "ui-monospace, monospace",
                    fontWeight: 700,
                    color: "#1E40AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "6px",
                  }}
                >
                  Automated Triage Rationale from Pharmacy
                </div>
                <p style={{ fontSize: "13px", color: "#1E3A8A", lineHeight: 1.5, margin: 0 }}>
                  {thread.clinicalSummary}
                </p>
              </div>
            )}

            {/* Alternative Drug Flag */}
            {thread.classifyResult?.alternative && (
              <div
                style={{
                  background: "#FAF5FF",
                  border: "1px solid #E9D5FF",
                  borderRadius: "16px",
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "ui-monospace, monospace",
                    fontWeight: 700,
                    color: "#7E22CE",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "4px",
                  }}
                >
                  System Recommended Alternative
                </div>
                <div style={{ fontWeight: 600, fontSize: "13.5px", color: "rgb(18,19,23)", marginBottom: "2px" }}>
                  {thread.classifyResult.alternative}
                </div>
                <div style={{ fontSize: "12.5px", color: "#6B7280" }}>
                  {thread.classifyResult.alternativeReason}
                </div>
              </div>
            )}

            {/* Clinical Safety Protocol */}
            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: "16px",
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontFamily: "ui-monospace, monospace",
                  fontWeight: 700,
                  color: "#15803D",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                Automated Clinical Safety Verification
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {[
                  "No C-II controlled substance",
                  "No drug-drug contraindication detected",
                  "Active baseline diagnosis confirmed",
                  "Formulary Tier 1 / Generic covered",
                ].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#166534" }}>
                    <CheckCircle2 style={{ width: 12, height: 12, flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "messages" && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px" }}>
            {/* 1-Click Spoon-fed Notes */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", padding: "4px 0 10px" }}>
              {SPOONFED_PROVIDER_NOTES.map(p => (
                <button
                  key={p.label}
                  onClick={() => handleSend(p.text)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    background: "#FFFFFF",
                    color: "rgb(20,20,25)",
                    fontSize: "11.5px",
                    fontWeight: 550,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgb(18,19,23)";
                    e.currentTarget.style.color = "#FFFFFF";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#FFFFFF";
                    e.currentTarget.style.color = "rgb(20,20,25)";
                  }}
                >
                  <span>{p.label}</span>
                  <ArrowRight style={{ width: 11, height: 11 }} />
                </button>
              ))}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: "13px", padding: "30px 0" }}>
                  No messages on this channel.
                </div>
              )}
              {messages.map((m) => {
                const isMe = m.from === "provider";
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "76%",
                        padding: "12px 16px",
                        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: isMe ? "rgb(18,19,23)" : "#FFFFFF",
                        color: isMe ? "#FFFFFF" : "rgb(30,30,35)",
                        border: isMe ? "none" : "1px solid rgba(0,0,0,0.08)",
                        fontSize: "13.5px",
                        lineHeight: 1.5,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "10px",
                          fontFamily: "ui-monospace, monospace",
                          marginBottom: "4px",
                          opacity: isMe ? 0.75 : 0.65,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {isMe ? "You (Provider)" : m.from === "patient" ? "Patient" : "Summit Rx Pharmacy"}
                      </div>
                      {m.text}
                      <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "5px", textAlign: "right" }}>
                        {timeAgo(m.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={2}
                placeholder="Message pharmacy or clinic staff…"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                style={{
                  flex: 1,
                  resize: "none",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  outline: "none",
                  background: "#FFFFFF",
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!text.trim() || sending}
                style={{
                  background: text.trim() ? "rgb(18,19,23)" : "rgba(0,0,0,0.08)",
                  color: text.trim() ? "#FFFFFF" : "#9CA3AF",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0 22px",
                  cursor: text.trim() ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <Send style={{ width: 13, height: 13 }} /> 1-Click Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProviderPage() {
  const [threads, setThreads] = useState<RefillThread[]>([]);
  const [active, setActive] = useState<RefillThread | null>(null);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [notifPanel, setNotifPanel] = useState(false);
  const [tick, setTick] = useState(0);
  const [resetting, setResetting] = useState(false);

  function handleResetClean() {
    setResetting(true);
    resetDemoData(true);
    load();
    setTimeout(() => setResetting(false), 500);
  }

  function load() {
    seedDemoData();
    setCurrentRole("provider");
    const ts = getThreads();
    setThreads(ts);
    // Auto-select pending provider review (e.g. RF-002 Lisinopril) immediately on load!
    setActive(prev => {
      if (prev) return ts.find(t => t.id === prev.id) ?? ts[0];
      return ts.find(t => t.status === "pending_provider") ?? ts[0];
    });
    setNotifs(getNotifications("provider"));
    setNotifCount(countUnreadNotifs("provider"));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 2500); return () => clearInterval(iv); }, []);
  useEffect(() => {
    setNotifCount(countUnreadNotifs("provider"));
  }, [tick]);

  const needsReview = threads.filter(t => t.status === "pending_provider");
  const other       = threads.filter(t => t.status !== "pending_provider");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F0F0F0",
        fontFamily: '"Google Sans", "Sora", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "rgb(18,19,23)",
      }}
    >
      {/* Top Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "54px",
          background: "rgba(240, 240, 240, 0.85)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/"
              style={{
                fontFamily: '"Google Sans","Sora",sans-serif',
                fontWeight: 600,
                fontSize: "16px",
                color: "rgb(18,19,23)",
                textDecoration: "none",
                letterSpacing: "-0.01em",
              }}
            >
              UnStuck Med
            </Link>
            <RoleSwitcher current="provider" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#9333EA",
              }}
            >
              <Stethoscope style={{ width: 12, height: 12 }} />
              {PROVIDER_NAME}
            </div>

            <button
              onClick={() => setNotifPanel(p => !p)}
              style={{
                position: "relative",
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "9999px",
                width: "34px",
                height: "34px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Notifications"
            >
              <Bell style={{ width: 14, height: 14, color: "rgb(80,80,85)" }} />
              {notifCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    background: "#DC2626",
                    color: "#FFFFFF",
                    borderRadius: "9999px",
                    fontSize: "9px",
                    fontWeight: 700,
                    width: "14px",
                    height: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {notifCount}
                </span>
              )}
            </button>

            <button
              onClick={handleResetClean}
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "9999px",
                width: "34px",
                height: "34px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              title="Clear all messages & reset to fresh demo state"
            >
              <RefreshCw
                style={{
                  width: 13,
                  height: 13,
                  color: resetting ? "#9333EA" : "rgb(80,80,85)",
                  transform: resetting ? "rotate(180deg)" : "none",
                  transition: "transform 0.4s ease",
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Notifications Drawer */}
      {notifPanel && (
        <div
          style={{
            position: "fixed",
            top: "62px",
            right: "32px",
            zIndex: 200,
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            width: "320px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(0,0,0,0.06)", fontWeight: 600, fontSize: "13px" }}>
            Provider Clinical Alerts
          </div>
          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {notifs.length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
                No active notifications.
              </div>
            )}
            {notifs.map(n => (
              <div key={n.id} style={{ padding: "12px 18px", borderBottom: "1px solid rgba(0,0,0,0.04)", fontSize: "12.5px", color: "rgb(50,50,55)" }}>
                <div>{n.text}</div>
                <div style={{ fontSize: "10px", color: "#9CA3AF", marginTop: "4px" }}>{timeAgo(n.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px 32px",
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "24px",
          minHeight: "calc(100vh - 100px)",
        }}
      >
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { label: "Review Queue", value: needsReview.length, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
              { label: "Signed Off",  value: other.length,       color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
            ].map(({ label, value, color, bg, border }) => (
              <div
                key={label}
                style={{
                  background: "#FFFFFF",
                  border: `1px solid ${border}`,
                  borderRadius: "16px",
                  padding: "14px 16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: 700, color, letterSpacing: "-0.03em" }}>{value}</div>
                <div style={{ fontSize: "10px", fontFamily: "ui-monospace, monospace", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Action Required Queue */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 10px 24px -6px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                fontWeight: 600,
                fontSize: "12px",
                color: "#1D4ED8",
                textTransform: "uppercase",
                fontFamily: "ui-monospace, monospace",
                letterSpacing: "0.06em",
              }}
            >
              Pending Physician Review
            </div>
            {needsReview.length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
                All pending reviews completed.
              </div>
            )}
            <div>
              {needsReview.map(t => {
                const isSelected = active?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActive(t);
                      if (t.status === "pending_provider") providerStartedReview(t.id);
                    }}
                    style={{
                      width: "100%",
                      background: isSelected ? "rgba(0,0,0,0.04)" : "#FFFFFF",
                      border: "none",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                      padding: "14px 20px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                      borderLeft: isSelected ? "3px solid rgb(18,19,23)" : "3px solid transparent",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, fontSize: "13.5px", color: "rgb(18,19,23)" }}>{t.med}</span>
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#6B7280", marginBottom: "6px" }}>{t.patientName}</div>
                    <StatusChip status={t.status} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Historical Log */}
          {other.length > 0 && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  fontFamily: "ui-monospace, monospace",
                  letterSpacing: "0.06em",
                }}
              >
                Previously Decided
              </div>
              <div>
                {other.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t)}
                    style={{
                      width: "100%",
                      background: active?.id === t.id ? "rgba(0,0,0,0.04)" : "#FFFFFF",
                      border: "none",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                      padding: "12px 20px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "rgb(18,19,23)", marginBottom: "2px" }}>
                      {t.med}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6B7280" }}>{t.patientName}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Column */}
        <div style={{ minHeight: "540px" }}>
          {active ? (
            <RefillPanel thread={active} onClose={() => setActive(null)} onRefresh={load} />
          ) : (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "20px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                padding: "40px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 10px 24px -6px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgb(18,19,23)",
                }}
              >
                <Stethoscope style={{ width: 26, height: 26 }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: "16px", color: "rgb(18,19,23)", letterSpacing: "-0.01em" }}>
                Physician Triage Queue
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
