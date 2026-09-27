"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Send, Bell, RefreshCw, Zap, MessageSquare, CheckCircle2,
  Building2, User, Stethoscope, AlertTriangle, Clock, ArrowRight
} from "lucide-react";
import {
  seedDemoData, resetDemoData, getThreads, getThreadMessages, getInboxMessages, addMessage,
  markMessagesRead, getNotifications, countUnread, countUnreadNotifs,
  pharmacyProcessRefill, pharmacyStarted, timeAgo, setCurrentRole,
  type Message, type RefillThread,
} from "../../lib/demo-messages";
import { RoleSwitcher } from "../components/RoleSwitcher";

const SPOONFED_PHARMACY_REPLIES = [
  {
    label: "Acknowledge Intake",
    text: "Summit Rx received your refill request for Metformin 500mg. Reviewing insurance and dispensing records now.",
  },
  {
    label: "Notify Provider Escalation",
    text: "Refill requires doctor authorization. We have compiled your clinical brief and sent it directly to Dr. Marcus Chen.",
  },
  {
    label: "Notify Ready for Pickup",
    text: "Your refill has been filled and packaged. Ready for pickup at Central Fill Counter #2! ETA: Now.",
  },
];

function StatusChip({ status }: { status: RefillThread["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending_pharmacy: { label: "Pending — Action Needed", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
    pending_provider: { label: "Forwarded to Provider",  color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    approved:         { label: "Approved",               color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
    blocked:          { label: "Visit Required",          color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    resolved:         { label: "Ready for Pickup",        color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
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

function ThreadPanel({ thread, onClose, onRefresh }: { thread: RefillThread; onClose: () => void; onRefresh: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("Summit Rx has checked insurance eligibility. Refill request evaluated under protocol.");
  const [sending, setSending] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<"patient" | "provider">("patient");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    const all = getThreadMessages(thread.id);
    setMessages(all.filter(m => m.from !== "provider" || m.to === "pharmacy"));
    markMessagesRead("pharmacy", thread.id);
  }, [thread.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleSend(canned?: string) {
    const t = canned ?? text;
    if (!t.trim()) return;
    setSending(true);
    addMessage({ from: "pharmacy", to: recipient, text: t.trim(), threadId: thread.id });
    setText("");
    setTimeout(() => { setSending(false); load(); onRefresh(); }, 250);
  }

  function handleProcess() {
    setProcessing(true);
    const { result } = pharmacyProcessRefill(thread.id);
    const msg = result.priority === "routine"
      ? `ROUTINE REFILL — Processed automatically. Patient notified via SMS. Ready for pickup in 2–4 hours.`
      : `PROVIDER REVIEW REQUIRED — ${result.reason}${result.alternative ? ` Recommended substitution: ${result.alternative}.` : ""} Clinical context package routed to Dr. Marcus Chen.`;
    setProcessResult(msg);
    setTimeout(() => { setProcessing(false); load(); onRefresh(); }, 400);
  }

  const canProcess = thread.status === "pending_pharmacy";

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

      {/* Action Decisioning Box */}
      {canProcess && (
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "#FFFBEB",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#92400E",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Zap style={{ width: 12, height: 12 }} /> Triage Automation
          </div>
          <button
            onClick={handleProcess}
            disabled={processing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              borderRadius: "9999px",
              background: processing ? "rgba(0,0,0,0.15)" : "rgb(18,19,23)",
              color: "#FFFFFF",
              border: "none",
              cursor: processing ? "default" : "pointer",
              fontSize: "13.5px",
              fontWeight: 600,
              transition: "opacity 0.15s ease",
            }}
          >
            <Zap style={{ width: 13, height: 13 }} />
            {processing ? "Processing…" : "Process & Route Refill"}
          </button>
          {processResult && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px 16px",
                background: "#FFFFFF",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "12px",
                fontSize: "13px",
                color: "rgb(30,30,35)",
                lineHeight: 1.5,
              }}
            >
              {processResult}
            </div>
          )}
        </div>
      )}

      {/* Clinical summary */}
      {thread.summaryVisible && thread.clinicalSummary && (
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "1px solid #BFDBFE",
            background: "#EFF6FF",
            flexShrink: 0,
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
              marginBottom: "4px",
            }}
          >
            Clinical Context Package — Forwarded to Provider
          </div>
          <div style={{ fontSize: "12.5px", color: "#1E3A8A", lineHeight: 1.5 }}>
            {thread.clinicalSummary}
          </div>
        </div>
      )}

      {/* Quick Action Pills */}
      <div
        style={{
          padding: "10px 20px",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          background: "#FAFAFA",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(18,19,23,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: "4px" }}>
          Quick Replies:
        </span>
        {[
          { label: "Ready for Pickup", text: "Your prescription has been filled and is ready for pickup at our counter." },
          { label: "Escalate to Dr. Chen", text: "Zero refills remain on profile. Escalating refill renewal request to Dr. Marcus Chen." },
          { label: "Query Partner Stock", text: "Inventory checked with partner network: 140 units on hand at CarePoint Pharmacy." },
        ].map(p => (
          <button
            key={p.label}
            onClick={() => handleSend(p.text)}
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgb(18,19,23)",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 550,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <span>{p.label}</span>
            <ArrowRight style={{ width: 11, height: 11 }} />
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: "12px", background: "#FCFCFC" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: "13px", padding: "30px 0" }}>
            No messages logged for this thread.
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.from === "pharmacy";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "76%",
                  padding: "12px 16px",
                  borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: isMe ? "#15803D" : "#FFFFFF",
                  color: isMe ? "#FFFFFF" : "rgb(30,30,35)",
                  border: isMe ? "none" : "1px solid rgba(0,0,0,0.08)",
                  boxShadow: isMe ? "0 2px 8px rgba(21,128,61,0.2)" : "0 1px 3px rgba(0,0,0,0.03)",
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
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {isMe ? (
                    <>
                      <Building2 style={{ width: 10, height: 10 }} /> You (Pharmacy)
                    </>
                  ) : m.from === "patient" ? (
                    <>
                      <User style={{ width: 11, height: 11, color: "#2563EB" }} /> Patient ({thread.patientName})
                    </>
                  ) : (
                    <>
                      <Stethoscope style={{ width: 11, height: 11, color: "#9333EA" }} /> Dr. Marcus Chen (Provider)
                    </>
                  )}
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

      {/* Compose */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.07)",
          padding: "14px 20px",
          background: "rgba(250,250,250,0.9)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>Recipient:</span>
            {(["patient", "provider"] as const).map(r => {
              const active = recipient === r;
              return (
                <button
                  key={r}
                  onClick={() => setRecipient(r)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    border: `1px solid ${active ? "rgb(18,19,23)" : "rgba(0,0,0,0.1)"}`,
                    background: active ? "rgb(18,19,23)" : "#FFFFFF",
                    color: active ? "#FFFFFF" : "rgb(80,80,85)",
                    fontSize: "11.5px",
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                  }}
                >
                  {r === "patient" ? <User style={{ width: 11, height: 11 }} /> : <Stethoscope style={{ width: 11, height: 11 }} />}
                  {r === "patient" ? "Patient" : "Provider"}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={2}
            placeholder={`Reply to ${recipient === "patient" ? thread.patientName : "Dr. Chen"}…`}
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
              fontSize: "13.5px",
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
            <Send style={{ width: 13, height: 13 }} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PharmacyPage() {
  const [threads, setThreads] = useState<RefillThread[]>([]);
  const [active, setActive] = useState<RefillThread | null>(null);
  const [unread, setUnread] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [notifPanel, setNotifPanel] = useState(false);
  const [notifs, setNotifs] = useState<ReturnType<typeof getNotifications>>([]);
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
    setCurrentRole("pharmacy");
    const ts = getThreads();
    setThreads(ts);
    // Auto-select first pending refill thread so user never has to search
    setActive(prev => {
      if (prev) return ts.find(t => t.id === prev.id) ?? ts[0];
      return ts.find(t => t.status === "pending_pharmacy") ?? ts[0];
    });
    setUnread(countUnread("pharmacy"));
    setNotifCount(countUnreadNotifs("pharmacy"));
    setNotifs(getNotifications("pharmacy"));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 2500); return () => clearInterval(iv); }, []);
  useEffect(() => {
    setUnread(countUnread("pharmacy"));
    setNotifCount(countUnreadNotifs("pharmacy"));
  }, [tick]);

  const pending = threads.filter(t => t.status === "pending_pharmacy" || t.status === "pending_provider");
  const resolved = threads.filter(t => t.status === "approved" || t.status === "resolved" || t.status === "blocked");

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
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <img
                src="/icon.png"
                alt="UnStuck Med Logo"
                style={{ width: "24px", height: "24px", objectFit: "contain", display: "inline-block" }}
              />
              <span>UnStuck Med</span>
            </Link>
            <RoleSwitcher current="pharmacy" />
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
                color: "#15803D",
              }}
            >
              <Building2 style={{ width: 12, height: 12 }} />
              Summit Rx — Central Fill
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
                  color: resetting ? "#15803D" : "rgb(80,80,85)",
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
            Pharmacy Activity Log
          </div>
          <div style={{ maxHeight: "320px", overflowY: "auto" }}>
            {notifs.length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
                No notifications yet.
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
              { label: "Action Needed", value: pending.length, color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
              { label: "Unread Msgs",  value: unread,         color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
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
                color: "#92400E",
                textTransform: "uppercase",
                fontFamily: "ui-monospace, monospace",
                letterSpacing: "0.06em",
              }}
            >
              Action Required Queue
            </div>
            {pending.length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>
                Queue is clear — no pending items.
              </div>
            )}
            <div>
              {pending.map(t => {
                const u = getInboxMessages("pharmacy").filter(m => m.threadId === t.id && !m.read).length;
                const isSelected = active?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActive(t);
                      if (t.status === "pending_pharmacy") pharmacyStarted(t.id);
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
                      {u > 0 && (
                        <span
                          style={{
                            background: "#15803D",
                            color: "#FFFFFF",
                            borderRadius: "9999px",
                            fontSize: "9.5px",
                            fontWeight: 700,
                            padding: "1px 7px",
                          }}
                        >
                          {u}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#6B7280", marginBottom: "6px" }}>{t.patientName}</div>
                    <StatusChip status={t.status} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Completed Queue */}
          {resolved.length > 0 && (
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
                Resolved / Forwarded
              </div>
              <div>
                {resolved.map(t => (
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
            <ThreadPanel thread={active} onClose={() => setActive(null)} onRefresh={load} />
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
                <MessageSquare style={{ width: 26, height: 26 }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: "16px", color: "rgb(18,19,23)", letterSpacing: "-0.01em" }}>
                Pharmacy Intake Queue
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
