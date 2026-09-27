"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Send, RefreshCw, Bell, CheckCircle2, Clock, AlertCircle, AlertTriangle,
  Info, Building2, Stethoscope, User, Pill, ArrowRight, ShieldCheck
} from "lucide-react";
import {
  seedDemoData, getThreads, getThreadMessages, addMessage, markMessagesRead,
  getNotifications, countUnread, countUnreadNotifs, timeAgo, setCurrentRole,
  PATIENT_DEMO_PROMPTS,
  type Message, type RefillThread,
} from "../../lib/demo-messages";
import { RoleSwitcher } from "../components/RoleSwitcher";

const PATIENT_NAME = "Alex Rivera";
const PATIENT_DEMO = {
  dob: "1978-04-12",
  condition: "Type 2 Diabetes · Hypertension",
  allergies: "Sulfa drugs",
  insuranceId: "Aetna AET-88124-X",
};

function StatusChip({ status }: { status: RefillThread["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending_pharmacy: { label: "Pending at Pharmacy", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
    pending_provider: { label: "Awaiting Provider",   color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
    approved:         { label: "Approved",            color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
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
        letterSpacing: "-0.01em",
      }}
    >
      {status === "approved" || status === "resolved" ? (
        <CheckCircle2 style={{ width: 11, height: 11 }} />
      ) : status === "pending_pharmacy" ? (
        <Clock style={{ width: 11, height: 11 }} />
      ) : status === "blocked" ? (
        <AlertTriangle style={{ width: 11, height: 11 }} />
      ) : (
        <Info style={{ width: 11, height: 11 }} />
      )}
      {c.label}
    </span>
  );
}

function JourneyTracker({ thread }: { thread: RefillThread }) {
  const stages = [
    { id: "request",  label: "Requested", Icon: CheckCircle2, done: true,  active: false, blocked: false },
    {
      id: "pharmacy", label: "Pharmacy Review", Icon: Building2,
      done: thread.status !== "pending_pharmacy",
      active: thread.status === "pending_pharmacy",
      blocked: false,
    },
    {
      id: "provider", label: "Provider Review", Icon: Stethoscope,
      done: thread.status === "approved" || thread.status === "resolved",
      active: thread.status === "pending_provider",
      blocked: thread.status === "blocked",
    },
    {
      id: "ready", label: "Ready for Pickup", Icon: Pill,
      done: thread.status === "approved" || thread.status === "resolved",
      active: false,
      blocked: false,
    },
  ];

  const defaultStep: Record<string, string> = {
    pending_pharmacy: "Your pharmacy is reviewing your prescription eligibility and inventory.",
    pending_provider: "Forwarded to Dr. Marcus Chen for clinical sign-off. You will be alerted the moment it's processed.",
    approved:  "Approved by provider. Pharmacy is preparing your prescription now.",
    resolved:  "Processed automatically — your prescription is ready for pickup.",
    blocked:   "A routine follow-up clinic visit is required before renewal.",
  };
  const currentStep = thread.statusStep ?? defaultStep[thread.status] ?? "Refill request in progress.";

  return (
    <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.6)" }}>
      {/* Stepper Header */}
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "16px" }}>
        {stages.map((stage, idx) => {
          const isDone = stage.done;
          const isActive = stage.active;
          const isBlocked = stage.blocked;
          return (
            <React.Fragment key={stage.id}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid",
                    flexShrink: 0,
                    zIndex: 1,
                    transition: "all 0.25s ease",
                    borderColor: isBlocked ? "#DC2626" : isDone ? "#15803D" : isActive ? "rgb(18,19,23)" : "rgba(0,0,0,0.12)",
                    background: isBlocked ? "#FEF2F2" : isDone ? "#F0FDF4" : isActive ? "rgb(18,19,23)" : "#FFFFFF",
                    boxShadow: isActive ? "0 0 0 4px rgba(18,19,23,0.1)" : "none",
                  }}
                >
                  {isBlocked ? (
                    <AlertTriangle style={{ width: 14, height: 14, color: "#DC2626" }} />
                  ) : isDone ? (
                    <CheckCircle2 style={{ width: 14, height: 14, color: "#15803D" }} />
                  ) : (
                    <stage.Icon style={{ width: 14, height: 14, color: isActive ? "#FFFFFF" : "#9CA3AF" }} />
                  )}
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "10.5px",
                    fontWeight: isActive || isDone ? 600 : 500,
                    color: isBlocked ? "#DC2626" : isDone ? "#15803D" : isActive ? "rgb(18,19,23)" : "#9CA3AF",
                    textAlign: "center",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {stage.label}
                </div>
              </div>
              {idx < stages.length - 1 && (
                <div
                  style={{
                    height: "2px",
                    flex: 1,
                    alignSelf: "flex-start",
                    marginTop: "17px",
                    background: stages[idx + 1].done || stages[idx + 1].active ? "#15803D" : "rgba(0,0,0,0.1)",
                    transition: "background 0.3s ease",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Live Status Callout Box */}
      <div
        style={{
          background: thread.status === "blocked" ? "#FEF2F2" : (thread.status === "approved" || thread.status === "resolved") ? "#F0FDF4" : "#FFFFFF",
          border: `1px solid ${thread.status === "blocked" ? "#FECACA" : (thread.status === "approved" || thread.status === "resolved") ? "#BBF7D0" : "rgba(0,0,0,0.08)"}`,
          borderRadius: "14px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <div style={{ flexShrink: 0, marginTop: "2px" }}>
          {thread.status === "blocked" ? (
            <AlertTriangle style={{ width: 16, height: 16, color: "#DC2626" }} />
          ) : (thread.status === "approved" || thread.status === "resolved") ? (
            <CheckCircle2 style={{ width: 16, height: 16, color: "#15803D" }} />
          ) : (
            <Clock style={{ width: 16, height: 16, color: "#2563EB" }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "10px",
              fontFamily: "ui-monospace, monospace",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "3px",
              color: thread.status === "blocked" ? "#DC2626" : (thread.status === "approved" || thread.status === "resolved") ? "#15803D" : "#2563EB",
            }}
          >
            Live Tracking
          </div>
          <div style={{ fontSize: "13px", color: "rgb(40,40,45)", lineHeight: 1.5, fontWeight: 500 }}>
            {currentStep}
          </div>
          {thread.eta && (
            <div style={{ marginTop: "6px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "rgb(18,19,23)",
                  color: "#FFFFFF",
                  borderRadius: "9999px",
                  padding: "3px 12px",
                  fontSize: "11px",
                  fontFamily: "ui-monospace, monospace",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                <Clock style={{ width: 11, height: 11 }} />
                ESTIMATED PICKUP: {thread.eta}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadView({ thread, onBack, onRefresh }: { thread: RefillThread; onBack: () => void; onRefresh: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState<"pharmacy" | "provider">("pharmacy");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    const msgs = getThreadMessages(thread.id);
    setMessages(msgs.filter((m) => m.from === "patient" || m.to === "patient"));
    markMessagesRead("patient", thread.id);
  }, [thread.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleSend(msgText?: string) {
    const t = msgText ?? text;
    if (!t.trim()) return;
    setSending(true);
    addMessage({ from: "patient", to: recipient, text: t.trim(), threadId: thread.id });
    setText("");
    setTimeout(() => { setSending(false); load(); onRefresh(); }, 250);
  }

  const prompts = PATIENT_DEMO_PROMPTS.filter(p => p.threadId === thread.id);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#FFFFFF",
        borderRadius: "20px",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 12px 28px -6px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
    >
      {/* Thread Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          background: "rgba(250,250,250,0.8)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
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
          ← Prescriptions
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "15px", color: "rgb(18,19,23)", letterSpacing: "-0.01em" }}>
            {thread.med} <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 400 }}>({thread.id})</span>
          </div>
          <div style={{ fontSize: "12px", color: "#6B7280" }}>{thread.dose}</div>
        </div>
        <StatusChip status={thread.status} />
      </div>

      {/* Stepper & Live status */}
      <JourneyTracker thread={thread} />

      {/* Interactive Quick Prompts */}
      {prompts.length > 0 && messages.filter(m => m.from === "patient").length === 0 && (
        <div
          style={{
            padding: "12px 20px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            background: "#FAFAFA",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontFamily: "ui-monospace, monospace",
              color: "#6B7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
            }}
          >
            Quick 1-Click Demo Prompts
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {prompts.map(p => (
              <button
                key={p.label}
                onClick={() => handleSend(p.text)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  border: "none",
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
                {p.label} <ArrowRight style={{ width: 12, height: 12 }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: "12px", background: "#FCFCFC" }}>
        <div style={{ textAlign: "center", margin: "4px 0" }}>
          <span style={{ fontSize: "10.5px", fontFamily: "ui-monospace, monospace", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Direct Secure Channel · Care Team & Pharmacy
          </span>
        </div>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: "13px", padding: "28px 0" }}>
            No messages sent yet. Use a 1-click prompt above or type a message below.
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.from === "patient";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "76%",
                  padding: "12px 16px",
                  borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: isMe ? "rgb(18, 19, 23)" : "#FFFFFF",
                  color: isMe ? "#FFFFFF" : "rgb(30, 30, 35)",
                  border: isMe ? "none" : "1px solid rgba(0,0,0,0.08)",
                  boxShadow: isMe ? "0 2px 8px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.03)",
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
                    opacity: isMe ? 0.6 : 0.75,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {isMe ? (
                    <>
                      <User style={{ width: 10, height: 10 }} /> You (Patient)
                    </>
                  ) : m.from === "pharmacy" ? (
                    <>
                      <Building2 style={{ width: 11, height: 11, color: "#16A34A" }} /> Summit Rx Pharmacy
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

      {/* Compose Dock */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.07)",
          padding: "14px 20px",
          background: "rgba(250,250,250,0.9)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>Recipient:</span>
          {(["pharmacy", "provider"] as const).map((r) => {
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
                  transition: "all 0.15s ease",
                }}
              >
                {r === "pharmacy" ? <Building2 style={{ width: 11, height: 11 }} /> : <Stethoscope style={{ width: 11, height: 11 }} />}
                {r === "pharmacy" ? "Pharmacy" : "Provider"}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder={`Message ${recipient === "pharmacy" ? "Summit Rx" : "Dr. Chen"}…`}
            onKeyDown={(e) => {
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
              padding: "0 18px",
              cursor: text.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 600,
              transition: "all 0.15s ease",
            }}
          >
            <Send style={{ width: 13, height: 13 }} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PatientPage() {
  const [threads, setThreads] = useState<RefillThread[]>([]);
  const [activeThread, setActiveThread] = useState<RefillThread | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [notifPanel, setNotifPanel] = useState(false);
  const [notifs, setNotifs] = useState<ReturnType<typeof getNotifications>>([]);
  const [tick, setTick] = useState(0);

  function load() {
    seedDemoData();
    setCurrentRole("patient");
    const ts = getThreads();
    setThreads(ts);
    if (activeThread) setActiveThread(ts.find(t => t.id === activeThread.id) ?? null);
    setUnreadCount(countUnread("patient"));
    setNotifCount(countUnreadNotifs("patient"));
    setNotifs(getNotifications("patient"));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 2500); return () => clearInterval(iv); }, []);
  useEffect(() => {
    setUnreadCount(countUnread("patient"));
    setNotifCount(countUnreadNotifs("patient"));
    if (activeThread) {
      const ts = getThreads();
      setThreads(ts);
      setActiveThread(ts.find(t => t.id === activeThread.id) ?? null);
    }
  }, [tick]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F0F0F0",
        fontFamily: '"Google Sans", "Sora", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "rgb(18,19,23)",
      }}
    >
      {/* Top Navigation */}
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
            <RoleSwitcher current="patient" />
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
                color: "rgb(18,19,23)",
              }}
            >
              <User style={{ width: 12, height: 12, color: "#2563EB" }} />
              {PATIENT_NAME}
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
              onClick={load}
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
              }}
              title="Refresh"
            >
              <RefreshCw style={{ width: 13, height: 13, color: "rgb(80,80,85)" }} />
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
            Patient Live Activity
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

      {/* Main Workspace Layout */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "28px 32px",
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "24px",
          minHeight: "calc(100vh - 54px)",
        }}
      >
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Patient Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "20px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 10px 24px -6px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgb(18,19,23)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                }}
              >
                <User style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px", color: "rgb(18,19,23)", letterSpacing: "-0.01em" }}>
                  {PATIENT_NAME}
                </div>
                <div style={{ fontSize: "11px", color: "#6B7280" }}>DOB: {PATIENT_DEMO.dob}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Diagnoses", value: PATIENT_DEMO.condition },
                { label: "Documented Allergies", value: PATIENT_DEMO.allergies },
                { label: "Insurance Coverage", value: PATIENT_DEMO.insuranceId },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div
                    style={{
                      fontSize: "9.5px",
                      fontFamily: "ui-monospace, monospace",
                      fontWeight: 600,
                      color: "#9CA3AF",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "2px",
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgb(40,40,45)", fontWeight: 500, lineHeight: 1.4 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Prescriptions List */}
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
                fontSize: "14px",
                color: "rgb(18,19,23)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>My Prescriptions</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: "rgb(18,19,23)",
                    color: "#FFFFFF",
                    borderRadius: "9999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 8px",
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div>
              {threads.map(t => {
                const msgs = getThreadMessages(t.id).filter(m => m.from === "patient" || m.to === "patient");
                const unread = msgs.filter(m => m.to === "patient" && !m.read).length;
                const isSelected = activeThread?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveThread(t)}
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
                      {unread > 0 && (
                        <span
                          style={{
                            background: "#2563EB",
                            color: "#FFFFFF",
                            borderRadius: "9999px",
                            fontSize: "9.5px",
                            fontWeight: 700,
                            padding: "1px 7px",
                          }}
                        >
                          {unread}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#6B7280", marginBottom: "6px" }}>{t.dose}</div>
                    <StatusChip status={t.status} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Main Thread Area */}
        <div style={{ minHeight: "540px" }}>
          {activeThread ? (
            <ThreadView thread={activeThread} onBack={() => setActiveThread(null)} onRefresh={load} />
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
                <Pill style={{ width: 26, height: 26 }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: "16px", color: "rgb(18,19,23)", letterSpacing: "-0.01em" }}>
                Select a Prescription
              </div>
              <div style={{ fontSize: "13.5px", color: "#6B7280", textAlign: "center", maxWidth: "320px", lineHeight: 1.5 }}>
                Choose a medication from the list on the left to inspect its live journey, estimated pickup time, and message your care team.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
