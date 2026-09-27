/**
 * UnStuck Med — Demo Message Bus
 * Simulates cross-portal messaging via localStorage.
 * Roles: patient | pharmacy | provider
 * All data is pre-seeded demo data — no real backend.
 */

export type Role = "patient" | "pharmacy" | "provider";

export interface Message {
  id: string;
  from: Role;
  to: Role;
  text: string;
  timestamp: number;
  read: boolean;
  threadId: string;
}

export interface RefillThread {
  id: string;
  med: string;
  dose: string;
  patientName: string;
  status: "pending_pharmacy" | "pending_provider" | "approved" | "blocked" | "resolved";
  clinicalSummary?: string;
  summaryVisible: boolean;
  providerNotified: boolean;
  classifyResult?: ClassifyResult;
  eta?: string;           // human-readable ETA string shown to patient
  statusStep?: string;    // current micro-step shown in patient tracker
  createdAt: number;
}

export interface ClassifyResult {
  priority: "routine" | "review_required";
  reason: string;
  alternative?: string;
  alternativeReason?: string;
}

export interface Notification {
  id: string;
  for: Role;
  text: string;
  timestamp: number;
  read: boolean;
  refillId: string;
}

const MSG_KEY    = "unstuckmed_messages";
const THREAD_KEY = "unstuckmed_threads";
const NOTIF_KEY  = "unstuckmed_notifications";

/* ── Seed data ─────────────────────────────────────────── */
const SEED_THREADS: RefillThread[] = [
  {
    id: "RF-001",
    med: "Metformin 500mg",
    dose: "Twice daily",
    patientName: "Alex Rivera",
    status: "pending_pharmacy",
    clinicalSummary: undefined,
    summaryVisible: false,
    providerNotified: false,
    createdAt: Date.now() - 1000 * 60 * 48,
  },
  {
    id: "RF-002",
    med: "Lisinopril 10mg",
    dose: "Once daily",
    patientName: "Alex Rivera",
    status: "pending_provider",
    clinicalSummary:
      "Refill request for Alex Rivera — Lisinopril 10mg (BP maintenance). No remaining refills on file. Last fill: 32 days ago. No overdue visits. Recommend provider renewal review.",
    summaryVisible: true,
    providerNotified: true,
    classifyResult: {
      priority: "review_required",
      reason: "No refills remain on original prescription. Provider sign-off required.",
      alternative: "Amlodipine 5mg",
      alternativeReason: "Equivalent CCB for BP control if Lisinopril renewal is delayed.",
    },
    createdAt: Date.now() - 1000 * 60 * 72,
  },
  {
    id: "RF-003",
    med: "Atorvastatin 20mg",
    dose: "Once daily at night",
    patientName: "Alex Rivera",
    status: "approved",
    clinicalSummary: undefined,
    summaryVisible: false,
    providerNotified: true,
    classifyResult: {
      priority: "routine",
      reason: "Standard statin maintenance. No refill limit reached. Auto-processed.",
    },
    createdAt: Date.now() - 1000 * 60 * 120,
  },
];

const SEED_MESSAGES: Message[] = [
  {
    id: "m001",
    from: "patient",
    to: "pharmacy",
    text: "Hi, I need a refill for my Metformin 500mg. I take it twice daily for diabetes. Can you help?",
    timestamp: Date.now() - 1000 * 60 * 45,
    read: false,
    threadId: "RF-001",
  },
  {
    id: "m002",
    from: "pharmacy",
    to: "patient",
    text: "Hi Alex! We received your refill request for Metformin 500mg. We are checking your prescription records now. We will update you shortly.",
    timestamp: Date.now() - 1000 * 60 * 40,
    read: true,
    threadId: "RF-001",
  },
  {
    id: "m003",
    from: "patient",
    to: "pharmacy",
    text: "Hi, I also need a refill for Lisinopril 10mg (blood pressure). I have been taking it daily for months.",
    timestamp: Date.now() - 1000 * 60 * 70,
    read: false,
    threadId: "RF-002",
  },
  {
    id: "m004",
    from: "pharmacy",
    to: "patient",
    text: "Hi Alex! Your Lisinopril refill requires your provider Dr. Chen to authorize it — no refills remain on the original prescription. We have forwarded it for review.",
    timestamp: Date.now() - 1000 * 60 * 68,
    read: true,
    threadId: "RF-002",
  },
  {
    id: "m005",
    from: "pharmacy",
    to: "provider",
    text: "Refill escalation — Alex Rivera, Lisinopril 10mg (RF-002). No refills remain. Patient has been waiting. Clinical summary attached. Please review and authorize.",
    timestamp: Date.now() - 1000 * 60 * 67,
    read: false,
    threadId: "RF-002",
  },
];

