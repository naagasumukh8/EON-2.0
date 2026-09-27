"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Zap, RefreshCw, Clock, AlertTriangle, CheckCircle, ChevronDown } from "lucide-react";

/* ─── Block classifier logic (mock AI, offline-safe) ── */
const BLOCK_RULES = [
  {
    id: "NO_REFILLS",
    keywords: ["no refills", "no more refills", "zero refills", "refills exhausted", "expired prescription", "needs new rx", "no remaining"],
    label: "No Refills Remaining",
    icon: "🔄",
    color: "#fee2e2",
    textColor: "#dc2626",
    tagClass: "bg-red-100 text-red-700",
    confidence: 94,
    description: "The prescription has zero refills left. A new eRx from the provider is required before the pharmacy can dispense.",
    nextAction: "Send eRx renewal request to provider — attach last fill date, current dosage, and patient adherence note.",
    actor: "Provider",
    actorColor: "bg-blue-100 text-blue-700",
    timeline: "< 4 hours with RefillOS routing",
    timelineOld: "3–7 days manually",
    reasoning: "Keywords detected: prescription expiry / refill count = 0. Provider must authorize a new Rx.",
  },
  {
    id: "INSURANCE",
    keywords: ["prior auth", "pa required", "insurance denied", "pbm", "step therapy", "not covered", "coverage denied", "authorization"],
    label: "Insurance / PBM Block",
    icon: "🛡️",
    color: "#fef3c7",
    textColor: "#b45309",
    tagClass: "bg-amber-100 text-amber-700",
    confidence: 91,
    description: "Insurance or PBM is blocking the fill — prior authorization, step therapy, or coverage denial.",
    nextAction: "Submit PA form to PBM / appeal step therapy. Attach clinical justification from provider.",
    actor: "Practice Staff",
    actorColor: "bg-purple-100 text-purple-700",
    timeline: "< 6 hours with RefillOS routing",
    timelineOld: "5–10 days manually",
    reasoning: "Keywords detected: prior auth / PBM / coverage denial. Insurance intervention required before fill.",
  },
  {
    id: "VISIT",
    keywords: ["needs a visit", "requires appointment", "visit required", "come in", "see the doctor", "in person", "controlled", "schedule appointment"],
    label: "Provider Visit Required",
    icon: "🏥",
    color: "#dbeafe",
    textColor: "#1d4ed8",
    tagClass: "bg-blue-100 text-blue-700",
    confidence: 88,
    description: "Provider requires the patient to come in before authorizing a refill — common for controlled substances or when clinical review is needed.",
    nextAction: "Send appointment scheduling link to patient via SMS. Mark refill as 'Pending Visit'.",
    actor: "Patient",
    actorColor: "bg-teal-100 text-teal-700",
    timeline: "Depends on appointment slot",
    timelineOld: "Patient informed via phone tag (days)",
    reasoning: "Keywords detected: visit/appointment/in-person. Clinical review by provider needed before dispensing.",
  },
  {
    id: "MISSING_INFO",
    keywords: ["missing", "incomplete", "unclear", "wrong dob", "no dob", "illegible", "unknown", "no address", "incorrect"],
    label: "Missing / Incorrect Information",
    icon: "❓",
    color: "#f3e8ff",
    textColor: "#7e22ce",
    tagClass: "bg-purple-100 text-purple-700",
    confidence: 89,
    description: "Critical patient or prescription information is missing or incorrect — pharmacy cannot fill without it.",
    nextAction: "Contact patient to confirm missing info. Update EHR record. Re-submit to pharmacy.",
    actor: "Practice Staff",
    actorColor: "bg-purple-100 text-purple-700",
    timeline: "< 2 hours with patient SMS",
    timelineOld: "1–3 days via phone",
    reasoning: "Keywords detected: missing/incomplete/incorrect. Data gap blocks pharmacy processing.",
  },
  {
    id: "CONDITION",
    keywords: ["condition review", "labs required", "needs labs", "check labs", "review needed", "clinical review", "condition changed"],
    label: "Condition Review Required",
    icon: "👁️",
    color: "#dcfce7",
    textColor: "#15803d",
    tagClass: "bg-green-100 text-green-700",
    confidence: 85,
    description: "Provider needs to review the patient's current clinical status before authorizing a refill.",
    nextAction: "Send condition review request to provider with latest patient notes and lab results.",
    actor: "Provider",
    actorColor: "bg-blue-100 text-blue-700",
    timeline: "< 4 hours with context attached",
    timelineOld: "2–5 days via fax/phone",
    reasoning: "Keywords detected: condition review / labs. Provider clinical judgment required.",
  },
];

const DELIBERATE_FAILURE = {
  label: "Multi-intent / Ambiguous",
  icon: "⚠️",
  color: "#f8fafc",
  textColor: "#475569",
  tagClass: "bg-gray-100 text-gray-600",
  confidence: 38,
  description: "This query contains mixed signals — multiple block types are possible. A human reviewer should determine the primary block.",
  nextAction: "Escalate to senior practice staff for manual triage.",
  actor: "Human Reviewer",
  actorColor: "bg-gray-100 text-gray-600",
  reasoning: "Classifier detected conflicting signals — e.g. both 'no refills' and 'prior auth' keywords. Unable to determine primary block with confidence > 70%.",
};

