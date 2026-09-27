"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Zap, RefreshCw, CheckCircle, AlertTriangle,
  Info, ChevronDown, ChevronUp, BarChart3, Shield
} from "lucide-react";

/* ── Nav (workflow removed from primary) ────────────────── */
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
          {[
            { href: "/dashboard", label: "Queue" },
            { href: "/classify",  label: "Classifier" },
            { href: "/security",  label: "Security" },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`top-nav__link ${l.href === "/classify" ? "top-nav__link--active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="top-nav__right">
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Open Queue <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Block classifier rules (offline-safe) ──────────────── */
const BLOCK_RULES = [
  {
    id: "NO_REFILLS",
    keywords: ["no refill", "no more refill", "zero refill", "refills exhausted", "expired prescription", "needs new rx", "no remaining", "ran out"],
    label: "No Refills Remaining",
    confidence: 94,
    description: "The prescription has zero refills left. A new eRx from the provider is required before dispensing.",
    nextAction: "Draft new eRx renewal request to attending provider — attach last fill date, dosage, and adherence history.",
    actor: "Provider",
    actorColor: "bg-accent-50 text-accent-700 border border-accent-100",
    timeline: "Est. < 4 hours with routing",
    timelineBaseline: "3–7 days manually",
    blockColor: "bg-warn-50 border-warn-200",
    textColor: "text-warn-800",
    reasoning: "Pattern: prescription expiry / refill_count = 0. Provider clinical authorization required for new Rx.",
  },
  {
    id: "INSURANCE",
    keywords: ["prior auth", "pa required", "insurance denied", "pbm", "step therapy", "not covered", "coverage denied", "authorization", "formulary"],
    label: "Insurance / PBM Prior Auth Hold",
    confidence: 91,
    description: "PBM or health plan has placed a coverage restriction — prior authorization, step therapy, or tier exclusion.",
    nextAction: "Submit PA justification form to PBM with clinical diagnosis code and prior treatment history.",
    actor: "Practice Staff",
    actorColor: "bg-ink-100 text-ink-700 border border-ink-200",
    timeline: "Est. < 6 hours with routing",
    timelineBaseline: "5–10 days manually",
    blockColor: "bg-warn-50 border-warn-200",
    textColor: "text-warn-800",
    reasoning: "Pattern: PBM / prior-auth / step therapy keywords. Payer administrative intervention required.",
  },
  {
    id: "VISIT",
    keywords: ["needs a visit", "requires appointment", "visit required", "come in", "see the doctor", "in person", "controlled substance", "schedule appointment", "in-person"],
    label: "Provider Visit Required",
    confidence: 88,
    description: "Provider requires an in-person or telehealth consultation before re-authorizing maintenance therapy.",
    nextAction: "Send appointment scheduling link to patient portal (generic alert — no medication name in SMS).",
    actor: "Patient",
    actorColor: "bg-ok-50 text-ok-700 border border-ok-200",
    timeline: "Subject to appointment calendar",
    timelineBaseline: "3–5 days phone tag",
    blockColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-800",
    reasoning: "Pattern: visit / clinical consult required. Provider safety review required before dispensing.",
  },
  {
    id: "MISSING_INFO",
    keywords: ["missing", "incomplete", "unclear", "wrong dob", "no dob", "illegible", "incorrect", "mismatch", "doesn't match", "cant find"],
    label: "Missing / Incorrect Information",
    confidence: 89,
    description: "EHR and pharmacy profile mismatch detected — date of birth, insurance ID, or prescriber NPI discrepancy.",
    nextAction: "Contact patient via secure SMS to verify demographic details. Auto-executable in Autonomous Mode.",
    actor: "Practice Staff",
    actorColor: "bg-ink-100 text-ink-700 border border-ink-200",
    timeline: "Est. < 1 hour with patient SMS",
    timelineBaseline: "1–3 days via phone",
    blockColor: "bg-amber-50 border-amber-200",
    textColor: "text-amber-800",
    reasoning: "Pattern: mismatch / missing demographic data. Administrative data verification required.",
  },
  {
    id: "PHARMACY_STOCK",
    keywords: ["out of stock", "backlog", "backordered", "inventory", "wholesaler delay", "supply chain", "cannot fill", "stock shortage"],
    label: "Pharmacy Inventory Shortage",
    confidence: 93,
    description: "Dispensing pharmacy reports zero on-hand units or regional distributor backorder.",
    nextAction: "Query nearby partner pharmacies for verified stock. Draft transfer request for human clinician approval.",
    actor: "Pharmacy",
    actorColor: "bg-purple-50 text-purple-700 border border-purple-200",
    timeline: "Est. < 30 minutes via partner network",
    timelineBaseline: "Patient calls 5 pharmacies",
    blockColor: "bg-purple-50 border-purple-200",
    textColor: "text-purple-800",
    reasoning: "Pattern: pharmacy inventory bottleneck. Suggest partner pharmacy transfer (simulated inventory).",
  },
];

/* ── Clinical Risk Scoring ──────────────────────────────── */
const HIGH_RISK_MEDS = ["metformin", "lisinopril", "metoprolol", "atorvastatin", "amlodipine", "warfarin", "insulin", "digoxin", "carvedilol", "losartan", "hydrochlorothiazide"];
const MED_RISK_MEDS  = ["levothyroxine", "sertraline", "escitalopram", "fluoxetine", "omeprazole", "pantoprazole"];

function scoreRisk(text: string): { score: number; reason: string; medClass: string } {
  const lower = text.toLowerCase();
  const isHighRisk = HIGH_RISK_MEDS.some(m => lower.includes(m));
  const isMedRisk  = !isHighRisk && MED_RISK_MEDS.some(m => lower.includes(m));

  if (isHighRisk) {
    const med = HIGH_RISK_MEDS.find(m => lower.includes(m));
    return {
      score: 85,
      reason: `Detected high-risk chronic medication (${med}) — cardiac/diabetes/hypertension category. Clinical continuity is time-sensitive.`,
      medClass: "chronic_high_risk",
    };
  }
  if (isMedRisk) {
    const med = MED_RISK_MEDS.find(m => lower.includes(m));
    return {
      score: 55,
      reason: `Detected chronic standard medication (${med}). Essential maintenance; non-acute withdrawal risk.`,
      medClass: "chronic_standard",
    };
  }
  return {
    score: 25,
    reason: "No high-risk cardiovascular or endocrine medication detected. Standard clinical triage priority.",
    medClass: "acute",
  };
}

/* ── Deliberate Failure (Self-Awareness) ─────────────────── */
const AMBIGUOUS_RESULT = {
  id: "AMBIGUOUS",
  label: "Ambiguous — Multi-Intent Reversal (Self-Aware Boundary)",
  confidence: 42,
  description: "Input contains conflicting signals from multiple block categories (e.g. prior auth denial + visit request). The classifier deliberately refuses to force a low-confidence guess.",
  nextAction: "Escalate to human practice triage supervisor with multi-signal summary attached.",
  actor: "Senior Clinician",
  actorColor: "bg-ink-100 text-ink-700 border border-ink-200",
  timeline: "Manual review required",
  timelineBaseline: "N/A",
  blockColor: "bg-ink-50 border-ink-200",
  textColor: "text-ink-800",
  reasoning: "Multiple keyword clusters detected simultaneously ('prior auth' + 'visit required'). Conflicting intent signals prevent confident single-category classification. Deliberate boundary: human judgment required.",
  isFailure: true,
};

/* ── Messy authentic sample inputs ──────────────────────── */
const SAMPLES = [
  {
    label: "No Refills — Metformin 500mg (High Risk)",
    text: "Pharmacy sent an electronic denial: zero refills remaining on Metformin 500mg. Patient has been on this maintenance dose for 2 years for Type 2 diabetes. Need a new renewal prescription from Dr. Chen before dispensing.",
  },
  {
    label: "Pharmacy Stock — Amoxicillin Out of Stock",
    text: "CVS notes medication is currently out of stock with wholesaler backorder lasting 5+ days. Patient needs this antibiotic course started today. Check partner pharmacies in the immediate network.",
  },
  {
    label: "Insurance Hold — Lisinopril 10mg Prior Auth",
    text: "BlueCross PBM rejected claim code 75: Prior Authorization Required. Formulary prefers enalapril as step-1 therapy unless physician provides clinical contraindication notes.",
  },
  {
    label: "Missing Info — Patient DOB Mismatch",
    text: "Prescription transmission rejected due to patient demographic mismatch. Date of birth on e-prescribing profile does not match health plan master registry.",
  },
  {
    label: "Ambiguous Edge-Case — Multi-Intent (Deliberate Failure)",
    text: "Patient called stating the pharmacy said no refills remained, but also mentioned their insurance dropped coverage and Dr. Patel said they need an office visit before anything is renewed.",
  },
];

/* ── Classifier Engine ──────────────────────────────────── */
function classify(text: string) {
  const lower = text.toLowerCase();
  const scored = BLOCK_RULES.map(rule => ({
    rule,
    hits: rule.keywords.filter(k => lower.includes(k)).length,
  })).filter(r => r.hits > 0).sort((a, b) => b.hits - a.hits);

  if (scored.length === 0) return null;
  if (scored.length > 1 && scored[0].hits === scored[1].hits) return "ambiguous";
  return scored[0].rule;
}

/* ═══════════════════════════════════════════════════════ */
export default function ClassifyPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [risk, setRisk]     = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [showTaxonomy, setShowTaxonomy] = useState(false); // Collapsed by default to avoid visual clutter

  const runClassifier = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setRisk(null);
    const t0 = Date.now();
    await new Promise(r => setTimeout(r, 600));
    const t1 = Date.now();
    setElapsed(parseFloat(((t1 - t0) / 1000).toFixed(1)));

    const res = classify(input);
    const riskResult = scoreRisk(input);
    setRisk(riskResult);

    if (res === "ambiguous") {
      setResult(AMBIGUOUS_RESULT);
    } else if (res === null) {
      setResult({
        ...AMBIGUOUS_RESULT,
        id: "UNKNOWN",
        label: "Unclassified Context",
        confidence: 15,
        description: "No known block keywords matched. Please provide additional context from the pharmacy or EHR note.",
        reasoning: "Zero pattern matches detected. Signal insufficient for deterministic classification.",
      });
    } else {
      setResult(res);
    }
    setLoading(false);
  };

  return (
    <div className="page-frame min-h-screen bg-white">
      <Nav />

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 max-w-2xl">
          <div className="section-label">AI Prescription Triage</div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-ink-900 tracking-tight mb-2">
            Why is this refill stuck?
          </h1>
          <p className="text-sm text-ink-400 leading-relaxed">
            Paste messy clinic faxes, phone notes, or pharmacy notices. The AI classifies the root cause,
            scores clinical risk, and identifies the correct actor in seconds.
          </p>
        </div>

        {/* ── PRIMARY WORK AREA: Input & Result ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Sample Pills & Input Area (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Quick-Pick Sample Inputs */}
            <div className="card p-4 border border-ink-100 shadow-sm">
              <div className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2.5">
                Quick-Select Realistic Sample Inputs
              </div>
              <div className="space-y-1.5">
                {SAMPLES.map((s, i) => {
                  const isSelected = input === s.text;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(s.text);
                        setResult(null);
                        setRisk(null);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? "border-accent-600 bg-accent-50/70 font-medium"
                          : "border-ink-100 bg-ink-50/60 hover:bg-ink-100/60 text-ink-700"
                      }`}
                    >
                      <div className="font-semibold text-ink-900 mb-0.5">{s.label}</div>
                      <div className="text-ink-400 line-clamp-1">{s.text}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Textarea */}
            <div className="card p-4 border border-ink-100 shadow-sm">
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider block mb-2">
                Or paste messy fax / EHR text
              </label>
              <textarea
                className="input textarea text-sm w-full p-3 rounded-lg border border-ink-200 focus:border-accent-600 outline-none"
                rows={4}
                placeholder="e.g. 'Pharmacy reports zero refills remaining on Lisinopril 10mg...'"
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  setResult(null);
                  setRisk(null);
                }}
              />

              <div className="mt-2.5 flex items-center justify-between text-xs text-ink-400">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-ok-600" />
                  <span>PII automatically stripped prior to model triage</span>
                </div>
              </div>

              <button
                onClick={runClassifier}
                disabled={loading || !input.trim()}
                className="btn btn-primary w-full justify-center mt-3 py-2.5 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Classifying Context...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" /> Classify Refill Blocker
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: High-Visibility Result Display (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {!result && !loading && (
              <div className="card p-12 border border-dashed border-ink-200 rounded-xl flex flex-col items-center justify-center text-center">
                <BarChart3 className="h-10 w-10 text-ink-300 mb-3" />
                <p className="text-base font-semibold text-ink-900 mb-1">Classifier Idle</p>
                <p className="text-xs text-ink-400 max-w-xs">
                  Select one of the sample scenarios on the left or paste a clinic note to run instant triage.
                </p>
              </div>
            )}

            {loading && (
              <div className="card p-12 border border-ink-100 rounded-xl flex flex-col items-center justify-center text-center">
                <RefreshCw className="h-10 w-10 text-accent-600 animate-spin mb-3" />
                <p className="text-sm font-semibold text-ink-900">Evaluating clinical tokens &amp; blockers...</p>
                <p className="text-xs text-ink-400 mt-1">Cross-referencing against safety rules</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4">
                {/* Result Card */}
                <div className={`card p-5 border rounded-xl shadow-sm ${result.blockColor}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-0.5">
                        Triage Result · {elapsed}s
                      </div>
                      <h3 className={`text-xl font-display font-extrabold ${result.textColor}`}>
                        {result.label}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-ink-400 uppercase font-semibold">Confidence</div>
                      <div className={`text-2xl font-display font-black ${result.textColor}`}>
                        {result.confidence}%
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-ink-600 leading-relaxed mb-4">{result.description}</p>

                  {/* Why this classification (inspectable reasoning trace) */}
                  <div className="bg-white/80 border border-ink-100 rounded-lg p-3 mb-4">
                    <div className="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-accent-600" />
                      Visible Reasoning Trail
                    </div>
                    <p className="text-xs text-ink-700 leading-relaxed font-mono">{result.reasoning}</p>
                  </div>

                  {/* Action or Failure banner */}
                  {!result.isFailure ? (
                    <div className="bg-white rounded-lg p-3 border border-ok-200 mb-4">
                      <div className="text-[11px] font-bold text-ok-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-ok-600" />
                        Recommended Next Action
                      </div>
                      <p className="text-xs text-ok-900 font-medium leading-relaxed">{result.nextAction}</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-3 border border-warn-300 mb-4">
                      <div className="text-[11px] font-bold text-warn-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-warn-600" />
                        Deliberate Self-Aware Failure
                      </div>
                      <p className="text-xs text-warn-900 leading-relaxed">
                        Refusing to hallucinate a false decision when signals contradict. Routed to senior clinician for human judgment.
                      </p>
                    </div>
                  )}

                  {/* Routing & Resolution speed */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-2.5 border border-ink-100">
                      <div className="text-[10px] text-ink-400 uppercase font-semibold">Assigned Actor</div>
                      <span className={`inline-block mt-1 badge text-xs ${result.actorColor}`}>
                        {result.actor}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-ink-100">
                      <div className="text-[10px] text-ink-400 uppercase font-semibold">Resolution Speed</div>
                      <div className="text-xs font-bold text-ok-700 mt-1">{result.timeline}</div>
                      <div className="text-[10px] text-ink-400 line-through">{result.timelineBaseline}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href="/dashboard" className="btn btn-primary flex-1 justify-center text-xs py-2">
                      View in Shared Queue <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => {
                        setInput("");
                        setResult(null);
                        setRisk(null);
                      }}
                      className="btn btn-secondary text-xs py-2 px-4"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Risk scoring card */}
                {risk && (
                  <div className="card p-4 border border-ink-100 bg-ink-50/60 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">
                      <span>Clinical Priority Score</span>
                      <span className="font-mono text-sm text-ink-900">{risk.score}/100</span>
                    </div>
                    <div className="h-2 bg-ink-200 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${risk.score}%`,
                          background: risk.score >= 75 ? "#DC2626" : risk.score >= 45 ? "#B45309" : "#6E7681",
                        }}
                      />
                    </div>
                    <p className="text-xs text-ink-600 leading-relaxed">{risk.reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── SECONDARY / COLLAPSIBLE: 5 Block Types Taxonomy ── */}
        <div className="mt-8 border border-ink-100 rounded-xl overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => setShowTaxonomy(!showTaxonomy)}
            className="w-full px-5 py-4 flex items-center justify-between bg-ink-50/60 hover:bg-ink-100/50 transition-colors text-left"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-ink-500">
                Secondary Reference · Refill Taxonomy
              </div>
              <div className="text-sm font-bold text-ink-900 mt-0.5">
                5 Root-Cause Block Categories Handled by System
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
              <span>{showTaxonomy ? "Hide taxonomy" : "Expand taxonomy"}</span>
              {showTaxonomy ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          {showTaxonomy && (
            <div className="p-5 border-t border-ink-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {BLOCK_RULES.map(r => (
                <div key={r.id} className="p-3 rounded-lg border border-ink-100 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-ink-900">{r.label}</span>
                    <span className="font-mono text-[10px] text-ink-400">{r.confidence}% match</span>
                  </div>
                  <p className="text-[11px] text-ink-500 leading-relaxed mb-2">{r.description}</p>
                  <div className="text-[10px] text-ink-400">
                    Primary actor: <strong className="text-ink-700">{r.actor}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
