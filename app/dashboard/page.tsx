"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Clock, CheckCircle, AlertTriangle, RefreshCw, Bell, BarChart3, Filter, Search, ChevronRight, Eye, Zap } from "lucide-react";

/* ─── Mock refill queue data ─────────────────────────── */
const QUEUE = [
  {
    id: "RF-001", name: "Maria Rivera",    initials: "MR", med: "Metformin 500mg",    dose: "2× daily",    provider: "Dr. Ahmed",   practice: "CareFirst",     blockReason: "No refills remaining",  blockType: "NO_REFILLS",     priority: "HIGH", status: "BLOCKED",    daysStuck: 3, nextAction: "Draft new eRx request to Dr. Ahmed", actor: "Provider",   insurance: "BlueCross"  },
  {
    id: "RF-002", name: "James Thompson",  initials: "JT", med: "Lisinopril 10mg",   dose: "1× daily",    provider: "Dr. Patel",   practice: "Summit Clinic", blockReason: "PBM prior auth required", blockType: "INSURANCE",     priority: "HIGH", status: "BLOCKED",    daysStuck: 2, nextAction: "Submit PA form to BlueCross PBM",  actor: "Practice",   insurance: "Aetna"      },
  {
    id: "RF-003", name: "Aisha Patel",     initials: "AP", med: "Sertraline 50mg",   dose: "1× daily",    provider: "Dr. Chen",    practice: "Valley Medical", blockReason: "Provider visit required", blockType: "VISIT",         priority: "MED",  status: "BLOCKED",    daysStuck: 1, nextAction: "Schedule patient appointment",    actor: "Patient",    insurance: "Cigna"      },
  {
    id: "RF-004", name: "Robert Johnson",  initials: "RJ", med: "Atorvastatin 20mg", dose: "1× nightly",  provider: "Dr. Williams",practice: "MedReach",      blockReason: "Refills available",      blockType: "CLEAR",         priority: "LOW",  status: "FILLING",    daysStuck: 0, nextAction: "Pharmacist verification pending",  actor: "Pharmacy",   insurance: "UHC"        },
  {
    id: "RF-005", name: "Susan Kim",       initials: "SK", med: "Levothyroxine 50mcg","dose": "1× morning", provider: "Dr. Nguyen",  practice: "ClearPath",     blockReason: "Missing patient DOB",   blockType: "MISSING_INFO",   priority: "MED",  status: "BLOCKED",    daysStuck: 1, nextAction: "Contact patient to confirm DOB",   actor: "Practice",   insurance: "Humana"     },
  {
    id: "RF-006", name: "David Park",      initials: "DP", med: "Albuterol Inhaler",  dose: "PRN",         provider: "Dr. Torres",  practice: "Valley Medical", blockReason: "Resolved",              blockType: "RESOLVED",       priority: "LOW",  status: "RESOLVED",   daysStuck: 0, nextAction: "Patient notified for pickup",      actor: "Done",       insurance: "Cigna"      },
  {
    id: "RF-007", name: "Linda Garcia",    initials: "LG", med: "Metoprolol 25mg",   dose: "2× daily",    provider: "Dr. Patel",   practice: "Summit Clinic", blockReason: "Condition review needed",blockType: "CONDITION",     priority: "HIGH", status: "BLOCKED",    daysStuck: 4, nextAction: "Send condition review request to provider", actor: "Provider", insurance: "Aetna"    },
  {
    id: "RF-008", name: "Tom Wilson",      initials: "TW", med: "Omeprazole 20mg",   dose: "1× daily",    provider: "Dr. Ahmed",   practice: "CareFirst",     blockReason: "Insurance step therapy", blockType: "INSURANCE",      priority: "MED",  status: "BLOCKED",    daysStuck: 2, nextAction: "Appeal step therapy requirement",  actor: "Practice",   insurance: "BlueCross"  },
];

const STATUS_COLORS: Record<string, string> = {
  BLOCKED: "bg-red-100 text-red-700",
  FILLING: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-500",
  MED:  "bg-amber-400",
  LOW:  "bg-green-400",
};