/* ─── Sample inputs (messy, realistic) ─────────────────── */
const SAMPLES = [
  { label: "Sample A — No Refills",      text: "The pharmacy says there are no more refills left on Maria Rivera's Metformin 500mg prescription. It expired 3 weeks ago. She's been on it for 2 years. The pharmacy is asking for a new Rx from Dr. Ahmed." },
  { label: "Sample B — Insurance Block", text: "James Thompson's Lisinopril 10mg was denied by BlueCross PBM. Needs prior authorization. Pharmacy says it's a step therapy requirement — they want to see if a cheaper ACE inhibitor was tried first." },
  { label: "Sample C — Visit Required",  text: "Dr. Chen won't refill Aisha Patel's Sertraline 50mg without seeing her first. It's a controlled mood medication and her last appointment was over 6 months ago. Pharmacy is waiting." },
  { label: "Sample D — Missing Info",    text: "Can't process Robert Wilson's prescription. The date of birth on the Rx doesn't match what we have in the system. Could be a wrong patient. Need to verify before we can fill." },
  { label: "Sample E — Ambiguous (fails)", text: "The patient called and said they were denied but also haven't been seen in a year and the pharmacy mentioned something about prior auth too. Not sure which issue is the main blocker here." },
];

function classify(text: string) {
  const lower = text.toLowerCase();
  const scores: Array<{ rule: typeof BLOCK_RULES[0]; score: number }> = [];

  for (const rule of BLOCK_RULES) {
    const hits = rule.keywords.filter(k => lower.includes(k));
    if (hits.length > 0) scores.push({ rule, score: hits.length });
  }

  if (scores.length === 0) return null;
  if (scores.length > 1 && scores[0].score === scores[1].score) return "ambiguous";
  scores.sort((a, b) => b.score - a.score);
  return scores[0].rule;
}

