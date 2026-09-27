"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Send, RefreshCw, Bell, CheckCircle, Clock, AlertCircle, Zap } from "lucide-react";
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
  condition: "Type 2 Diabetes · Hypertension · Hypercholesterolemia",
  allergies: "Sulfa drugs",
  insuranceId: "Aetna AET-88124-X",
};

function StatusChip({ status }: { status: RefillThread["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending_pharmacy: { label: "Pending at Pharmacy", color: "#92400E", bg: "#FFFBEB" },
    pending_provider: { label: "Awaiting Provider",   color: "#1E40AF", bg: "#EFF6FF" },
    approved:         { label: "Approved ✓",           color: "#166534", bg: "#F0FDF4" },
    blocked:          { label: "Visit Required",       color: "#DC2626", bg: "#FEF2F2" },
    resolved:         { label: "Processed ✓",          color: "#166534", bg: "#F0FDF4" },
  };
  const c = map[status] ?? { label: status, color: "#6E7681", bg: "#F3F4F6" };
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}33`, borderRadius: "999px", padding: "2px 10px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {status === "approved" || status === "resolved" ? <CheckCircle style={{ width: 10, height: 10 }} /> : status === "pending_pharmacy" ? <Clock style={{ width: 10, height: 10 }} /> : <AlertCircle style={{ width: 10, height: 10 }} />}
      {c.label}
    </span>
  );
}

function JourneyTracker({ thread }: { thread: RefillThread }) {
  const stages = [
    { id: "request",  label: "Requested",      Icon: CheckCircle, done: true,  active: false, blocked: false },
    { id: "pharmacy", label: "Pharmacy",        Icon: Building2,
      done: thread.status !== "pending_pharmacy",
      active: thread.status === "pending_pharmacy",
      blocked: false },
    { id: "provider", label: "Provider Review", Icon: Stethoscope,
      done: thread.status === "approved" || thread.status === "resolved",
      active: thread.status === "pending_provider",
      blocked: thread.status === "blocked" },
    { id: "ready",    label: "Ready",           Icon: CheckCircle,
      done: thread.status === "approved" || thread.status === "resolved",
      active: false,
      blocked: false },
  ];

  const defaultStep: Record<string, string> = {
    pending_pharmacy: "Your pharmacy is checking prescription eligibility.",
    pending_provider: "Dr. Chen is reviewing your prescription. You will be notified when a decision is made.",
    approved:  "Approved. Your pharmacy is preparing your prescription.",
    resolved:  "Processed as a routine refill — your prescription is ready.",
    blocked:   "A clinic visit is required before your refill can be renewed.",
  };
  const currentStep = thread.statusStep ?? defaultStep[thread.status] ?? "Your refill is in progress.";

  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "14px" }}>
        {stages.map((stage, idx) => (
          <React.Fragment key={stage.id}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 0 }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid", flexShrink: 0, zIndex: 1, transition: "all 0.3s",
                borderColor: stage.blocked ? "#DC2626" : stage.done ? "#15803D" : stage.active ? "#1D4ED8" : "#E5E7EB",
                background: stage.blocked ? "#FEF2F2" : stage.done ? "#F0FDF4" : stage.active ? "#EFF6FF" : "#FAFAFA",
                boxShadow: stage.active ? "0 0 0 4px rgba(29,78,216,0.12)" : "none",
              }}>
                {stage.blocked
                  ? <AlertTriangle style={{ width: 12, height: 12, color: "#DC2626" }} />
                  : stage.done
                  ? <CheckCircle style={{ width: 12, height: 12, color: "#15803D" }} />
                  : <stage.Icon style={{ width: 12, height: 12, color: stage.active ? "#1D4ED8" : "#C9D1D9" }} />
                }
              </div>
              <div style={{ marginTop: "5px", fontSize: "9.5px", fontWeight: stage.active || stage.done ? 700 : 400, color: stage.blocked ? "#DC2626" : stage.done ? "#15803D" : stage.active ? "#1D4ED8" : "#C9D1D9", textAlign: "center", maxWidth: "60px" }}>
                {stage.label}
              </div>
            </div>
            {idx < stages.length - 1 && (
              <div style={{ height: "2px", flex: 1, alignSelf: "flex-start", marginTop: "15px", background: stages[idx + 1].done || stages[idx + 1].active ? "#15803D" : "#E5E7EB", transition: "background 0.3s" }} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ background: thread.status === "blocked" ? "#FEF2F2" : (thread.status === "approved" || thread.status === "resolved") ? "#F0FDF4" : "#EFF6FF", border: `1px solid ${thread.status === "blocked" ? "#FECACA" : (thread.status === "approved" || thread.status === "resolved") ? "#BBF7D0" : "#BFDBFE"}`, borderRadius: "10px", padding: "10px 14px", display: "flex", gap: "8px" }}>
        <div style={{ flexShrink: 0, marginTop: "1px" }}>
          {thread.status === "blocked"
            ? <AlertTriangle style={{ width: 14, height: 14, color: "#DC2626" }} />
            : (thread.status === "approved" || thread.status === "resolved")
            ? <CheckCircle style={{ width: 14, height: 14, color: "#15803D" }} />
            : <Info style={{ width: 14, height: 14, color: "#1D4ED8" }} />
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "9.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px", color: thread.status === "blocked" ? "#DC2626" : (thread.status === "approved" || thread.status === "resolved") ? "#15803D" : "#1D4ED8" }}>
            Current status
          </div>
          <div style={{ fontSize: "12.5px", color: "#374151", lineHeight: 1.5, marginBottom: thread.eta ? "6px" : 0 }}>
            {currentStep}
          </div>
          {thread.eta && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: (thread.status === "approved" || thread.status === "resolved") ? "#D1FAE5" : "#DBEAFE", border: `1px solid ${(thread.status === "approved" || thread.status === "resolved") ? "#6EE7B7" : "#93C5FD"}`, borderRadius: "999px", padding: "2px 10px", fontSize: "11px", fontWeight: 700, color: (thread.status === "approved" || thread.status === "resolved") ? "#065F46" : "#1E40AF" }}>
              <Clock style={{ width: 10, height: 10 }} />
              ETA: {thread.eta}
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
    setTimeout(() => { setSending(false); load(); onRefresh(); }, 300);
  }

  // Demo prompts for this thread
  const prompts = PATIENT_DEMO_PROMPTS.filter(p => p.threadId === thread.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: "12px", background: "#FAFAFA", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "5px 8px", cursor: "pointer", display: "flex" }}>
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117" }}>{thread.med} ({thread.id})</div>
          <div style={{ fontSize: "11px", color: "#6E7681" }}>{thread.dose}</div>
        </div>
        <StatusChip status={thread.status} />
      </div>

      {/* Journey tracker */}
      <JourneyTracker thread={thread} />

      {/* Demo quick-send buttons */}
      {prompts.length > 0 && messages.filter(m => m.from === "patient").length === 0 && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA", flexShrink: 0 }}>
          <div style={{ fontSize: "10px", color: "#C9D1D9", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
            Quick demo messages
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {prompts.map(p => (
              <button key={p.label} onClick={() => handleSend(p.text)}
                style={{ padding: "5px 12px", borderRadius: "999px", border: "1px solid #E5E7EB", background: "rgb(18,19,23)", color: "#fff", fontSize: "11.5px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                {p.label} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ textAlign: "center" }}><span style={{ fontSize: "10px", color: "#E5E7EB", fontWeight: 500 }}>Messages with your care team</span></div>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#C9D1D9", fontSize: "13px", paddingTop: "12px" }}>
            No messages yet — use a quick demo button above or type below.
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.from === "patient";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMe ? "#0D1117" : "#F3F4F6", color: isMe ? "#fff" : "#0D1117", fontSize: "13px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600, fontSize: "9.5px", marginBottom: "3px", opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {isMe ? "You" : m.from === "pharmacy" ? "💊 Pharmacy" : "🩺 Provider"}
                </div>
                {m.text}
                <div style={{ fontSize: "9.5px", opacity: 0.45, marginTop: "4px", textAlign: "right" }}>{timeAgo(m.timestamp)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div style={{ borderTop: "1px solid #E5E7EB", padding: "10px 14px", background: "#FAFAFA", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "7px" }}>
          <span style={{ fontSize: "11px", color: "#6E7681", fontWeight: 500, alignSelf: "center" }}>To:</span>
          {(["pharmacy", "provider"] as const).map((r) => (
            <button key={r} onClick={() => setRecipient(r)}
              style={{ padding: "3px 12px", borderRadius: "999px", border: "1px solid", borderColor: recipient === r ? "rgb(18,19,23)" : "#E5E7EB", background: recipient === r ? "rgb(18,19,23)" : "#fff", color: recipient === r ? "#fff" : "#6E7681", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {r === "pharmacy" ? "💊 Pharmacy" : "🩺 Provider"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={`Message the ${recipient}…`}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            style={{ flex: 1, resize: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" }} />
          <button onClick={() => handleSend()} disabled={!text.trim() || sending}
            style={{ background: text.trim() ? "rgb(18,19,23)" : "#E5E7EB", color: "#fff", border: "none", borderRadius: "8px", padding: "0 16px", cursor: text.trim() ? "pointer" : "default", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
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
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: '"Inter","Sora",sans-serif' }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, height: "52px", background: "rgba(240,240,240,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", padding: "0 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117", textDecoration: "none", letterSpacing: "-0.02em", flexShrink: 0 }}>UnStuck Med</Link>
          <span style={{ color: "#E5E7EB" }}>|</span>
          <RoleSwitcher current="patient" />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ padding: "3px 10px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "999px", fontSize: "11px", fontWeight: 600, color: "#1D4ED8" }}>
              {PATIENT_NAME}
            </div>
            <button onClick={() => setNotifPanel(p => !p)} style={{ position: "relative", background: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "5px 8px", cursor: "pointer", display: "flex" }}>
              <Bell style={{ width: 14, height: 14, color: "#6E7681" }} />
              {notifCount > 0 && <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#DC2626", color: "#fff", borderRadius: "999px", fontSize: "9px", fontWeight: 700, width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>{notifCount}</span>}
            </button>
            <button onClick={load} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "5px 8px", cursor: "pointer", display: "flex" }}>
              <RefreshCw style={{ width: 13, height: 13, color: "#6E7681" }} />
            </button>
          </div>
        </div>
      </nav>

      {notifPanel && (
        <div style={{ position: "fixed", top: "60px", right: "24px", zIndex: 200, background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: "300px", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, fontSize: "13px" }}>Notifications</div>
          {notifs.length === 0 && <div style={{ padding: "24px", textAlign: "center", color: "#C9D1D9", fontSize: "13px" }}>No notifications</div>}
          {notifs.map(n => (
            <div key={n.id} style={{ padding: "10px 16px", borderBottom: "1px solid #F3F4F6", fontSize: "12.5px", color: "#374151" }}>
              <div>{n.text}</div>
              <div style={{ fontSize: "10px", color: "#C9D1D9", marginTop: "3px" }}>{timeAgo(n.timestamp)}</div>
            </div>
          ))}
        </div>
      )}

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "270px 1fr", gap: "20px", minHeight: "calc(100vh - 52px)" }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Profile */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>👤</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117" }}>{PATIENT_NAME}</div>
                <div style={{ fontSize: "10.5px", color: "#6E7681" }}>DOB: {PATIENT_DEMO.dob}</div>
              </div>
            </div>
            {[
              { label: "Condition", value: PATIENT_DEMO.condition },
              { label: "Allergies", value: PATIENT_DEMO.allergies },
              { label: "Insurance", value: PATIENT_DEMO.insuranceId },
            ].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: "7px" }}>
                <div style={{ fontSize: "9.5px", fontWeight: 600, color: "#C9D1D9", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1px" }}>{label}</div>
                <div style={{ fontSize: "11.5px", color: "#374151", fontWeight: 500, lineHeight: 1.4 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Prescription list */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontWeight: 700, fontSize: "13px", color: "#0D1117", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              My Prescriptions
              {unreadCount > 0 && <span style={{ background: "#DC2626", color: "#fff", borderRadius: "999px", fontSize: "10px", fontWeight: 700, padding: "1px 7px" }}>{unreadCount} new</span>}
            </div>
            {threads.map(t => {
              const msgs = getThreadMessages(t.id).filter(m => m.from === "patient" || m.to === "patient");
              const unread = msgs.filter(m => m.to === "patient" && !m.read).length;
              return (
                <button key={t.id} onClick={() => setActiveThread(t)}
                  style={{ width: "100%", background: activeThread?.id === t.id ? "#F0F0F0" : "#fff", border: "none", borderBottom: "1px solid #F3F4F6", padding: "12px 16px", textAlign: "left", cursor: "pointer", transition: "background 0.12s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px" }}>
                    <span style={{ fontWeight: 600, fontSize: "12.5px", color: "#0D1117" }}>{t.med}</span>
                    {unread > 0 && <span style={{ background: "#1D4ED8", color: "#fff", borderRadius: "999px", fontSize: "9px", fontWeight: 700, padding: "1px 6px", flexShrink: 0 }}>{unread}</span>}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#6E7681", marginBottom: "5px" }}>{t.dose}</div>
                  <StatusChip status={t.status} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Main panel */}
        <div style={{ minHeight: "500px" }}>
          {activeThread ? (
            <ThreadView thread={activeThread} onBack={() => setActiveThread(null)} onRefresh={load} />
          ) : (
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <div style={{ fontSize: "32px" }}>💊</div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#0D1117" }}>Select a prescription</div>
              <div style={{ fontSize: "13px", color: "#6E7681", textAlign: "center", maxWidth: "240px" }}>
                Click a refill on the left to view its journey and message your care team.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
