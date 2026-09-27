"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Clock, CheckCircle, AlertTriangle, Zap,
  ChevronRight, Filter, Search, Eye, ToggleLeft, ToggleRight,
  Info, Bell, RefreshCw, X, TrendingUp, Shield
} from "lucide-react";

/* ── Nav (shared) ─────────────────────────────────────── */
function Nav() {
  return (
    <nav className="top-nav">
      <div className="top-nav__inner">
        <Link href="/" className="top-nav__logo">
          <div className="w-7 h-7 bg-ink-900 rounded flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-white text-xs font-bold">Rx</span>
          </div>
          <span className="top-nav__wordmark">UnStuck Med</span>
        </Link>
        <div className="top-nav__links">
          {["/", "/workflow", "/dashboard", "/classify", "/security"].map(href => (
            <Link key={href} href={href}
              className={`top-nav__link ${href === "/dashboard" ? "top-nav__link--active" : ""}`}>
              {href === "/" ? "Home" : href.replace("/", "").charAt(0).toUpperCase() + href.slice(2)}
            </Link>
          ))}
        </div>
        <div className="top-nav__right">
          <Link href="/classify" className="btn btn-primary btn-sm">
            <Zap className="h-3.5 w-3.5" /> AI Classifier
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Constants ────────────────────────────────────────── */
const AVG_MANUAL_MINUTES = 192; // industry estimate; labeled as such

/* ── Risk scoring ─────────────────────────────────────── */
const MED_CLASS_RISK: Record<string, { score: number; reason: string }> = {
  chronic_high_risk: { score: 40, reason: "Chronic high-risk medication (cardiac/diabetes/hypertension)" },
  chronic_standard:  { score: 20, reason: "Chronic standard medication" },
  acute:             { score: 5,  reason: "Acute / as-needed medication" },
};

function computePriorityScore(daysStuck: number, medClass: string, blockType: string): number {
  const medScore = MED_CLASS_RISK[medClass]?.score ?? 10;
  const ageScore = Math.min(daysStuck * 12, 48);
  const blockBonus = blockType === "NO_REFILLS" ? 12 : blockType === "INSURANCE" ? 8 : 0;
  return Math.min(medScore + ageScore + blockBonus, 100);
}

/* ── Mock queue data ──────────────────────────────────── */
const INITIAL_QUEUE = [
  { id: "RF-001", token: "pt-7a3f", med: "Metformin 500mg",      medClass: "chronic_high_risk", blockType: "NO_REFILLS",   status: "BLOCKED",    daysStuck: 3, actor: "Provider",  practice: "CareFirst",     insurance: "BlueCross", nextAction: "Draft new eRx renewal request to attending provider" },
  { id: "RF-002", token: "pt-2c1d", med: "Lisinopril 10mg",      medClass: "chronic_high_risk", blockType: "INSURANCE",    status: "BLOCKED",    daysStuck: 2, actor: "Staff",     practice: "Summit Clinic", insurance: "Aetna",     nextAction: "Submit PA form to Aetna PBM with clinical justification" },
  { id: "RF-003", token: "pt-9b4e", med: "Sertraline 50mg",      medClass: "chronic_standard",  blockType: "VISIT",        status: "BLOCKED",    daysStuck: 1, actor: "Patient",   practice: "Valley Medical",insurance: "Cigna",     nextAction: "Send appointment scheduling link to patient" },
  { id: "RF-004", token: "pt-5f8a", med: "Atorvastatin 20mg",    medClass: "chronic_high_risk", blockType: "CLEAR",        status: "FILLING",    daysStuck: 0, actor: "Pharmacy",  practice: "MedReach",      insurance: "UHC",       nextAction: "Pharmacist verification in progress" },
  { id: "RF-005", token: "pt-1e6c", med: "Levothyroxine 50mcg",  medClass: "chronic_standard",  blockType: "MISSING_INFO", status: "BLOCKED",    daysStuck: 1, actor: "Staff",     practice: "ClearPath",     insurance: "Humana",    nextAction: "Confirm patient DOB — mismatch detected between EHR and Rx" },
  { id: "RF-006", token: "pt-3d9b", med: "Albuterol Inhaler",    medClass: "acute",             blockType: "CLEAR",        status: "RESOLVED",   daysStuck: 0, actor: "Done",      practice: "Valley Medical",insurance: "Cigna",     nextAction: "Patient notified for pickup" },
  { id: "RF-007", token: "pt-8a2f", med: "Metoprolol 25mg",      medClass: "chronic_high_risk", blockType: "NO_REFILLS",   status: "BLOCKED",    daysStuck: 4, actor: "Provider",  practice: "Summit Clinic", insurance: "Aetna",     nextAction: "Urgent: 4 days stuck — escalate to senior provider" },
  { id: "RF-008", token: "pt-6c7e", med: "Omeprazole 20mg",      medClass: "chronic_standard",  blockType: "INSURANCE",    status: "BLOCKED",    daysStuck: 2, actor: "Staff",     practice: "CareFirst",     insurance: "BlueCross", nextAction: "Appeal step therapy requirement — Omeprazole is tier-2 alternative" },
].map(r => ({
  ...r,
  priorityScore: computePriorityScore(r.daysStuck, r.medClass, r.blockType),
  priorityReason: `${MED_CLASS_RISK[r.medClass]?.reason ?? ""}; stuck ${r.daysStuck}d`,
})).sort((a, b) => b.priorityScore - a.priorityScore);

/* ── Status / priority display helpers ──────────────────── */
function StatusBadge({ status }: { status: string }) {
  if (status === "BLOCKED")  return <span className="badge badge-blocked"><AlertTriangle className="h-2.5 w-2.5" />Blocked</span>;
  if (status === "FILLING")  return <span className="badge badge-progress"><RefreshCw className="h-2.5 w-2.5" />Filling</span>;
  if (status === "RESOLVED") return <span className="badge badge-resolved"><CheckCircle className="h-2.5 w-2.5" />Resolved</span>;
  return <span className="badge badge-neutral">{status}</span>;
}

function PriorityBar({ score }: { score: number }) {
  const color = score >= 75 ? "#DC2626" : score >= 45 ? "#B45309" : "#6E7681";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-mono text-ink-400">{score}</span>
    </div>
  );
}

const ACTOR_COLORS: Record<string, string> = {
  Provider: "bg-accent-50 text-accent-700 border-accent-100",
  Staff:    "bg-ink-100 text-ink-700 border-ink-200",
  Pharmacy: "bg-warn-50 text-warn-700 border-warn-200",
  Patient:  "bg-ok-50 text-ok-700 border-ok-200",
  Done:     "bg-ok-50 text-ok-700 border-ok-200",
};

/* ── Savings counter (animates each resolve) ────────────── */
function SavingsCounter({ minutesSaved }: { minutesSaved: number }) {
  const [displayed, setDisplayed] = useState(minutesSaved);
  const prev = useRef(minutesSaved);
  useEffect(() => {
    if (minutesSaved === prev.current) return;
    const diff = minutesSaved - prev.current;
    const start = prev.current;
    prev.current = minutesSaved;
    const t0 = Date.now();
    const dur = 800;
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setDisplayed(Math.round(start + diff * p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [minutesSaved]);

  const hrs = (displayed / 60).toFixed(1);
  return (
    <div className="stat-card border-ok-200 bg-ok-50">
      <div className="stat-card__label flex items-center gap-1.5 text-ok-700">
        <TrendingUp className="h-3 w-3" /> Hours Saved This Session
      </div>
      <div className="stat-card__value text-ok-700">{hrs}h</div>
      <div className="stat-card__sub text-ok-700/60">{displayed} min · Est. {AVG_MANUAL_MINUTES} min avg manual resolution</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [selected, setSelected] = useState<string | null>(null);
  const [autonomyMode, setAutonomyMode] = useState<"DRAFT_ONLY" | "AUTONOMOUS">("DRAFT_ONLY");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [search, setSearch] = useState("");
  const [minutesSaved, setMinutesSaved] = useState(0);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Autonomous whitelisted actions
  const AUTO_WHITELIST = ["SEND_MISSING_INFO_SMS", "SEND_PROVIDER_ALERT"];

  const filtered = queue
    .filter(r => filterStatus === "ALL" || r.status === filterStatus)
    .filter(r => filterPriority === "ALL" ||
      (filterPriority === "HIGH" && r.priorityScore >= 75) ||
      (filterPriority === "MED" && r.priorityScore >= 45 && r.priorityScore < 75) ||
      (filterPriority === "LOW" && r.priorityScore < 45))
    .filter(r => !search || r.med.toLowerCase().includes(search.toLowerCase()) || r.token.includes(search));

  const selectedItem = queue.find(r => r.id === selected);

  const handleResolve = (id: string) => {
    setQueue(prev => prev.map(r => r.id === id ? { ...r, status: "RESOLVED", actor: "Done", daysStuck: 0 } : r));
    setMinutesSaved(m => m + AVG_MANUAL_MINUTES);
    setSelected(null);
  };

  // Autonomy engine
  const handleAction = (id: string, actionType: string) => {
    const isWhitelisted = AUTO_WHITELIST.some(a => actionType.includes(a.split("_").slice(-2).join(" ").toLowerCase()));
    if (autonomyMode === "AUTONOMOUS" && isWhitelisted) {
      // Auto-execute — skip confirmation
      setQueue(prev => prev.map(r => r.id === id ? { ...r, status: "FILLING" } : r));
      setPendingAction(`[AUTO] ${actionType} executed without confirmation`);
      setTimeout(() => setPendingAction(null), 3000);
    } else {
      // Draft-only — surface for human confirmation
      setPendingAction(`[DRAFT] Action ready for your confirmation: ${actionType}`);
    }
  };

  const stats = {
    total:    queue.length,
    blocked:  queue.filter(r => r.status === "BLOCKED").length,
    filling:  queue.filter(r => r.status === "FILLING").length,
    resolved: queue.filter(r => r.status === "RESOLVED").length,
  };

  return (
    <div className="page-frame">
      <Nav />

      {/* ── Autonomy banner ─────────────────────────────── */}
      <div className={`autonomy-bar mx-auto max-w-screen-xl px-6 mt-4 ${autonomyMode === "AUTONOMOUS" ? "autonomy-bar--auto" : "autonomy-bar--draft"}`}>
        <div className="flex items-center gap-2 flex-1">
          {autonomyMode === "AUTONOMOUS"
            ? <><Zap className="h-4 w-4" /><span className="font-semibold text-sm">Autonomous Mode</span><span className="text-sm"> — Low-risk actions execute automatically. Therapy-affecting decisions always require human confirmation.</span></>
            : <><Shield className="h-4 w-4" /><span className="font-semibold text-sm">Draft-Only Mode</span><span className="text-sm"> — Every action drafted for your review before execution.</span></>
          }
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-medium">{autonomyMode === "AUTONOMOUS" ? "Autonomous" : "Draft-only"}</span>
          <div className="toggle-track toggle-track--off cursor-pointer"
            style={autonomyMode === "AUTONOMOUS" ? { background: "var(--accent-600)" } : {}}
            onClick={() => setAutonomyMode(m => m === "DRAFT_ONLY" ? "AUTONOMOUS" : "DRAFT_ONLY")}>
            <div className={`toggle-thumb ${autonomyMode === "AUTONOMOUS" ? "toggle-thumb--on" : "toggle-thumb--off"}`} />
          </div>
        </div>
      </div>

      {/* Pending action toast */}
      {pendingAction && (
        <div className="max-w-screen-xl mx-auto px-6 mt-3">
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded border text-sm ${pendingAction.startsWith("[AUTO]") ? "bg-accent-50 border-accent-100 text-accent-700" : "bg-warn-50 border-warn-200 text-warn-700"}`}>
            {pendingAction.startsWith("[AUTO]") ? <Zap className="h-3.5 w-3.5 flex-shrink-0" /> : <Bell className="h-3.5 w-3.5 flex-shrink-0" />}
            <span className="flex-1">{pendingAction}</span>
            <button onClick={() => setPendingAction(null)}><X className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      )}

      <div className="container py-6">
        {/* ── Page header ──────────────────────────────── */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-4xl font-display font-bold text-ink-900 mb-1">Refill Queue</h1>
            <p className="text-sm text-ink-400">Shared worklist — sorted by clinical priority score</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-ok-700 bg-ok-50 border border-ok-200 px-3 py-1.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-ok-600 animate-pulse" />
            Live
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <SavingsCounter minutesSaved={minutesSaved} />
          {[
            { label: "Blocked",  val: stats.blocked,  sub: "Need action now",    cls: "border-warn-200 bg-warn-50", vcls: "text-warn-700" },
            { label: "Filling",  val: stats.filling,  sub: "In progress",        cls: "border-accent-100",          vcls: "text-accent-600" },
            { label: "Resolved", val: stats.resolved, sub: "This session",       cls: "border-ok-200 bg-ok-50",     vcls: "text-ok-600" },
          ].map((s, i) => (
            <div key={i} className={`stat-card ${s.cls}`}>
              <div className="stat-card__label">{s.label}</div>
              <div className={`stat-card__value ${s.vcls}`}>{s.val}</div>
              <div className="stat-card__sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2 input py-1.5 w-56">
            <Search className="h-3.5 w-3.5 text-ink-400 flex-shrink-0" />
            <input className="text-sm bg-transparent outline-none text-ink-900 placeholder:text-ink-400 w-full"
              placeholder="Search medication or token..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-ink-400" />
            {["ALL", "BLOCKED", "FILLING", "RESOLVED"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`btn btn-sm ${filterStatus === s ? "btn-primary" : "btn-ghost"}`}>{s}</button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {["ALL", "HIGH", "MED", "LOW"].map(p => (
              <button key={p} onClick={() => setFilterPriority(p)}
                className={`btn btn-sm ${filterPriority === p ? "btn-primary" : "btn-ghost"}`}>{p}</button>
            ))}
          </div>
        </div>

        {/* ── Main layout ──────────────────────────────── */}
        <div className={`grid gap-4 ${selected ? "grid-cols-1 xl:grid-cols-5" : "grid-cols-1"}`}>

          {/* Queue table */}
          <div className={`${selected ? "xl:col-span-3" : ""} card overflow-hidden`}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Token</th>
                  <th>Medication</th>
                  <th>Block</th>
                  <th>Status</th>
                  <th>Actor</th>
                  <th>Stuck</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className={`clickable ${selected === row.id ? "selected" : ""}`}
                    onClick={() => setSelected(selected === row.id ? null : row.id)}>
                    <td>
                      <div className="tooltip-wrap">
                        <PriorityBar score={row.priorityScore} />
                        <div className="tooltip-box max-w-[200px]">{row.priorityReason}</div>
                      </div>
                    </td>
                    <td><span className="font-mono text-xs text-ink-400">{row.token}</span></td>
                    <td className="font-medium text-ink-900">{row.med}</td>
                    <td><span className="text-xs text-ink-400">{row.blockType.replace("_", " ")}</span></td>
                    <td><StatusBadge status={row.status} /></td>
                    <td>
                      <span className={`badge border text-xs ${ACTOR_COLORS[row.actor] ?? "badge-neutral"}`}>
                        {row.actor}
                      </span>
                    </td>
                    <td>
                      {row.daysStuck > 0
                        ? <span className={`font-mono text-xs ${row.daysStuck >= 3 ? "text-warn-600" : "text-ink-400"}`}>{row.daysStuck}d</span>
                        : <span className="text-xs text-ink-400">—</span>}
                    </td>
                    <td><Eye className="h-3.5 w-3.5 text-ink-400" /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-sm text-ink-400">No refills match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selectedItem && (
            <div className="xl:col-span-2 space-y-3">
              {/* Header */}
              <div className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-mono text-xs text-ink-400 mb-1">{selectedItem.id} · {selectedItem.token}</div>
                    <h3 className="text-xl font-display font-bold text-ink-900">{selectedItem.med}</h3>
                    <div className="text-sm text-ink-400 mt-0.5">{selectedItem.practice} · {selectedItem.insurance}</div>
                  </div>
                  <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Priority */}
                <div className="bg-ink-50 rounded p-3 mb-4">
                  <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="h-3 w-3" /> Priority Score — {selectedItem.priorityScore}/100
                  </div>
                  <PriorityBar score={selectedItem.priorityScore} />
                  <p className="text-xs text-ink-400 mt-2 leading-relaxed">{selectedItem.priorityReason}</p>
                </div>

                <div className="space-y-2 text-sm">
                  {[
                    { l: "Block type",  v: selectedItem.blockType.replace(/_/g, " ") },
                    { l: "Med class",   v: selectedItem.medClass.replace(/_/g, " ")  },
                    { l: "Days stuck",  v: selectedItem.daysStuck > 0 ? `${selectedItem.daysStuck} days` : "Active today" },
                    { l: "Status",      v: selectedItem.status     },
                  ].map(({ l, v }) => (
                    <div key={l} className="flex justify-between py-1.5 border-b border-ink-100 last:border-0">
                      <span className="text-ink-400">{l}</span>
                      <span className="font-medium text-ink-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommended Action */}
              {selectedItem.status !== "RESOLVED" && (
                <div className="card p-4 border-accent-100 bg-accent-50">
                  <div className="text-xs font-semibold text-accent-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Zap className="h-3 w-3" /> AI Recommended Action
                  </div>
                  <p className="text-sm text-accent-700 leading-relaxed mb-3">{selectedItem.nextAction}</p>
                  <div className="reasoning-trace mb-3">
                    Block: {selectedItem.blockType}<br />
                    Med class: {selectedItem.medClass}<br />
                    Actor: {selectedItem.actor}<br />
                    Mode: {autonomyMode}<br />
                    PII: stripped before model call ✓
                  </div>
                  <div className="text-xs text-ink-400 mb-3">
                    Route to: <span className={`badge border ${ACTOR_COLORS[selectedItem.actor] ?? "badge-neutral"}`}>{selectedItem.actor}</span>
                  </div>
                  <div className="flex gap-2">
                    {autonomyMode === "AUTONOMOUS" && (selectedItem.blockType === "MISSING_INFO" || selectedItem.actor === "Staff") ? (
                      <button onClick={() => handleAction(selectedItem.id, "SEND_MISSING_INFO_SMS")}
                        className="btn btn-primary flex-1">
                        <Zap className="h-3.5 w-3.5" /> Auto-Execute
                      </button>
                    ) : (
                      <button onClick={() => handleAction(selectedItem.id, "SEND_PROVIDER_ALERT")}
                        className="btn btn-primary flex-1">
                        Confirm & Execute
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Resolve */}
              {selectedItem.status !== "RESOLVED" && (
                <button onClick={() => handleResolve(selectedItem.id)}
                  className="btn btn-secondary w-full justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-ok-600" /> Mark Resolved
                  <span className="text-xs text-ink-400 ml-1">(+{AVG_MANUAL_MINUTES} min saved)</span>
                </button>
              )}

              {selectedItem.status === "RESOLVED" && (
                <div className="card p-4 border-ok-200 bg-ok-50">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ok-700">
                    <CheckCircle className="h-4 w-4" /> Resolved
                  </div>
                  <p className="text-xs text-ok-700/70 mt-1">Audit trail logged. Patient notified generically (no medication name).</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
