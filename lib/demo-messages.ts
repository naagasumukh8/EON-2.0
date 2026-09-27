/**
 * UnStuck Med — Demo Message Bus
 * Simulates cross-portal messaging via localStorage.
 * Roles: patient | pharmacy | provider
 * All data is pre-seeded demo data — no real backend needed.
 */

export type Role = "patient" | "pharmacy" | "provider";

export interface Message {
  id: string;
  from: Role;
  to: Role;
  text: string;
  timestamp: number; // epoch ms
  read: boolean;
  threadId: string; // e.g. "RF-001"
}

export interface RefillThread {
  id: string; // "RF-001"
  med: string;
  dose: string;
  patientName: string;
  status: "pending_pharmacy" | "pending_provider" | "approved" | "blocked" | "resolved";
  aiDraft?: string; // drafted action by AI
  aiDraftVisible: boolean;
  providerNotified: boolean;
  createdAt: number;
}

export interface Notification {
  id: string;
  for: Role;
  text: string;
  timestamp: number;
  read: boolean;
  refillId: string;
}

const MSG_KEY = "unstuckmed_messages";
const THREAD_KEY = "unstuckmed_threads";
const NOTIF_KEY = "unstuckmed_notifications";

/* ── Seed defaults (run once if localStorage is empty) ─── */
const SEED_THREADS: RefillThread[] = [
  {
    id: "RF-001",
    med: "Metformin 500mg",
    dose: "Twice daily",
    patientName: "Alex Rivera",
    status: "pending_pharmacy",
    aiDraftVisible: false,
    providerNotified: false,
    createdAt: Date.now() - 1000 * 60 * 48,
  },
  {
    id: "RF-002",
    med: "Lisinopril 10mg",
    dose: "Once daily",
    patientName: "Alex Rivera",
    status: "pending_provider",
    aiDraft:
      "Draft provider note: Patient Alex Rivera requests renewal of Lisinopril 10mg (BP maintenance). Last fill: 32 days ago. No visits overdue. Recommend eRx renewal — awaiting provider sign-off.",
    aiDraftVisible: true,
    providerNotified: true,
    createdAt: Date.now() - 1000 * 60 * 72,
  },
  {
    id: "RF-003",
    med: "Atorvastatin 20mg",
    dose: "Once daily at night",
    patientName: "Alex Rivera",
    status: "approved",
    aiDraftVisible: false,
    providerNotified: true,
    createdAt: Date.now() - 1000 * 60 * 120,
  },
];

const SEED_MESSAGES: Message[] = [
  {
    id: "m001",
    from: "patient",
    to: "pharmacy",
    text: "Hi, I need a refill for my Metformin 500mg. When can I get it?",
    timestamp: Date.now() - 1000 * 60 * 45,
    read: false,
    threadId: "RF-001",
  },
  {
    id: "m002",
    from: "pharmacy",
    to: "patient",
    text: "Hi Alex! We received your request. Metformin needs provider approval — no refills remain. We have notified the clinic and will update you shortly. Expected: 1-2 business days.",
    timestamp: Date.now() - 1000 * 60 * 40,
    read: true,
    threadId: "RF-001",
  },
  {
    id: "m003",
    from: "pharmacy",
    to: "provider",
    text: "Refill request pending for Alex Rivera — Metformin 500mg (RF-001). No refills remain. Patient has been waiting 48h. Please review and authorize renewal.",
    timestamp: Date.now() - 1000 * 60 * 38,
    read: false,
    threadId: "RF-001",
  },
];

const SEED_NOTIFS: Notification[] = [
  {
    id: "n001",
    for: "provider",
    text: "Refill request pending: Alex Rivera — Lisinopril 10mg (RF-002). AI draft ready for review.",
    timestamp: Date.now() - 1000 * 60 * 60,
    read: false,
    refillId: "RF-002",
  },
  {
    id: "n002",
    for: "pharmacy",
    text: "New patient message received for RF-001 (Metformin 500mg).",
    timestamp: Date.now() - 1000 * 60 * 45,
    read: false,
    refillId: "RF-001",
  },
];

