"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Send, Bell, RefreshCw, Zap, MessageSquare, CheckCircle } from "lucide-react";
import {
  seedDemoData, getThreads, getThreadMessages, getInboxMessages, addMessage,
  markMessagesRead, getNotifications, countUnread, countUnreadNotifs,
  pharmacyProcessRefill, timeAgo, setCurrentRole,
  type Message, type RefillThread,
} from "../../lib/demo-messages";
import { RoleSwitcher } from "../components/RoleSwitcher";

function StatusChip({ status }: { status: RefillThread["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending_pharmacy: { label: "Pending — Action Needed", color: "#92400E", bg: "#FFFBEB" },
    pending_provider: { label: "Forwarded to Provider",  color: "#1E40AF", bg: "#EFF6FF" },
    approved:         { label: "Approved ✓",              color: "#166534", bg: "#F0FDF4" },
    blocked:          { label: "Visit Required",          color: "#DC2626", bg: "#FEF2F2" },
    resolved:         { label: "Processed ✓",             color: "#166534", bg: "#F0FDF4" },
  };
  const c = map[status] ?? { label: status, color: "#6E7681", bg: "#F3F4F6" };
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}33`, borderRadius: "999px", padding: "2px 10px", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center" }}>
      {c.label}
    </span>
  );
}

function ThreadPanel({ thread, onClose, onRefresh }: { thread: RefillThread; onClose: () => void; onRefresh: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
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

  function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    addMessage({ from: "pharmacy", to: recipient, text: text.trim(), threadId: thread.id });
    setText("");
    setTimeout(() => { setSending(false); load(); onRefresh(); }, 300);
  }

  function handleProcess() {
    setProcessing(true);
    const { result } = pharmacyProcessRefill(thread.id);
    const msg = result.priority === "routine"
      ? `✅ ROUTINE REFILL — Processed automatically. Patient notified. Added to completed worklist.`
      : `⚠️ REVIEW REQUIRED — ${result.reason}${result.alternative ? ` Alternative flagged: ${result.alternative}.` : ""} Forwarded to Dr. Chen.`;
    setProcessResult(msg);
    setTimeout(() => { setProcessing(false); load(); onRefresh(); }, 500);
  }

  const canProcess = thread.status === "pending_pharmacy";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #E5E7EB", background: "#FAFAFA", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "5px 8px", cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117" }}>{thread.med} ({thread.id})</div>
          <div style={{ fontSize: "11px", color: "#6E7681" }}>Patient: {thread.patientName} · {thread.dose}</div>
        </div>
        <StatusChip status={thread.status} />
      </div>

      {/* Process Refill action panel */}
      {canProcess && (
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #E5E7EB", background: "#FFFBEB", flexShrink: 0 }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            ⚡ Refill Action Required
          </div>
          <div style={{ fontSize: "12.5px", color: "#374151", marginBottom: "10px", lineHeight: 1.5 }}>
            Patient is requesting a refill for <strong>{thread.med}</strong>. Click below to classify and route automatically.
          </div>
          <button
            onClick={handleProcess}
            disabled={processing}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", borderRadius: "9999px",
              background: processing ? "#E5E7EB" : "rgb(18,19,23)",
              color: "#fff", border: "none", cursor: processing ? "default" : "pointer",
              fontSize: "13px", fontWeight: 700, letterSpacing: "-0.01em",
            }}
          >
            <Zap style={{ width: 13, height: 13 }} />
            {processing ? "Processing…" : "Process & Route Refill →"}
          </button>
          {processResult && (
            <div style={{ marginTop: "10px", padding: "10px 14px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "12.5px", color: "#374151", lineHeight: 1.5 }}>
              {processResult}
            </div>
          )}
        </div>
      )}

      {/* Clinical summary (if forwarded to provider) */}
      {thread.summaryVisible && thread.clinicalSummary && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #BFDBFE", background: "#EFF6FF", flexShrink: 0 }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
            Clinical Summary — Sent to Provider
          </div>
          <div style={{ fontSize: "12px", color: "#1E3A8A", lineHeight: 1.5 }}>{thread.clinicalSummary}</div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.length === 0 && <div style={{ textAlign: "center", color: "#C9D1D9", fontSize: "13px", paddingTop: "24px" }}>No messages yet.</div>}
        {messages.map((m) => {
          const isMe = m.from === "pharmacy";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMe ? "#15803D" : "#F3F4F6", color: isMe ? "#fff" : "#0D1117", fontSize: "13px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600, fontSize: "9.5px", marginBottom: "3px", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {isMe ? "Pharmacy" : m.from === "patient" ? "Patient" : "Provider"}
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
          <span style={{ fontSize: "11px", color: "#6E7681", fontWeight: 500, alignSelf: "center" }}>Reply to:</span>
          {(["patient", "provider"] as const).map(r => (
            <button key={r} onClick={() => setRecipient(r)}
              style={{ padding: "3px 12px", borderRadius: "999px", border: "1px solid", borderColor: recipient === r ? "rgb(18,19,23)" : "#E5E7EB", background: recipient === r ? "rgb(18,19,23)" : "#fff", color: recipient === r ? "#fff" : "#6E7681", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {r === "patient" ? "Patient" : "Provider"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={2}
            placeholder={`Reply to ${recipient}…`}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            style={{ flex: 1, resize: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" }} />
          <button onClick={handleSend} disabled={!text.trim() || sending}
            style={{ background: text.trim() ? "rgb(18,19,23)" : "#E5E7EB", color: "#fff", border: "none", borderRadius: "8px", padding: "0 16px", cursor: text.trim() ? "pointer" : "default", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 }}>
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

  function load() {
    seedDemoData();
    setCurrentRole("pharmacy");
    const ts = getThreads();
    setThreads(ts);
    if (active) setActive(ts.find(t => t.id === active.id) ?? null);
    setUnread(countUnread("pharmacy"));
    setNotifCount(countUnreadNotifs("pharmacy"));
    setNotifs(getNotifications("pharmacy"));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 2500); return () => clearInterval(iv); }, []);
  useEffect(() => { setUnread(countUnread("pharmacy")); setNotifCount(countUnreadNotifs("pharmacy")); }, [tick]);

  const pending  = threads.filter(t => t.status === "pending_pharmacy" || t.status === "pending_provider");
  const resolved = threads.filter(t => t.status === "approved" || t.status === "resolved" || t.status === "blocked");

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: '"Inter","Sora",sans-serif' }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 50, height: "52px", background: "rgba(240,240,240,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", padding: "0 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117", textDecoration: "none", letterSpacing: "-0.02em", flexShrink: 0 }}>UnStuck Med</Link>
          <span style={{ color: "#E5E7EB" }}>|</span>
          <RoleSwitcher current="pharmacy" />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ padding: "2px 10px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "999px", fontSize: "11px", fontWeight: 600, color: "#15803D" }}>Summit Rx</span>
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
            <div key={n.id} style={{ padding: "10px 16px", borderBottom: "1px solid #F3F4F6", fontSize: "12px", color: "#374151" }}>
              <div>{n.text}</div>
              <div style={{ fontSize: "10px", color: "#C9D1D9", marginTop: "3px" }}>{timeAgo(n.timestamp)}</div>
            </div>
          ))}
        </div>
      )}

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", minHeight: "calc(100vh - 52px)" }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[{ label: "Pending", value: pending.length, color: "#B45309", bg: "#FFFBEB" }, { label: "Unread", value: unread, color: "#1E40AF", bg: "#EFF6FF" }].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: "12px", padding: "12px 14px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color, letterSpacing: "-0.04em" }}>{value}</div>
                <div style={{ fontSize: "10px", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "11px 15px", borderBottom: "1px solid #F3F4F6", fontWeight: 700, fontSize: "11px", color: "#B45309", textTransform: "uppercase", letterSpacing: "0.05em" }}>Action Required</div>
            {pending.length === 0 && <div style={{ padding: "18px", textAlign: "center", color: "#C9D1D9", fontSize: "12px" }}>All clear</div>}
            {pending.map(t => {
              const u = getInboxMessages("pharmacy").filter(m => m.threadId === t.id && !m.read).length;
              return (
                <button key={t.id} onClick={() => setActive(t)}
                  style={{ width: "100%", background: active?.id === t.id ? "#F0F0F0" : "#fff", border: "none", borderBottom: "1px solid #F3F4F6", padding: "11px 15px", textAlign: "left", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <span style={{ fontWeight: 600, fontSize: "12.5px", color: "#0D1117" }}>{t.med}</span>
                    {u > 0 && <span style={{ background: "#15803D", color: "#fff", borderRadius: "999px", fontSize: "9px", fontWeight: 700, padding: "1px 6px" }}>{u}</span>}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#6E7681", marginBottom: "5px" }}>{t.patientName}</div>
                  <StatusChip status={t.status} />
                </button>
              );
            })}
          </div>

          {resolved.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "11px 15px", borderBottom: "1px solid #F3F4F6", fontWeight: 700, fontSize: "11px", color: "#6E7681", textTransform: "uppercase", letterSpacing: "0.05em" }}>Completed</div>
              {resolved.map(t => (
                <button key={t.id} onClick={() => setActive(t)}
                  style={{ width: "100%", background: active?.id === t.id ? "#F0F0F0" : "#fff", border: "none", borderBottom: "1px solid #F3F4F6", padding: "11px 15px", textAlign: "left", cursor: "pointer" }}>
                  <div style={{ fontWeight: 600, fontSize: "12.5px", color: "#0D1117", marginBottom: "2px" }}>{t.med}</div>
                  <div style={{ fontSize: "10.5px", color: "#6E7681" }}>{t.patientName}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main */}
        <div>
          {active ? (
            <ThreadPanel thread={active} onClose={() => setActive(null)} onRefresh={load} />
          ) : (
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <MessageSquare style={{ width: 28, height: 28, color: "#C9D1D9" }} />
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#0D1117" }}>Pharmacy Queue</div>
              <div style={{ fontSize: "13px", color: "#6E7681", textAlign: "center", maxWidth: "240px" }}>
                {pending.length > 0 ? `${pending.length} refill(s) need your attention. Click to open.` : "No pending actions. All refills processed."}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
