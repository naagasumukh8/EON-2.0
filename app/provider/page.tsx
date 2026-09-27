"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Send, Bell, RefreshCw, CheckCircle, XCircle, Clock, Zap, Shield,
} from "lucide-react";
import {
  seedDemoData, getThreads, getThreadMessages, addMessage, markMessagesRead,
  getNotifications, markNotifRead, countUnreadNotifs, updateThread, addNotification,
  timeAgo, setCurrentRole,
  type Message, type RefillThread, type Notification,
} from "../../lib/demo-messages";
import { RoleSwitcher } from "../components/RoleSwitcher";

const PROVIDER_NAME = "Dr. Sarah Chen, PharmD";
const PROVIDER_LICENSE = "Lic #CA-89211";

function StatusChip({ status }: { status: RefillThread["status"] }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending_pharmacy: { label: "Pending at Pharmacy", color: "#92400E", bg: "#FFFBEB" },
    pending_provider: { label: "Awaiting Your Review", color: "#1E40AF", bg: "#EFF6FF" },
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

function RefillDetailPanel({
  thread,
  onClose,
  onRefresh,
}: {
  thread: RefillThread;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [denying, setDenying] = useState(false);
  const [note, setNote] = useState(`Clinical review verified for ${thread.med} (${thread.id}). Authorized under standard clinical protocol.`);
  const [tab, setTab] = useState<"messages" | "action">("action");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    // Provider only sees messages to/from provider
    const all = getThreadMessages(thread.id);
    setMessages(all.filter((m) => m.from === "provider" || m.to === "provider"));
    markMessagesRead("provider", thread.id);
  }, [thread.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    addMessage({ from: "provider", to: "pharmacy", text: text.trim(), threadId: thread.id });
    setText("");
    setTimeout(() => { setSending(false); load(); onRefresh(); }, 300);
  }

  function handleApprove() {
    setApproving(true);
    updateThread(thread.id, { status: "approved" });
    addMessage({
      from: "provider",
      to: "pharmacy",
      text: `eRx renewal authorized for ${thread.med} (${thread.id}). Clinical note: ${note} — Signed: ${PROVIDER_NAME}, ${PROVIDER_LICENSE}.`,
      threadId: thread.id,
    });
    addMessage({
      from: "provider",
      to: "patient",
      text: `Your refill for ${thread.med} has been approved by your provider. The pharmacy will process it shortly.`,
      threadId: thread.id,
    });
    addNotification({ for: "pharmacy", text: `Provider approved: ${thread.med} (${thread.id}).`, refillId: thread.id });
    addNotification({ for: "patient", text: `Your ${thread.med} refill has been approved!`, refillId: thread.id });
    setTimeout(() => { setApproving(false); load(); onRefresh(); }, 400);
  }

  function handleDeny() {
    setDenying(true);
    updateThread(thread.id, { status: "blocked" });
    addMessage({
      from: "provider",
      to: "pharmacy",
      text: `Refill for ${thread.med} (${thread.id}) requires patient visit before renewal. Please inform patient. Signed: ${PROVIDER_NAME}.`,
      threadId: thread.id,
    });
    addMessage({
      from: "provider",
      to: "patient",
      text: `Your provider needs to see you before renewing ${thread.med}. Please schedule a visit. Your pharmacy has been notified.`,
      threadId: thread.id,
    });
    addNotification({ for: "pharmacy", text: `Provider requires visit for ${thread.med} (${thread.id}).`, refillId: thread.id });
    addNotification({ for: "patient", text: `Action needed: schedule a visit for your ${thread.med} refill.`, refillId: thread.id });
    setTimeout(() => { setDenying(false); load(); onRefresh(); }, 400);
  }

  const canAct = thread.status === "pending_provider";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #E5E7EB", background: "#FAFAFA", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onClose} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "5px 8px", cursor: "pointer", display: "flex" }}>
          <ArrowLeft style={{ width: 13, height: 13, color: "#6E7681" }} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117" }}>{thread.med} ({thread.id})</div>
          <div style={{ fontSize: "11px", color: "#6E7681" }}>Patient: {thread.patientName} · {thread.dose}</div>
        </div>
        <StatusChip status={thread.status} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB" }}>
        {(["action", "messages"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "10px",
              background: tab === t ? "#fff" : "#FAFAFA",
              border: "none",
              borderBottom: tab === t ? "2px solid #7C3AED" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "#7C3AED" : "#6E7681",
              textTransform: "capitalize",
            }}
          >
            {t === "action" ? "Review & Act" : "Messages"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {tab === "action" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Prescription info */}
            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#C9D1D9", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                Prescription Details
              </div>
              {[
                { label: "Medication", value: thread.med },
                { label: "Dose", value: thread.dose },
                { label: "Patient", value: `${thread.patientName} · Allergies: Sulfa drugs` },
                { label: "Condition", value: "Type 2 Diabetes, Hypertension, Hypercholesterolemia" },
                { label: "Insurance", value: "Aetna AET-88124-X" },
                { label: "Last Fill", value: "32 days ago" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", gap: "12px", marginBottom: "8px", fontSize: "12.5px" }}>
                  <span style={{ color: "#6E7681", fontWeight: 500, minWidth: "80px", flexShrink: 0 }}>{label}</span>
                  <span style={{ color: "#0D1117", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* AI Draft */}
            {thread.aiDraft && (
              <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Zap style={{ width: 12, height: 12, color: "#2563EB" }} />
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    AI Draft Recommendation
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "#1E3A8A", lineHeight: 1.6, margin: 0 }}>{thread.aiDraft}</p>
              </div>
            )}

            {/* Safety checklist */}
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                Safety Checklist
              </div>
              {[
                "Therapy adherence verified against EHR",
                "No C-II controlled substance — standard Rx renewal",
                "No drug interaction flagged with current regimen",
                "Patient not flagged for visit requirement",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#15803D", marginBottom: "6px" }}>
                  <CheckCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>

            {/* Clinical note */}
            {canAct && (
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#6E7681", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Clinical Audit Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  style={{ width: "100%", resize: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "8px 12px", fontSize: "12.5px", fontFamily: "inherit", outline: "none" }}
                />
                <div style={{ fontSize: "10px", color: "#6E7681", marginTop: "4px" }}>
                  Signed as: {PROVIDER_NAME} · {PROVIDER_LICENSE}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {canAct ? (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: approving ? "#E5E7EB" : "#15803D",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: approving ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <CheckCircle style={{ width: 14, height: 14 }} />
                  {approving ? "Approving…" : "Approve & Sign"}
                </button>
                <button
                  onClick={handleDeny}
                  disabled={denying}
                  style={{
                    padding: "11px 20px",
                    background: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: denying ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <XCircle style={{ width: 14, height: 14 }} />
                  {denying ? "…" : "Require Visit"}
                </button>
              </div>
            ) : (
              <div style={{ padding: "12px 16px", background: thread.status === "approved" ? "#F0FDF4" : "#F3F4F6", border: `1px solid ${thread.status === "approved" ? "#BBF7D0" : "#E5E7EB"}`, borderRadius: "10px", fontSize: "13px", fontWeight: 600, color: thread.status === "approved" ? "#15803D" : "#6E7681", textAlign: "center" }}>
                {thread.status === "approved" ? "Refill approved and dispatched." : `No action needed — status: ${thread.status}`}
              </div>
            )}
          </div>
        )}

        {tab === "messages" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", color: "#C9D1D9", fontSize: "13px", paddingTop: "32px" }}>
                No messages yet.
              </div>
            )}
            {messages.map((m) => {
              const isMe = m.from === "provider";
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMe ? "#7C3AED" : "#F3F4F6", color: isMe ? "#fff" : "#0D1117", fontSize: "13px", lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 600, fontSize: "10px", marginBottom: "4px", opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {isMe ? "You" : m.from}
                    </div>
                    {m.text}
                    <div style={{ fontSize: "10px", opacity: 0.5, marginTop: "4px", textAlign: "right" }}>{timeAgo(m.timestamp)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Compose (messages tab only) */}
      {tab === "messages" && (
        <div style={{ borderTop: "1px solid #E5E7EB", padding: "12px 16px", background: "#FAFAFA" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="Reply to pharmacy…"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              style={{ flex: 1, resize: "none", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              style={{ background: text.trim() ? "#7C3AED" : "#E5E7EB", color: "#fff", border: "none", borderRadius: "8px", padding: "0 16px", cursor: text.trim() ? "pointer" : "default", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 }}
            >
              <Send style={{ width: 14, height: 14 }} /> Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProviderPage() {
  const [threads, setThreads] = useState<RefillThread[]>([]);
  const [active, setActive] = useState<RefillThread | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const [notifPanel, setNotifPanel] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [tick, setTick] = useState(0);

  function load() {
    seedDemoData();
    setCurrentRole("provider");
    const ts = getThreads();
    setThreads(ts);
    if (active) setActive(ts.find((t) => t.id === active.id) ?? null);
    setNotifCount(countUnreadNotifs("provider"));
    setNotifs(getNotifications("provider"));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => {
    setNotifCount(countUnreadNotifs("provider"));
  }, [tick]);

  const pending = threads.filter((t) => t.status === "pending_provider");
  const other = threads.filter((t) => t.status !== "pending_provider");

  return (
    <div style={{ minHeight: "100vh", background: "#F0F0F0", fontFamily: '"Inter","Sora",sans-serif' }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, height: "52px", background: "rgba(240,240,240,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", padding: "0 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: "14px", color: "#0D1117", textDecoration: "none", letterSpacing: "-0.02em", flexShrink: 0 }}>UnStuck Med</Link>
          <span style={{ color: "#E5E7EB" }}>|</span>
          <RoleSwitcher current="provider" />
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
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
        </div>
      </nav>

      {/* Notif panel */}
      {notifPanel && (
        <div style={{ position: "fixed", top: "60px", right: "24px", zIndex: 200, background: "#fff", border: "1px solid #E5E7EB", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: "340px", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, fontSize: "13px" }}>Provider Notifications</div>
          {notifs.length === 0 && <div style={{ padding: "24px", textAlign: "center", color: "#C9D1D9", fontSize: "13px" }}>No notifications</div>}
          {notifs.map((n) => (
            <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontSize: "12.5px", color: "#374151" }}>
              <div>{n.text}</div>
              <div style={{ fontSize: "10.5px", color: "#C9D1D9", marginTop: "4px" }}>{timeAgo(n.timestamp)}</div>
            </div>
          ))}
        </div>
      )}

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", minHeight: "calc(100vh - 52px)" }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { label: "Pending", value: pending.length, color: "#7C3AED", bg: "#F5F3FF" },
              { label: "Notifs", value: notifCount, color: "#DC2626", bg: "#FEF2F2" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: "12px", padding: "12px 14px" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color, letterSpacing: "-0.04em" }}>{value}</div>
                <div style={{ fontSize: "10px", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Pending approvals */}
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontWeight: 700, fontSize: "12px", color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Awaiting Your Review
              {pending.length > 0 && (
                <span style={{ background: "#7C3AED", color: "#fff", borderRadius: "999px", fontSize: "10px", fontWeight: 700, padding: "1px 7px" }}>{pending.length}</span>
              )}
            </div>
            {pending.length === 0 && <div style={{ padding: "20px", textAlign: "center", color: "#C9D1D9", fontSize: "12px" }}>No pending reviews</div>}
            {pending.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t)}
                style={{ width: "100%", background: active?.id === t.id ? "#F5F3FF" : "#fff", border: "none", borderBottom: "1px solid #F3F4F6", padding: "12px 16px", textAlign: "left", cursor: "pointer", transition: "background 0.12s" }}
              >
                <div style={{ fontWeight: 700, fontSize: "12.5px", color: "#0D1117", marginBottom: "2px" }}>{t.med}</div>
                <div style={{ fontSize: "10.5px", color: "#6E7681", marginBottom: "6px" }}>{t.patientName}</div>
                <StatusChip status={t.status} />
              </button>
            ))}
          </div>

          {/* Other refills */}
          {other.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontWeight: 700, fontSize: "12px", color: "#6E7681", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Other Refills
              </div>
              {other.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t)}
                  style={{ width: "100%", background: active?.id === t.id ? "#F0F0F0" : "#fff", border: "none", borderBottom: "1px solid #F3F4F6", padding: "12px 16px", textAlign: "left", cursor: "pointer" }}
                >
                  <div style={{ fontWeight: 600, fontSize: "12.5px", color: "#0D1117", marginBottom: "2px" }}>{t.med}</div>
                  <div style={{ fontSize: "10.5px", color: "#6E7681", marginBottom: "4px" }}>{t.patientName}</div>
                  <StatusChip status={t.status} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main panel */}
        <div>
          {active ? (
            <RefillDetailPanel thread={active} onClose={() => setActive(null)} onRefresh={load} />
          ) : (
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              <Shield style={{ width: 32, height: 32, color: "#7C3AED" }} />
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#0D1117" }}>Provider Review Queue</div>
              {pending.length > 0 ? (
                <div style={{ fontSize: "13px", color: "#6E7681", textAlign: "center", maxWidth: "260px" }}>
                  You have <strong style={{ color: "#7C3AED" }}>{pending.length}</strong> refill{pending.length > 1 ? "s" : ""} waiting for your clinical review. Select one to approve or request a visit.
                </div>
              ) : (
                <div style={{ fontSize: "13px", color: "#6E7681", textAlign: "center", maxWidth: "240px" }}>
                  No pending reviews. All refills are up to date.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