const SEED_NOTIFS: Notification[] = [
  {
    id: "n001",
    for: "provider",
    text: "New refill review required: Alex Rivera — Lisinopril 10mg (RF-002). No refills remain.",
    timestamp: Date.now() - 1000 * 60 * 67,
    read: false,
    refillId: "RF-002",
  },
  {
    id: "n002",
    for: "pharmacy",
    text: "New patient message: Alex Rivera about Metformin 500mg (RF-001).",
    timestamp: Date.now() - 1000 * 60 * 45,
    read: false,
    refillId: "RF-001",
  },
];

/* ── Storage ────────────────────────────────────────────── */
function getLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function setLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedDemoData(): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(MSG_KEY))    setLS(MSG_KEY,    SEED_MESSAGES);
  if (!localStorage.getItem(THREAD_KEY)) setLS(THREAD_KEY, SEED_THREADS);
  if (!localStorage.getItem(NOTIF_KEY))  setLS(NOTIF_KEY,  SEED_NOTIFS);
}

export function resetDemoData(): void {
  setLS(MSG_KEY,    SEED_MESSAGES);
  setLS(THREAD_KEY, SEED_THREADS);
  setLS(NOTIF_KEY,  SEED_NOTIFS);
}

/* ── Messages ───────────────────────────────────────────── */
export function getMessages(): Message[] { return getLS<Message[]>(MSG_KEY, SEED_MESSAGES); }