const BLOCK_ICONS: Record<string, string> = {
  NO_REFILLS:   "🔄",
  INSURANCE:    "🛡️",
  VISIT:        "🏥",
  MISSING_INFO: "❓",
  CONDITION:    "👁️",
  CLEAR:        "✅",
  RESOLVED:     "✅",
};

const ACTOR_COLORS: Record<string, string> = {
  Provider: "bg-blue-100 text-blue-700",
  Practice: "bg-purple-100 text-purple-700",
  Pharmacy: "bg-amber-100 text-amber-700",
  Patient:  "bg-teal-100 text-teal-700",
  Done:     "bg-green-100 text-green-700",
};

export default function DashboardPage() {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = QUEUE.filter(r => {
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (filterPriority !== "ALL" && r.priority !== filterPriority) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.med.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const selected = QUEUE.find(r => r.id === selectedRow);

  const stats = {
    total:    QUEUE.length,
    blocked:  QUEUE.filter(r => r.status === "BLOCKED").length,
    filling:  QUEUE.filter(r => r.status === "FILLING").length,
    resolved: QUEUE.filter(r => r.status === "RESOLVED").length,
    highPri:  QUEUE.filter(r => r.priority === "HIGH").length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-[#64748b] hover:text-[#22c55e] text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <span className="text-[#e2e8f0]">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>Rx</div>
              <span className="font-black text-sm">RefillOS</span>
              <span className="text-[10px] bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded-full font-bold">LIVE DASHBOARD</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { href: "/", label: "Home" },
              { href: "/workflow", label: "Workflow" },
              { href: "/dashboard", label: "Dashboard", active: true },
              { href: "/classify", label: "AI Classifier" },
            ].map(l => (
              <Link key={l.href} href={l.href} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${(l as any).active ? "bg-[#f0fdf4] text-[#22c55e]" : "text-[#64748b] hover:text-[#22c55e]"}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/classify" className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold px-4 py-2 rounded-full transition-all">
            AI Classifier <Zap className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 py-6">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="font-black text-2xl text-[#0f172a]" style={{ fontFamily: "Poppins,sans-serif" }}>Refill Queue</h1>
            <p className="text-sm text-[#64748b] mt-0.5">Live view of all active refill requests — sorted by priority</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#22c55e] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" /> Live · Updated just now
          </div>
        </div>

        {/* ── Stat cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          {[
            { label: "Total",    val: stats.total,    color: "bg-white",          text: "#0f172a", border: "#e2e8f0" },
            { label: "Blocked",  val: stats.blocked,  color: "bg-red-50",         text: "#dc2626", border: "#fecaca" },
            { label: "Filling",  val: stats.filling,  color: "bg-amber-50",       text: "#b45309", border: "#fde68a" },
            { label: "Resolved", val: stats.resolved, color: "bg-green-50",       text: "#15803d", border: "#bbf7d0" },
            { label: "HIGH Priority", val: stats.highPri, color: "bg-red-50",     text: "#dc2626", border: "#fecaca" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-4 border" style={{ background: s.color, borderColor: s.border }}>
              <div className="font-black text-2xl" style={{ fontFamily: "Poppins", color: s.text }}>{s.val}</div>
              <div className="text-xs text-[#64748b] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-xl px-3 py-2 flex-1 max-w-xs">
            <Search className="h-4 w-4 text-[#94a3b8]" />
            <input
              className="text-sm outline-none bg-transparent text-[#0f172a] placeholder:text-[#94a3b8] w-full"
              placeholder="Search patient or medication..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-[#94a3b8]" />
            {["ALL", "BLOCKED", "FILLING", "RESOLVED"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${filterStatus === s ? "bg-[#22c55e] text-white border-[#22c55e]" : "bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#22c55e]"}`}>
                {s}
              </button>
            ))}
            <span className="text-[#e2e8f0] mx-1">|</span>
            {["ALL", "HIGH", "MED", "LOW"].map(p => (
              <button key={p} onClick={() => setFilterPriority(p)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${filterPriority === p ? "bg-[#22c55e] text-white border-[#22c55e]" : "bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#22c55e]"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main layout: table + detail panel ───────────────── */}
        <div className={`grid gap-5 ${selectedRow ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>

          {/* Queue table */}
          <div className={`${selectedRow ? "lg:col-span-2" : "col-span-1"}`}>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f1f5f9] bg-[#f8fafc]">
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#64748b] uppercase tracking-wide">Priority</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#64748b] uppercase tracking-wide">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#64748b] uppercase tracking-wide hidden md:table-cell">Medication</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#64748b] uppercase tracking-wide hidden lg:table-cell">Block Reason</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#64748b] uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#64748b] uppercase tracking-wide hidden lg:table-cell">Next Action Owner</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr key={row.id}
                      className={`border-b border-[#f8fafc] transition-all cursor-pointer ${selectedRow === row.id ? "bg-[#f0fdf4]" : "hover:bg-[#f8fafc]"} ${i === filtered.length - 1 ? "border-0" : ""}`}
                      onClick={() => setSelectedRow(selectedRow === row.id ? null : row.id)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${PRIORITY_COLORS[row.priority]}`} />
                          <span className="text-xs font-bold text-[#64748b]">{row.priority}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${row.status === "BLOCKED" ? "bg-red-100 text-red-600" : row.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {row.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-[#0f172a] text-sm">{row.name}</div>
                            <div className="text-[11px] text-[#94a3b8]">{row.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-sm font-medium text-[#334155]">{row.med}</div>
                        <div className="text-[11px] text-[#94a3b8]">{row.dose}</div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{BLOCK_ICONS[row.blockType]}</span>
                          <span className="text-xs text-[#334155]">{row.blockReason}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[row.status]}`}>
                          {row.status}
                        </span>
                        {row.daysStuck > 0 && (
                          <div className="text-[10px] text-red-500 mt-0.5">{row.daysStuck}d stuck</div>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ACTOR_COLORS[row.actor] || "bg-gray-100 text-gray-600"}`}>
                          → {row.actor}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 hover:bg-[#f0fdf4] rounded-lg transition-all text-[#94a3b8] hover:text-[#22c55e]">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-10 text-[#94a3b8] text-sm">No refills match your filters.</div>
              )}
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="lg:col-span-1 space-y-3">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">{selected.id}</div>
                    <h3 className="font-black text-lg text-[#0f172a]">{selected.name}</h3>
                    <div className="text-sm text-[#64748b]">{selected.med} · {selected.dose}</div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 ${PRIORITY_COLORS[selected.priority]}`} />
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    { label: "Provider",  value: selected.provider  },
                    { label: "Practice",  value: selected.practice  },
                    { label: "Insurance", value: selected.insurance  },
                    { label: "Status",    value: selected.status    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#f1f5f9] last:border-0">
                      <span className="text-[#94a3b8] font-medium">{label}</span>
                      <span className="font-semibold text-[#0f172a]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Block Reason */}
              {selected.status === "BLOCKED" && (
                <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{BLOCK_ICONS[selected.blockType]}</span>
                    <span className="font-bold text-red-700 text-sm">Block Detected</span>
                  </div>
                  <p className="text-sm text-red-600">{selected.blockReason}</p>
                  {selected.daysStuck > 0 && (
                    <div className="mt-2 text-xs text-red-500 font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Stuck for {selected.daysStuck} day{selected.daysStuck > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              )}

              {/* Next Action */}
              <div className="bg-[#f0fdf4] rounded-2xl border border-[#bbf7d0] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-[#22c55e]" />
                  <span className="font-bold text-[#15803d] text-sm">AI Recommended Action</span>
                </div>
                <p className="text-sm text-[#166534] mb-3">{selected.nextAction}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748b]">Route to:</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ACTOR_COLORS[selected.actor] || ""}`}>
                    {selected.actor}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Mark as Resolved
                </button>
                <Link href="/classify" className="w-full bg-white border border-[#e2e8f0] hover:border-[#22c55e] text-[#334155] text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4 text-[#22c55e]" /> Re-run AI Classifier
                </Link>
                <button className="w-full bg-white border border-[#e2e8f0] text-[#64748b] text-xs font-medium py-2 rounded-xl hover:bg-[#f8fafc] transition-all flex items-center justify-center gap-2">
                  <Bell className="h-3.5 w-3.5" /> Send Patient SMS Update
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 text-center">
          <Link href="/classify" className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-bold px-6 py-3 rounded-full shadow-lg transition-all">
            Classify a New Refill Block with AI <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
