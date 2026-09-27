"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Send, RefreshCw, Bell, CheckCircle, Clock, AlertCircle,
} from "lucide-react";
import {
  seedDemoData, getThreads, getThreadMessages, addMessage, markMessagesRead,
  getNotifications, countUnread, countUnreadNotifs, timeAgo, setCurrentRole,
  type Message, type RefillThread,
} from "../../lib/demo-messages";

const PATIENT_NAME = "Alex Rivera";
const PATIENT_DEMO = {
  dob: "1978-04-12",
  condition: "Type 2 Diabetes + Hypertension + Hypercholesterolemia",
  allergies: "Sulfa drugs",
  insuranceId: "AET-88124-X",
};

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
        letterSpacing: "0.02em",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {status === "approved" && <CheckCircle style={{ width: 10, height: 10 }} />}
      {status === "pending_pharmacy" && <Clock style={{ width: 10, height: 10 }} />}
      {status === "pending_provider" && <AlertCircle style={{ width: 10, height: 10 }} />}
      {c.label}
    </span>
  );
}

function ThreadView({
  thread,
  onBack,
  onRefresh,
}: {
  thread: RefillThread;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState<"pharmacy" | "provider">("pharmacy");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    const msgs = getThreadMessages(thread.id);
    // Patient sees only messages to/from patient
    setMessages(msgs.filter((m) => m.from === "patient" || m.to === "patient"));
    markMessagesRead("patient", thread.id);
  }, [thread.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    addMessage({ from: "patient", to: recipient, text: text.trim(), threadId: thread.id });
    setText("");
    setTimeout(() => {
      setSending(false);
      load();
      onRefresh();
    }, 300);
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
      {/* Thread header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "#FAFAFA",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            padding: "5px 8px",
            cursor: "pointer",
            display: "flex",
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14, color: "#6E7681" }} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117" }}>
            {thread.med} ({thread.id})
          </div>
          <div style={{ fontSize: "11px", color: "#6E7681" }}>{thread.dose}</div>
        </div>
        <StatusChip status={thread.status} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#C9D1D9", fontSize: "13px", paddingTop: "32px" }}>
            No messages yet. Start the conversation.
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.from === "patient";
          return (
            <div
              key={m.id}
              style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: isMe ? "#0D1117" : "#F3F4F6",
                  color: isMe ? "#fff" : "#0D1117",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "10px", marginBottom: "4px", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {isMe ? "You" : m.from}
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
          <span style={{ fontSize: "11px", color: "#6E7681", fontWeight: 500, alignSelf: "center" }}>Send to:</span>
          {(["pharmacy", "provider"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRecipient(r)}
              style={{
                padding: "3px 12px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: recipient === r ? "#0D1117" : "#E5E7EB",
                background: recipient === r ? "#0D1117" : "#fff",
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
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder={`Message the ${recipient}…`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            style={{
              flex: 1,
              resize: "none",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              fontFamily: "inherit",
              outline: "none",
              background: "#fff",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            style={{
              background: text.trim() ? "#0D1117" : "#E5E7EB",
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
              transition: "all 0.15s",
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
    setThreads(getThreads());
    setUnreadCount(countUnread("patient"));
    setNotifCount(countUnreadNotifs("patient"));
    setNotifs(getNotifications("patient"));
  }

  useEffect(() => {
    load();
  }, []);

  // Poll for new messages every 3s (simulates real-time)
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    setUnreadCount(countUnread("patient"));
    setNotifCount(countUnreadNotifs("patient"));
    if (activeThread) {
      setThreads(getThreads());
    }
  }, [tick, activeThread]);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: '"Inter","Sora",sans-serif' }}>
      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          height: "52px",
          background: "rgba(240,240,240,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/portal"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#6E7681",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            <ArrowLeft style={{ width: 13, height: 13 }} />
            All Portals
          </Link>
          <span style={{ color: "#E5E7EB" }}>|</span>
          <span style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117" }}>Patient Portal</span>
          <div
            style={{
              marginLeft: "auto",
              padding: "3px 10px",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#1D4ED8",
            }}
          >
            {PATIENT_NAME}
          </div>
          <button
            onClick={() => setNotifPanel((p) => !p)}
            style={{
              position: "relative",
              background: "none",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "5px 8px",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <Bell style={{ width: 14, height: 14, color: "#6E7681" }} />
            {notifCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#DC2626",
                  color: "#fff",
                  borderRadius: "999px",
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
              background: "none",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "5px 8px",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <RefreshCw style={{ width: 13, height: 13, color: "#6E7681" }} />
          </button>
        </div>
      </nav>

      {/* Notif panel */}
      {notifPanel && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            right: "24px",
            zIndex: 200,
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            width: "320px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, fontSize: "13px" }}>
            Notifications
          </div>
          {notifs.length === 0 && (
            <div style={{ padding: "24px", textAlign: "center", color: "#C9D1D9", fontSize: "13px" }}>
              No notifications
            </div>
          )}
          {notifs.map((n) => (
            <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontSize: "12.5px", color: "#374151" }}>
              <div>{n.text}</div>
              <div style={{ fontSize: "10.5px", color: "#C9D1D9", marginTop: "4px" }}>{timeAgo(n.timestamp)}</div>
            </div>
          ))}
        </div>
      )}

      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "28px 24px",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: "20px",
          minHeight: "calc(100vh - 52px)",
        }}
      >
        {/* Left: Patient card + refill list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Profile card */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                👤
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#0D1117" }}>{PATIENT_NAME}</div>
                <div style={{ fontSize: "11px", color: "#6E7681" }}>DOB: {PATIENT_DEMO.dob}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Condition", value: PATIENT_DEMO.condition },
                { label: "Allergies", value: PATIENT_DEMO.allergies },
                { label: "Insurance ID", value: PATIENT_DEMO.insuranceId },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "#C9D1D9", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
                    {label}
                  </div>
                  <div style={{ fontSize: "12px", color: "#374151", fontWeight: 500, lineHeight: 1.4 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Refill list */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #F3F4F6",
                fontWeight: 700,
                fontSize: "13px",
                color: "#0D1117",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              My Prescriptions
              {unreadCount > 0 && (
                <span
                  style={{
                    background: "#DC2626",
                    color: "#fff",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "1px 7px",
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {threads.map((t) => {
              const msgs = getThreadMessages(t.id).filter((m) => m.from === "patient" || m.to === "patient");
              const unread = msgs.filter((m) => m.to === "patient" && !m.read).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveThread(t)}
                  style={{
                    width: "100%",
                    background: activeThread?.id === t.id ? "#F0F0F0" : "#fff",
                    border: "none",
                    borderBottom: "1px solid #F3F4F6",
                    padding: "14px 18px",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600, fontSize: "13px", color: "#0D1117" }}>{t.med}</span>
                    {unread > 0 && (
                      <span
                        style={{
                          background: "#1D4ED8",
                          color: "#fff",
                          borderRadius: "999px",
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "1px 6px",
                          flexShrink: 0,
                        }}
                      >
                        {unread}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "11px", color: "#6E7681", marginBottom: "6px" }}>{t.dose}</div>
                  <StatusChip status={t.status} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Thread view or placeholder */}
        <div style={{ minHeight: "500px" }}>
          {activeThread ? (
            <ThreadView
              thread={activeThread}
              onBack={() => setActiveThread(null)}
              onRefresh={load}
            />
          ) : (
            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "16px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                color: "#C9D1D9",
              }}
            >
              <div style={{ fontSize: "32px" }}>💊</div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#6E7681" }}>
                Select a prescription
              </div>
              <div style={{ fontSize: "13px", textAlign: "center", maxWidth: "260px" }}>
                Click a refill on the left to view status and send a message to your pharmacy or provider.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