export default function ClassifyPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const runClassifier = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    const t0 = Date.now();
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const t1 = Date.now();
    setElapsed(parseFloat(((t1 - t0) / 1000).toFixed(1)));
    const res = classify(input);
    if (res === "ambiguous") {
      setResult({ ...DELIBERATE_FAILURE, id: "AMBIGUOUS", label: DELIBERATE_FAILURE.label });
    } else if (res === null) {
      setResult({ id: "UNKNOWN", label: "Unclassified", icon: "🔍", color: "#f8fafc", textColor: "#475569", tagClass: "bg-gray-100 text-gray-600", confidence: 10, description: "No clear block pattern detected. Please provide more context about the refill situation.", nextAction: "Review manually or add more details to the query.", actor: "Human Reviewer", actorColor: "bg-gray-100 text-gray-600", reasoning: "No keyword patterns matched any block category." });
    } else {
      setResult(res);
    }
    setLoading(false);
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
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">AI CLASSIFIER</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[
              { href: "/", label: "Home" },
              { href: "/workflow", label: "Workflow" },
              { href: "/dashboard", label: "Dashboard" },
              { href: "/classify", label: "AI Classifier", active: true },
            ].map(l => (
              <Link key={l.href} href={l.href} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${(l as any).active ? "bg-[#f3e8ff] text-purple-700" : "text-[#64748b] hover:text-[#22c55e]"}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold px-4 py-2 rounded-full transition-all">
            Open Dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-1.5 text-xs font-bold text-purple-700 mb-4">
            <Zap className="h-3.5 w-3.5" /> Live AI Block Classifier · Offline-Safe
          </div>
          <h1 className="font-black text-3xl text-[#0f172a] mb-2" style={{ fontFamily: "Poppins,sans-serif" }}>
            Why Is This Refill <span style={{ color: "#22c55e" }}>Stuck?</span>
          </h1>
          <p className="text-[#64748b] max-w-lg mx-auto text-sm leading-relaxed">
            Paste a fax note, phone message, or EHR message. RefillOS classifies the block reason and
            routes the right action to the right actor — in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Input */}
          <div className="space-y-4">
            {/* Sample picker */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4">
              <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-3">
                📋 Try a Sample Input (or type your own below)
              </div>
              <div className="space-y-2">
                {SAMPLES.map((s, i) => (
                  <button key={i} onClick={() => { setInput(s.text); setResult(null); }}
                    className={`w-full text-left text-xs p-3 rounded-xl border transition-all hover:border-[#22c55e] hover:bg-[#f0fdf4] ${input === s.text ? "border-[#22c55e] bg-[#f0fdf4]" : "border-[#f1f5f9] bg-[#f8fafc]"}`}>
                    <div className="font-semibold text-[#334155] mb-0.5">{s.label}</div>
                    <div className="text-[#94a3b8] line-clamp-2 leading-relaxed">{s.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Text input */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4">
              <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
                ✏️ Or Type / Paste Your Refill Situation
              </div>
              <textarea
                className="w-full h-40 text-sm text-[#0f172a] bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3 resize-none outline-none focus:border-[#22c55e] transition-all placeholder:text-[#94a3b8] leading-relaxed"
                placeholder="e.g. 'The pharmacy says there are no refills remaining on her Metformin prescription. Dr. Ahmed needs to send a new Rx...'"
                value={input}
                onChange={e => { setInput(e.target.value); setResult(null); }}
              />
              <button
                onClick={runClassifier}
                disabled={loading || !input.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                {loading
                  ? <><RefreshCw className="h-4 w-4 animate-spin" /> Classifying...</>
                  : <><Zap className="h-4 w-4" /> Classify Block Reason</>}
              </button>
            </div>
          </div>

          {/* Right: Result */}
          <div className="space-y-4">
            {!result && !loading && (
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="text-5xl mb-4">🧠</div>
                <div className="font-bold text-[#0f172a] mb-2">Ready to Classify</div>
                <p className="text-sm text-[#64748b]">Select a sample or paste a refill situation, then click &quot;Classify Block Reason&quot;</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="text-5xl mb-4 animate-pulse">⚡</div>
                <div className="font-bold text-[#0f172a] mb-2">Analyzing...</div>
                <p className="text-sm text-[#64748b]">Reading context, matching patterns...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-3">
                {/* Block result card */}
                <div className="bg-white rounded-2xl border-2 overflow-hidden"
                  style={{ borderColor: result.textColor + "33" }}>
                  <div className="px-5 py-4 flex items-center gap-3" style={{ background: result.color }}>
                    <span className="text-3xl">{result.icon}</span>
                    <div className="flex-1">
                      <div className="font-black text-base" style={{ color: result.textColor }}>{result.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: result.textColor + "99" }}>
                        {elapsed}s · {result.confidence}% confidence
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold" style={{ color: result.textColor }}>Confidence</div>
                      <div className="text-2xl font-black" style={{ color: result.textColor }}>{result.confidence}%</div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Description */}
                    <div>
                      <div className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-1.5">What This Means</div>
                      <p className="text-sm text-[#334155] leading-relaxed">{result.description}</p>
                    </div>

                    {/* Reasoning trail */}
                    <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#f1f5f9]">
                      <div className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-1.5">🔍 Why This Classification</div>
                      <p className="text-xs text-[#64748b] leading-relaxed italic">{result.reasoning}</p>
                    </div>

                    {/* Next Action */}
                    <div className="bg-[#f0fdf4] rounded-xl p-3 border border-[#bbf7d0]">
                      <div className="text-xs font-bold text-[#22c55e] uppercase tracking-wide mb-1.5">⚡ Recommended Next Action</div>
                      <p className="text-sm text-[#166534] leading-relaxed">{result.nextAction}</p>
                    </div>

                    {/* Route to + Timeline */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl p-3 border border-[#e2e8f0]">
                        <div className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1">Route To</div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${result.actorColor}`}>
                          → {result.actor}
                        </span>
                      </div>
                      <div className="rounded-xl p-3 border border-[#e2e8f0]">
                        <div className="text-[10px] font-bold text-[#94a3b8] uppercase mb-1">Resolution Time</div>
                        <div className="text-xs font-bold text-[#22c55e]">{result.timeline}</div>
                        {result.timelineOld && (
                          <div className="text-[10px] text-[#94a3b8] line-through mt-0.5">{result.timelineOld}</div>
                        )}
                      </div>
                    </div>

                    {/* Deliberate failure note */}
                    {result.id === "AMBIGUOUS" && (
                      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                        <div className="text-xs font-bold text-amber-700 mb-1">⚠️ Known Limitation</div>
                        <p className="text-xs text-amber-600">This is a deliberate edge case where the classifier correctly declines to guess. Multi-intent queries with conflicting signals need human judgment — the system acknowledges this rather than forcing a wrong answer.</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href="/dashboard" className="flex-1 text-center text-xs font-bold py-2.5 rounded-xl text-white transition-all" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                        Add to Queue →
                      </Link>
                      <button onClick={() => { setInput(""); setResult(null); }}
                        className="flex-1 text-xs font-semibold py-2.5 rounded-xl border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] transition-all">
                        Clear &amp; Retry
                      </button>
                    </div>
                  </div>
                </div>

                {/* Block legend */}
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4">
                  <div className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-3">All 5 Block Types Classifier Knows</div>
                  <div className="space-y-2">
                    {BLOCK_RULES.map(r => (
                      <div key={r.id} className={`flex items-center gap-2.5 p-2 rounded-lg transition-all ${result.id === r.id ? "ring-2 ring-[#22c55e]" : ""}`}
                        style={{ background: result.id === r.id ? r.color : "#f8fafc" }}>
                        <span className="text-base">{r.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-[#0f172a]">{r.label}</div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.tagClass}`}>{r.confidence}%</span>
                        {result.id === r.id && <CheckCircle className="h-4 w-4 text-[#22c55e] flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