/* ── Storage helpers ───────────────────────────────────── */
function getLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedDemoData(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(MSG_KEY)) setLS(MSG_KEY, SEED_MESSAGES);
  if (!localStorage.getItem(THREAD_KEY)) setLS(THREAD_KEY, SEED_THREADS);
  if (!localStorage.getItem(NOTIF_KEY)) setLS(NOTIF_KEY, SEED_NOTIFS);
}

export function resetDemoData(): void {
  setLS(MSG_KEY, SEED_MESSAGES);
  setLS(THREAD_KEY, SEED_THREADS);
  setLS(NOTIF_KEY, SEED_NOTIFS);
}

/* ── Messages ──────────────────────────────────────────── */
export function getMessages(): Message[] {
  return getLS<Message[]>(MSG_KEY, SEED_MESSAGES);
}

export function addMessage(msg: Omit<Message, "id" | "timestamp" | "read">): Message {
  const all = getMessages();
  const newMsg: Message = {
    ...msg,
    id: "m" + Date.now(),
    timestamp: Date.now(),
    read: false,
  };
  setLS(MSG_KEY, [...all, newMsg]);
  // also push a notification for recipient
  addNotification({
    for: msg.to,
    text: `New message from ${msg.from} about ${msg.threadId}.`,
    refillId: msg.threadId,
  });
  return newMsg;
}

export function markMessagesRead(role: Role, threadId: string): void {
  const all = getMessages().map((m) =>
    m.to === role && m.threadId === threadId ? { ...m, read: true } : m
  );
  setLS(MSG_KEY, all);
}

export function getThreadMessages(threadId: string): Message[] {
  return getMessages().filter((m) => m.threadId === threadId);
}

export function getInboxMessages(role: Role): Message[] {
  return getMessages().filter((m) => m.to === role);
}

export function countUnread(role: Role): number {
  return getMessages().filter((m) => m.to === role && !m.read).length;
}

/* ── Threads ───────────────────────────────────────────── */
export function getThreads(): RefillThread[] {
  return getLS<RefillThread[]>(THREAD_KEY, SEED_THREADS);
}

export function updateThread(id: string, patch: Partial<RefillThread>): void {
  const all = getThreads().map((t) => (t.id === id ? { ...t, ...patch } : t));
  setLS(THREAD_KEY, all);
}

export function getThread(id: string): RefillThread | undefined {
  return getThreads().find((t) => t.id === id);
}

/* ── Notifications ─────────────────────────────────────── */
export function getNotifications(role: Role): Notification[] {
  return getLS<Notification[]>(NOTIF_KEY, SEED_NOTIFS).filter((n) => n.for === role);
}

export function addNotification(notif: Omit<Notification, "id" | "timestamp" | "read">): void {
  const all = getLS<Notification[]>(NOTIF_KEY, SEED_NOTIFS);
  const newNotif: Notification = {
    ...notif,
    id: "notif" + Date.now(),
    timestamp: Date.now(),
    read: false,
  };
  setLS(NOTIF_KEY, [...all, newNotif]);
}

export function markNotifRead(id: string): void {
  const all = getLS<Notification[]>(NOTIF_KEY, []).map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  setLS(NOTIF_KEY, all);
}

export function countUnreadNotifs(role: Role): number {
  return getLS<Notification[]>(NOTIF_KEY, []).filter((n) => n.for === role && !n.read).length;
}

/* ── Role-based access guard ─────────────────────────────*/
export function getCurrentRole(): Role | null {
  return getLS<Role | null>("unstuckmed_role", null);
}

export function setCurrentRole(role: Role): void {
  setLS("unstuckmed_role", role);
}

export function clearRole(): void {
  if (typeof window !== "undefined") localStorage.removeItem("unstuckmed_role");
}

/* ── Time formatting ───────────────────────────────────── */
export function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
