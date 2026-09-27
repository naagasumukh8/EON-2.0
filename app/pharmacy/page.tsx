"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Send, Bell, RefreshCw, CheckCircle, Clock, AlertCircle, Zap, MessageSquare,
} from "lucide-react";
import {
  seedDemoData, getThreads, getThreadMessages, getInboxMessages, addMessage,
  markMessagesRead, getNotifications, markNotifRead, countUnread, countUnreadNotifs,
  updateThread, addNotification, timeAgo, setCurrentRole,
  type Message, type RefillThread,
} from "../../lib/demo-messages";
import { RoleSwitcher } from "../components/RoleSwitcher";

function StatusChip({ status }: { status: RefillThread["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending_pharmacy: { label: "Pending at Pharmacy", color: "#92400E", bg: "#FFFBEB" },
    pending_provider: { label: "Awaiting Provider", color: "#1E40AF", bg: "#EFF6FF" },
    approved:         { label: "Approved", color: "#166534", bg: "#F0FDF4" },
    blocked:          { label: "Blocked", color: "#DC2626", bg: "#FEF2F2" },
    resolved:         { label: "Resolved", color: "#4B5563", bg: "#F3F4F6" },
  };
  const c = map[status] ?? { label: status, color: "#6E7681", bg: "#F3F4F6" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.color}33`,
        borderRadius: "999px",
        padding: "2px 10px",
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

function ThreadPanel({
  thread,
  aiMode,
  onClose,
  onRefresh,
}: {
  thread: RefillThread;
  aiMode: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState<"patient" | "provider">("patient");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    const all = getThreadMessages(thread.id);
    // Pharmacy sees all messages except provider-to-provider
    setMessages(all.filter((m) => m.from !== "provider" || m.to === "pharmacy"));
    markMessagesRead("pharmacy", thread.id);
  }, [thread.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    const msg = addMessage({ from: "pharmacy", to: recipient, text: text.trim(), threadId: thread.id });
    // If sending to provider, update thread status
    if (recipient === "provider") {
      updateThread(thread.id, { status: "pending_provider", providerNotified: true });
    }
    setText("");
    setTimeout(() => { setSending(false); load(); onRefresh(); }, 300);
  }

  function handleEscalateToProvider() {
    const draftText = `Refill request for ${thread.patientName} — ${thread.med} (${thread.id}). Patient has been waiting and no refills remain. Please review and authorize. AI draft attached: ${thread.aiDraft ?? "No draft yet."}`;
    addMessage({ from: "pharmacy", to: "provider", text: draftText, threadId: thread.id });
    updateThread(thread.id, { status: "pending_provider", providerNotified: true });
    addNotification({
      for: "provider",
      text: `Refill escalation: ${thread.patientName} — ${thread.med} (${thread.id})`,
      refillId: thread.id,
    });
    load();
    onRefresh();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #E5E7EB",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #E5E7EB", background: "#FAFAFA", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onClose} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "5px 8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft style={{ width: 13, height: 13, color: "#6E7681" }} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117" }}>
            {thread.med} ({thread.id})
          </div>
          <div style={{ fontSize: "11px", color: "#6E7681" }}>Patient: {thread.patientName} · {thread.dose}</div>
        </div>
        <StatusChip status={thread.status} />
      </div>

      {/* AI Draft banner */}
      {thread.aiDraftVisible && thread.aiDraft && (
        <div style={{ padding: "12px 16px", background: "#EFF6FF", borderBottom: "1px solid #BFDBFE", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <Zap style={{ width: 14, height: 14, color: "#2563EB", flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>AI Draft Ready</div>
            <div style={{ fontSize: "12px", color: "#1E3A8A", lineHeight: 1.5 }}>{thread.aiDraft}</div>
            {aiMode && (
              <button
                onClick={handleEscalateToProvider}
                style={{
                  marginTop: "8px",
                  padding: "5px 14px",
                  background: "#1D4ED8",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Auto-escalate to Provider
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#C9D1D9", fontSize: "13px", paddingTop: "32px" }}>
            No messages yet.
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.from === "pharmacy";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "78%",
                  padding: "10px 14px",
                  borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: isMe ? "#15803D" : "#F3F4F6",
                  color: isMe ? "#fff" : "#0D1117",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "10px", marginBottom: "4px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {isMe ? "Pharmacy" : m.from}
                </div>
                {m.text}
                <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "4px", textAlign: "right" }}>
                  {timeAgo(m.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div style={{ borderTop: "1px solid #E5E7EB", padding: "12px 16px", background: "#FAFAFA" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", color: "#6E7681", fontWeight: 500, alignSelf: "center" }}>Reply to:</span>
          {(["patient", "provider"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRecipient(r)}
              style={{
                padding: "3px 12px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: recipient === r ? "#15803D" : "#E5E7EB",
                background: recipient === r ? "#15803D" : "#fff",
                color: recipient === r ? "#fff" : "#6E7681",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {r}
            </button>
          ))}
          {thread.status === "pending_pharmacy" && !thread.providerNotified && (
            <button
              onClick={handleEscalateToProvider}
              style={{
                marginLeft: "auto",
                padding: "3px 12px",
                borderRadius: "999px",
                border: "1px solid #BFDBFE",
                background: "#EFF6FF",
                color: "#1D4ED8",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Zap style={{ width: 10, height: 10 }} /> Escalate to Provider
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder={`Reply to ${recipient}…`}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            style={{ flex: 1, resize: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            style={{
              background: text.trim() ? "#15803D" : "#E5E7EB",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0 16px",
              cursor: text.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <Send style={{ width: 14, height: 14 }} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PharmacyPage() {
  const [threads, setThreads] = useState<RefillThread[]>([]);
  const [active, setActive] = useState<RefillThread | null>(null);
  const [aiMode, setAiMode] = useState(false);
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
    if (active) setActive(ts.find((t) => t.id === active.id) ?? null);
    setUnread(countUnread("pharmacy"));
    setNotifCount(countUnreadNotifs("pharmacy"));
    setNotifs(getNotifications("pharmacy"));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    setUnread(countUnread("pharmacy"));
    setNotifCount(countUnreadNotifs("pharmacy"));
  }, [tick]);

  const patientInbox = getInboxMessages("pharmacy");
  const priorityQueue = threads.filter((t) => t.status === "pending_pharmacy" || t.status === "pending_provider");
  const resolvedQueue = threads.filter((t) => t.status === "approved" || t.status === "resolved");

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: '"Inter","Sora",sans-serif' }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, height: "52px", background: "rgba(240,240,240,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", padding: "0 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117", textDecoration: "none", letterSpacing: "-0.02em", flexShrink: 0 }}>UnStuck Med</Link>
          <span style={{ color: "#E5E7EB" }}>|</span>
          <RoleSwitcher current="pharmacy" />

          {/* AI Mode toggle */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: "#6E7681", fontWeight: 500 }}>AI Mode</span>
            <button
              onClick={() => setAiMode((m) => !m)}
              style={{
                width: "38px",
                height: "22px",
                borderRadius: "999px",
                background: aiMode ? "#1D4ED8" : "#E5E7EB",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: aiMode ? "18px" : "3px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </div>

          <button onClick={() => setNotifPanel((p) => !p)} style={{ position: "relative", background: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "5px 8px", cursor: "pointer", display: "flex" }}>
            <Bell style={{ width: 14, height: 14, color: "#6E7681" }} />
            {notifCount > 0 && (
              <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#DC2626", color: "#fff", borderRadius: "999px", fontSize: "9px", fontWeight: 700, width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {notifCount}
              </span>
            )}
          </button>
          <button onClick={load} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "5px 8px", cursor: "pointer", display: "flex" }}>
            <RefreshCw style={{ width: 13, height: 13, color: "#6E7681" }} />
          </button>
        </div>
      </nav>

      {/* Notif panel */}
      {notifPanel && (
        <div style={{ position: "fixed", top: "60px", right: "24px", zIndex: 200, background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: "320px", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, fontSize: "13px" }}>Notifications</div>
          {notifs.length === 0 && <div style={{ padding: "24px", textAlign: "center", color: "#C9D1D9", fontSize: "13px" }}>No notifications</div>}
          {notifs.map((n) => (
            <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontSize: "12.5px", color: "#374151" }}>
              <div>{n.text}</div>
              <div style={{ fontSize: "10.5px", color: "#C9D1D9", marginTop: "4px" }}>{timeAgo(n.timestamp)}</div>
            </div>
          ))}
        </div>
      )}

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px", minHeight: "calc(100vh - 52px)" }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { label: "Pending", value: priorityQueue.length, color: "#B45309", bg: "#FFFBEB" },
              { label: "Unread", value: unread, color: "#1E40AF", bg: "#EFF6FF" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: "12px", padding: "12px 14px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color, letterSpacing: "-0.04em" }}>{value}</div>
                <div style={{ fontSize: "10px", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Priority Queue */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontWeight: 700, fontSize: "12px", color: "#0D1117", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Pending Action
            </div>
            {priorityQueue.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "#C9D1D9", fontSize: "12px" }}>All clear</div>
            )}
            {priorityQueue.map((t) => {
              const msgs = getInboxMessages("pharmacy").filter((m) => m.threadId === t.id);
              const unreadMsgs = msgs.filter((m) => !m.read).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t)}
                  style={{
                    width: "100%",
                    background: active?.id === t.id ? "#F0F0F0" : "#fff",
                    border: "none",
                    borderBottom: "1px solid #F3F4F6",
                    padding: "12px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "12.5px", color: "#0D1117" }}>{t.med}</span>
                    {unreadMsgs > 0 && (
                      <span style={{ background: "#15803D", color: "#fff", borderRadius: "999px", fontSize: "9px", fontWeight: 700, padding: "1px 6px" }}>
                        {unreadMsgs}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#6E7681", marginBottom: "6px" }}>{t.patientName}</div>
                  <StatusChip status={t.status} />
                </button>
              );
            })}
          </div>

          {/* Resolved */}
          {resolvedQueue.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontWeight: 700, fontSize: "12px", color: "#6E7681", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Resolved
              </div>
              {resolvedQueue.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t)}
                  style={{ width: "100%", background: active?.id === t.id ? "#F0F0F0" : "#fff", border: "none", borderBottom: "1px solid #F3F4F6", padding: "12px 16px", textAlign: "left", cursor: "pointer" }}
                >
                  <div style={{ fontWeight: 600, fontSize: "12.5px", color: "#0D1117", marginBottom: "2px" }}>{t.med}</div>
                  <div style={{ fontSize: "10.5px", color: "#6E7681" }}>{t.patientName}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main thread or placeholder */}
        <div>
          {active ? (
            <ThreadPanel thread={active} aiMode={aiMode} onClose={() => setActive(null)} onRefresh={load} />
          ) : (
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#C9D1D9" }}>
              <MessageSquare style={{ width: 32, height: 32 }} />
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#6E7681" }}>Select a refill</div>
              <div style={{ fontSize: "13px", textAlign: "center", maxWidth: "240px" }}>
                Choose a pending refill from the queue to view messages and take action.
              </div>
              {aiMode && (
                <div style={{ padding: "8px 16px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", fontSize: "12px", color: "#1D4ED8", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Zap style={{ width: 12, height: 12 }} /> AI Mode ON — drafts will auto-escalate
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