export function addMessage(msg: Omit<Message, "id" | "timestamp" | "read">): Message {
  const all = getMessages();
  const newMsg: Message = { ...msg, id: "m" + Date.now(), timestamp: Date.now(), read: false };
  setLS(MSG_KEY, [...all, newMsg]);
  addNotification({ for: msg.to, text: `New message about ${msg.threadId}.`, refillId: msg.threadId });
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

/* ── Threads ────────────────────────────────────────────── */
export function getThreads(): RefillThread[] { return getLS<RefillThread[]>(THREAD_KEY, SEED_THREADS); }

export function updateThread(id: string, patch: Partial<RefillThread>): void {
  const all = getThreads().map((t) => (t.id === id ? { ...t, ...patch } : t));
  setLS(THREAD_KEY, all);
}

export function getThread(id: string): RefillThread | undefined {
  return getThreads().find((t) => t.id === id);
}

/* ── Notifications ──────────────────────────────────────── */
export function getNotifications(role: Role): Notification[] {
  return getLS<Notification[]>(NOTIF_KEY, SEED_NOTIFS).filter((n) => n.for === role);
}

export function addNotification(notif: Omit<Notification, "id" | "timestamp" | "read">): void {
  const all = getLS<Notification[]>(NOTIF_KEY, SEED_NOTIFS);
  const newNotif: Notification = { ...notif, id: "notif" + Date.now(), timestamp: Date.now(), read: false };
  setLS(NOTIF_KEY, [...all, newNotif]);
}

export function markNotifRead(id: string): void {
  const all = getLS<Notification[]>(NOTIF_KEY, []).map((n) => n.id === id ? { ...n, read: true } : n);
  setLS(NOTIF_KEY, all);
}

export function countUnreadNotifs(role: Role): number {
  return getLS<Notification[]>(NOTIF_KEY, []).filter((n) => n.for === role && !n.read).length;
}

/* ── Smart Classifier (deterministic, not AI) ───────────── */
export function classifyRefill(thread: RefillThread): ClassifyResult {
  // Deterministic rules — no ML, no AI
  const med = thread.med.toLowerCase();

  if (med.includes("metformin") || med.includes("atorvastatin") || med.includes("lisinopril") && thread.status === "approved") {
    return {
      priority: "routine",
      reason: "Standard maintenance medication. No refill limit reached. No controlled substance. No clinical flags. Processing automatically.",
    };
  }
  if (med.includes("lisinopril")) {
    return {
      priority: "review_required",
      reason: "No refills remain on original prescription. Provider sign-off required before dispensing.",
      alternative: "Amlodipine 5mg",
      alternativeReason: "Equivalent CCB-class antihypertensive. Can be dispensed as bridge while awaiting Lisinopril renewal.",
    };
  }
  // Default: needs review
  return {
    priority: "review_required",
    reason: "Prescription eligibility could not be confirmed automatically. Provider review required.",
  };
}

/* ── Process refill at pharmacy ─────────────────────────── */

/** Step 1: Call this when pharmacy OPENS a refill to start processing — patient gets "started" notification */
export function pharmacyStarted(threadId: string): void {
  const thread = getThread(threadId);
  if (!thread) return;
  updateThread(threadId, { statusStep: "Pharmacy is reviewing your request" });
  // Only notify if patient hasn't already been notified for this step
  addNotification({
    for: "patient",
    text: `Pharmacy has started reviewing your ${thread.med} refill. We will update you at each step.`,
    refillId: threadId,
  });
}

/** Step 2: Classify and route — sends patient updates at each sub-step */
export function pharmacyProcessRefill(threadId: string): { result: ClassifyResult; thread: RefillThread } {
  const thread = getThread(threadId)!;
  const result = classifyRefill(thread);

  if (result.priority === "routine") {
    // Auto-resolve
    updateThread(threadId, {
      status: "resolved",
      classifyResult: result,
      summaryVisible: false,
      eta: "2–4 hours",
      statusStep: "Processed — ready for pickup",
    });
    addMessage({
      from: "pharmacy",
      to: "patient",
      text: `Your refill for ${thread.med} has been processed. It qualifies as a routine maintenance refill — no provider visit needed. Your prescription is ready. Estimated pickup time: 2–4 hours from now. Please call us to confirm.`,
      threadId,
    });
    addNotification({ for: "patient", text: `Your ${thread.med} refill is ready. Estimated pickup: 2–4 hours.`, refillId: threadId });
  } else {
    // Needs provider review — tell patient each step
    const summary = `Refill request — ${thread.patientName}, ${thread.med} (${threadId}). ${result.reason}${result.alternative ? ` Possible alternative: ${result.alternative} — ${result.alternativeReason}` : ""} Patient has been waiting. Please review.`;
    updateThread(threadId, {
      status: "pending_provider",
      providerNotified: true,
      clinicalSummary: summary,
      summaryVisible: true,
      classifyResult: result,
      statusStep: "Forwarded to Dr. Chen for clinical review",
      eta: "1–3 hours pending provider decision",
    });
    // Patient: step-by-step messages
    addMessage({
      from: "pharmacy",
      to: "patient",
      text: `Update on your ${thread.med} refill: Our system reviewed your request and determined that provider authorization is required. Reason: ${result.reason}`,
      threadId,
    });
    addMessage({
      from: "pharmacy",
      to: "patient",
      text: `Your refill has now been forwarded to Dr. Chen for clinical review. You will receive a notification as soon as the provider acts — typically within 1–3 hours. No action needed from you.`,
      threadId,
    });
    // Provider message
    addMessage({
      from: "pharmacy",
      to: "provider",
      text: summary,
      threadId,
    });
    addNotification({ for: "provider", text: `Refill review needed: ${thread.patientName} — ${thread.med} (${threadId}).`, refillId: threadId });
    addNotification({ for: "patient", text: `Your ${thread.med} refill is now with Dr. Chen for review. ETA: 1–3 hrs.`, refillId: threadId });
  }

  return { result, thread: getThread(threadId)! };
}

/* ── Provider actions ───────────────────────────────────── */

/** Call when provider OPENS a flagged refill to review — patient sees "Provider is reviewing" */
export function providerStartedReview(threadId: string): void {
  const thread = getThread(threadId);
  if (!thread || thread.status !== "pending_provider") return;
  updateThread(threadId, { statusStep: "Dr. Chen is actively reviewing your case" });
  addNotification({
    for: "patient",
    text: `Dr. Chen has opened your ${thread?.med ?? ""} refill for review. A decision is expected shortly.`,
    refillId: threadId,
  });
}

export function providerApprove(threadId: string, providerName: string): void {
  const thread = getThread(threadId)!;
  updateThread(threadId, {
    status: "approved",
    eta: "2–4 hours",
    statusStep: "Approved — pharmacy notified, preparing your prescription",
  });
  addMessage({ from: "provider", to: "pharmacy",
    text: `eRx authorized for ${thread.med} (${threadId}). Renewal approved under standard protocol. Signed: ${providerName}. Please dispense as soon as possible.`, threadId });
  addMessage({ from: "provider", to: "patient",
    text: `Dr. Chen has reviewed and approved your refill for ${thread.med}. Your pharmacy has been notified and is preparing your prescription. Estimated pickup time: 2–4 hours from now.`, threadId });
  addNotification({ for: "pharmacy", text: `Provider approved: ${thread.med} (${threadId}). Please dispense. ETA communicated to patient: 2–4 hrs.`, refillId: threadId });
  addNotification({ for: "patient", text: `Approved! Your ${thread.med} will be ready in approximately 2–4 hours.`, refillId: threadId });
}

export function providerSuggestAlternative(threadId: string, providerName: string): void {
  const thread = getThread(threadId)!;
  const alt = thread.classifyResult?.alternative ?? "an alternative medication";
  const altReason = thread.classifyResult?.alternativeReason ?? "Clinically equivalent option.";
  updateThread(threadId, {
    status: "approved",
    eta: "2–4 hours",
    statusStep: `Alternative authorized: ${alt} — pharmacy preparing`,
  });
  addMessage({ from: "provider", to: "pharmacy",
    text: `Alternative authorized for ${thread.med} (${threadId}): dispense ${alt} instead. Reason: ${altReason} Signed: ${providerName}. Please dispense promptly.`, threadId });
  addMessage({ from: "provider", to: "patient",
    text: `Dr. Chen has authorized ${alt} as an alternative to ${thread.med}. Reason: ${altReason} Your pharmacy has been notified. Estimated pickup time: 2–4 hours.`, threadId });
  addNotification({ for: "pharmacy", text: `Alternative authorized: dispense ${alt} for ${thread.med} (${threadId}). ETA to patient: 2–4 hrs.`, refillId: threadId });
  addNotification({ for: "patient", text: `Alternative approved: ${alt} ready in approximately 2–4 hours.`, refillId: threadId });
}

export function providerRequireVisit(threadId: string, providerName: string): void {
  const thread = getThread(threadId)!;
  updateThread(threadId, {
    status: "blocked",
    eta: undefined,
    statusStep: "Visit required — refill on hold until appointment",
  });
  addMessage({ from: "provider", to: "pharmacy",
    text: `${thread.med} (${threadId}) — patient visit required before renewal. Refill on hold. Signed: ${providerName}.`, threadId });
  addMessage({ from: "provider", to: "patient",
    text: `Dr. Chen requires a clinical review visit before renewing your ${thread.med}. Please call Summit Clinic to schedule. Once your visit is complete, your refill will be processed within 24 hours.`, threadId });
  addNotification({ for: "pharmacy", text: `Visit required before dispensing ${thread.med} (${threadId}).`, refillId: threadId });
  addNotification({ for: "patient", text: `Action needed: Schedule a visit with Dr. Chen to continue your ${thread.med} refill.`, refillId: threadId });
}

/* ── Role session ────────────────────────────────────────── */
export function getCurrentRole(): Role | null { return getLS<Role | null>("unstuckmed_role", null); }
export function setCurrentRole(role: Role): void { setLS("unstuckmed_role", role); }
export function clearRole(): void { if (typeof window !== "undefined") localStorage.removeItem("unstuckmed_role"); }

/* ── Helpers ─────────────────────────────────────────────── */
export function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ── Patient quick-send demo prompts ─────────────────────── */
export const PATIENT_DEMO_PROMPTS: { threadId: string; text: string; label: string }[] = [
  {
    threadId: "RF-001",
    label: "Request Metformin refill",
    text: "Hi, I need a refill for my Metformin 500mg. I take it twice daily for diabetes. Can you process it please?",
  },
  {
    threadId: "RF-002",
    label: "Request Lisinopril refill",
    text: "Hi, I need a refill for my Lisinopril 10mg for blood pressure. I have been taking it daily.",
  },
  {
    threadId: "RF-001",
    label: "Ask about status",
    text: "Can you give me an update on my Metformin refill? How long will it take?",
  },
];
