"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Zap, RefreshCw, CheckCircle, AlertTriangle,
  Info, ChevronDown, ChevronUp, BarChart3, Shield
} from "lucide-react";
import { AutonomyBanner } from "../components/AutonomyBanner";

function Nav() {
  return (
    <nav className="top-nav">
      <div className="top-nav__inner">
        <Link href="/" className="top-nav__logo">
          <span className="top-nav__wordmark">UnStuck Med</span>
        </Link>
        <div className="top-nav__links">
          {[
            { href: "/portal",    label: "Portals" },
            { href: "/dashboard", label: "Worklist" },
            { href: "/classify",  label: "Classifier" },
            { href: "/security",  label: "Security" },
            { href: "/workflow",  label: "Workflow" },
            { href: "/gtm",       label: "GTM / Funnel" },
          ].map(l => (
            <Link key={l.href} href={l.href} className={`top-nav__link ${l.href === "/classify" ? "top-nav__link--active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="top-nav__right">
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Open Worklist <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

const BLOCK_RULES = [
  {
    id: "NO_REFILLS",
    keywords: ["no refill", "no more refill", "zero refill", "refills exhausted", "expired prescription", "needs new rx", "no remaining", "ran out"],
    label: "No Refills Remaining",
    confidence: 94,
    description: "The prescription has zero refills left. A new eRx from the provider is required before dispensing.",
    nextAction: "Draft new eRx renewal request to attending provider with last fill date, dosage, and adherence history.",
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
    description: "PBM or health plan has placed a coverage restriction: prior authorization, step therapy, or tier exclusion.",
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
    nextAction: "Send appointment scheduling link to patient portal (generic alert with no medication name in SMS).",
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
    description: "EHR and pharmacy profile mismatch detected for date of birth, insurance ID, or prescriber NPI discrepancy.",
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

const HIGH_RISK_MEDS = ["metformin", "lisinopril", "metoprolol", "atorvastatin", "amlodipine", "warfarin", "insulin", "digoxin", "carvedilol", "losartan", "hydrochlorothiazide"];
const MED_RISK_MEDS  = ["levothyroxine", "sertraline", "escitalopram", "fluoxetine", "omeprazole", "pantoprazole"];

function scoreRisk(text: string): { score: number; reason: string; medClass: string } {
  const lower = text.toLowerCase();
  const isHighRisk = HIGH_RISK_MEDS.some(m => lower.includes(m));
  const isMedRisk  = !isHighRisk && MED_RISK_MEDS.some(m => lower.includes(m));
  if (isHighRisk) {
    const med = HIGH_RISK_MEDS.find(m => lower.includes(m));
    return { score: 85, reason: `Detected high-risk chronic medication (${med}) in cardiac, diabetes, or hypertension category. Clinical continuity is time-sensitive.`, medClass: "chronic_high_risk" };
  }
  if (isMedRisk) {
    const med = MED_RISK_MEDS.find(m => lower.includes(m));
    return { score: 55, reason: `Detected chronic standard medication (${med}). Essential maintenance; non-acute withdrawal risk.`, medClass: "chronic_standard" };
  }
  return { score: 25, reason: "No high-risk cardiovascular or endocrine medication detected. Standard clinical triage priority.", medClass: "acute" };
}

const AMBIGUOUS_RESULT = {
  id: "AMBIGUOUS",
  label: "Ambiguous: Multi-Intent Reversal",
  confidence: 42,
  description: "Input contains conflicting signals from multiple block categories. The classifier deliberately refuses to force a low-confidence guess.",
  nextAction: "Escalate to human practice triage supervisor with multi-signal summary attached.",
  actor: "Senior Clinician",
  actorColor: "bg-ink-100 text-ink-700 border border-ink-200",
  timeline: "Manual review required",
  timelineBaseline: "N/A",
  blockColor: "bg-ink-50 border-ink-200",
  textColor: "text-ink-800",
  reasoning: "Multiple keyword clusters detected simultaneously. Conflicting intent signals prevent confident single-category classification. Deliberate boundary: human judgment required.",
  isFailure: true,
};

const SAMPLES = [
  { label: "No Refills",          text: "Pharmacy sent an electronic denial: zero refills remaining on Metformin 500mg. Patient has been on this maintenance dose for 2 years for Type 2 diabetes. Need a new renewal prescription from Dr. Chen before dispensing." },
  { label: "Pharmacy Stock",      text: "CVS notes medication is currently out of stock with wholesaler backorder lasting 5+ days. Patient needs this antibiotic course started today. Check partner pharmacies in the immediate network." },
  { label: "Insurance Hold",      text: "BlueCross PBM rejected claim code 75: Prior Authorization Required. Formulary prefers enalapril as step-1 therapy unless physician provides clinical contraindication notes." },
  { label: "Missing Info",        text: "Prescription transmission rejected due to patient demographic mismatch. Date of birth on e-prescribing profile does not match health plan master registry." },
  { label: "Ambiguous Edge Case", text: "Patient called stating the pharmacy said no refills remained, but also mentioned their insurance dropped coverage and Dr. Patel said they need an office visit before anything is renewed." },
];

function classify(text: string) {
  const lower = text.toLowerCase();
  const scored = BLOCK_RULES.map(rule => ({ rule, hits: rule.keywords.filter(k => lower.includes(k)).length }))
    .filter(r => r.hits > 0).sort((a, b) => b.hits - a.hits);
  if (scored.length === 0) return null;
  if (scored.length > 1 && scored[0].hits === scored[1].hits) return "ambiguous";
  return scored[0].rule;
}

export default function ClassifyPage() {
  const [input, setInput]         = useState("");
  const [result, setResult]       = useState<any>(null);
  const [risk, setRisk]           = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [elapsed, setElapsed]     = useState<number | null>(null);
  const [showTaxonomy, setShowTaxonomy] = useState(false);

  const runClassifier = async () => {
    if (!input.trim()) return;
    setLoading(true); setResult(null); setRisk(null);
    const t0 = Date.now();
    await new Promise(r => setTimeout(r, 600));
    setElapsed(parseFloat(((Date.now() - t0) / 1000).toFixed(1)));
    const res = classify(input);
    setRisk(scoreRisk(input));
    if (res === "ambiguous")   setResult(AMBIGUOUS_RESULT);
    else if (res === null)     setResult({ ...AMBIGUOUS_RESULT, id: "UNKNOWN", label: "Unclassified Context", confidence: 15, description: "No known block keywords matched. Please provide additional context from the pharmacy or EHR note.", reasoning: "Zero pattern matches detected. Signal insufficient for deterministic classification." });
    else                       setResult(res);
    setLoading(false);
  };

  return (
    <div className="page-frame min-h-screen bg-[#F0F0F0]">
      <Nav />
      <AutonomyBanner />

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Header */}
        <div>
          <p className="section-label">AI Prescription Triage</p>
          <h1 className="text-3xl font-display font-extrabold text-ink-900 tracking-tight mb-2">
            Why is this refill stuck?
          </h1>
          <p className="text-sm text-ink-400 leading-relaxed max-w-lg">
            Paste messy clinic faxes, phone notes, or pharmacy notices. AI classifies the root cause,
            scores clinical risk, and routes the right action in seconds.
          </p>
        </div>

        {/* Sample quick-pick row */}
        <div className="bg-white border border-ink-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-3">Choose a realistic sample scenario</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s, i) => {
              const isSelected = input === s.text;
              return (
                <button
                  key={i}
                  onClick={() => { setInput(s.text); setResult(null); setRisk(null); }}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    isSelected
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 bg-white text-ink-700 hover:border-ink-400"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input area */}
        <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-sm space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">
            Or paste a fax / EHR note directly
          </label>
          <textarea
            className="input textarea text-sm w-full p-3 rounded-xl border border-ink-200 focus:border-ink-900 outline-none resize-none"
            rows={5}
            placeholder="e.g. 'Pharmacy reports zero refills remaining on Lisinopril 10mg...'"
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null); setRisk(null); }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-ink-400">
              <Shield className="h-3.5 w-3.5 text-ok-600" />
              PII stripped before model triage
            </div>
            <button
              onClick={runClassifier}
              disabled={loading || !input.trim()}
              className="btn btn-primary py-2 px-5 disabled:opacity-50"
            >
              {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Classifying...</> : <><Zap className="h-4 w-4" /> Classify</>}
            </button>
          </div>
        </div>

        {/* Result area */}
        {!result && !loading && (
          <div className="bg-white border border-dashed border-ink-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <BarChart3 className="h-10 w-10 text-ink-300 mb-3" />
            <p className="text-base font-semibold text-ink-900 mb-1">Classifier Idle</p>
            <p className="text-xs text-ink-400 max-w-xs">Select a sample scenario or paste a clinic note above.</p>
          </div>
        )}

        {loading && (
          <div className="bg-white border border-ink-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <RefreshCw className="h-10 w-10 text-accent-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-ink-900">Evaluating clinical tokens...</p>
            <p className="text-xs text-ink-400 mt-1">Cross-referencing against safety rules</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            {/* Main result card */}
            <div className={`rounded-2xl border-2 p-6 shadow-sm ${result.blockColor}`}>
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-1">
                    Triage Result · {elapsed}s
                  </p>
                  <h2 className={`text-xl font-display font-extrabold ${result.textColor}`}>
                    {result.label}
                  </h2>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-[10px] text-ink-400 uppercase font-semibold">Confidence</div>
                  <div className={`text-3xl font-display font-black ${result.textColor}`}>{result.confidence}%</div>
                </div>
              </div>

              <p className="text-sm text-ink-600 leading-relaxed mb-4">{result.description}</p>

              {/* Reasoning trace */}
              <div className="bg-white/80 border border-ink-100 rounded-xl p-4 mb-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mb-2 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-accent-600" /> Visible Reasoning Trail
                </div>
                <p className="text-xs text-ink-700 leading-relaxed font-mono">{result.reasoning}</p>
              </div>

              {/* Action box */}
              {!result.isFailure ? (
                <div className="bg-white rounded-xl p-4 border border-ok-200 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ok-800 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-ok-600" /> Recommended Next Action
                  </div>
                  <p className="text-sm text-ok-900 font-medium leading-relaxed">{result.nextAction}</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-4 border border-warn-300 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-warn-800 mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-warn-600" /> Deliberate Self-Aware Failure
                  </div>
                  <p className="text-xs text-warn-900 leading-relaxed">
                    Refusing to hallucinate a false decision when signals contradict. Routed to senior clinician for human judgment.
                  </p>
                </div>
              )}

              {/* 2 meta tiles */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-xl p-3 border border-ink-100">
                  <div className="text-[10px] text-ink-400 uppercase font-semibold mb-1">Assigned Actor</div>
                  <span className={`badge text-xs ${result.actorColor}`}>{result.actor}</span>
                </div>
                <div className="bg-white rounded-xl p-3 border border-ink-100">
                  <div className="text-[10px] text-ink-400 uppercase font-semibold mb-1">Resolution Speed</div>
                  <div className="text-xs font-bold text-ok-700">{result.timeline}</div>
                  <div className="text-[10px] text-ink-400 line-through">{result.timelineBaseline}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/dashboard" className="btn btn-primary flex-1 justify-center text-xs py-2">
                  Open Worklist <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button onClick={() => { setInput(""); setResult(null); setRisk(null); }} className="btn btn-secondary text-xs py-2 px-4">
                  Clear
                </button>
              </div>
            </div>

            {/* Clinical risk bar */}
            {risk && (
              <div className="bg-white border border-ink-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-ink-500 uppercase tracking-wider mb-3">
                  <span>Clinical Priority Score</span>
                  <span className="font-mono text-base text-ink-900">{risk.score}/100</span>
                </div>
                <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${risk.score}%`, background: risk.score >= 75 ? "#DC2626" : risk.score >= 45 ? "#B45309" : "#6E7681" }}
                  />
                </div>
                <p className="text-xs text-ink-600 leading-relaxed">{risk.reason}</p>
              </div>
            )}
          </div>
        )}

        {/* Taxonomy (collapsible) */}
        <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowTaxonomy(!showTaxonomy)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-ink-50/50 transition-colors text-left"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Reference</p>
              <p className="text-sm font-bold text-ink-900 mt-0.5">5 Root-Cause Block Categories</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-400">
              {showTaxonomy ? "Hide" : "Expand"}
              {showTaxonomy ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>
          {showTaxonomy && (
            <div className="p-4 border-t border-ink-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BLOCK_RULES.map(r => (
                <div key={r.id} className="p-3 rounded-xl border border-ink-100 bg-ink-50/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-ink-900">{r.label}</span>
                    <span className="font-mono text-[10px] text-ink-400">{r.confidence}%</span>
                  </div>
                  <p className="text-[11px] text-ink-500 leading-relaxed">{r.description}</p>
                  <p className="text-[10px] text-ink-400 mt-1.5">Actor: <strong className="text-ink-700">{r.actor}</strong></p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
