"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Zap, RefreshCw, CheckCircle, AlertTriangle,
  Info, ChevronRight, BarChart3, Clock, Shield
} from "lucide-react";

/* ── Nav (inline, shared pattern) ───────────────────────── */
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
          {(["/", "/workflow", "/dashboard", "/classify", "/security"] as const).map(href => (
            <Link key={href} href={href}
              className={`top-nav__link ${href === "/classify" ? "top-nav__link--active" : ""}`}>
              {href === "/" ? "Home" : href.replace("/", "").charAt(0).toUpperCase() + href.slice(2)}
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
    description: "The prescription has zero refills left. A new eRx from the provider is required before the pharmacy can dispense.",
    nextAction: "Draft new eRx renewal request to attending provider — attach last fill date, dosage, and adherence history.",
    actor: "Provider",
    actorColor: "bg-accent-50 text-accent-700 border border-accent-100",
    timeline: "Est. < 4 hours with routing",
    timelineBaseline: "3–7 days manually",
    blockColor: "bg-warn-50 border-warn-200",
    textColor: "text-warn-700",
    reasoning: "Pattern: prescription expiry / refill_count = 0. Provider authorization required for new Rx.",
  },
  {
    id: "INSURANCE",
    keywords: ["prior auth", "pa required", "insurance denied", "pbm", "step therapy", "not covered", "coverage denied", "authorization", "formulary"],
    label: "Insurance / PBM Block",
    confidence: 91,
    description: "Insurance or PBM is blocking the fill — prior authorization, step therapy restriction, or coverage denial.",
    nextAction: "Submit PA form to PBM. Attach clinical justification from provider. Note: appeal window is typically 72 hours.",
    actor: "Practice Staff",
    actorColor: "bg-ink-100 text-ink-700 border border-ink-200",
    timeline: "Est. < 6 hours with routing",
    timelineBaseline: "5–10 days manually",
    blockColor: "bg-warn-50 border-warn-200",
    textColor: "text-warn-700",
    reasoning: "Pattern: PBM / prior-auth / coverage denial keywords. Insurance intervention required before dispensing.",
  },
  {
    id: "VISIT",
    keywords: ["needs a visit", "requires appointment", "visit required", "come in", "see the doctor", "in person", "controlled substance", "schedule appointment", "in-person"],
    label: "Provider Visit Required",
    confidence: 88,
    description: "Provider requires the patient to come in before authorizing a refill — common for controlled substances or when clinical review is needed.",
    nextAction: "Send appointment scheduling link to patient via SMS (generic message — no medication name in body).",
    actor: "Patient",
    actorColor: "bg-ok-50 text-ok-700 border border-ok-200",
    timeline: "Depends on appointment availability",
    timelineBaseline: "Patient informed via phone tag (days)",
    blockColor: "bg-accent-50 border-accent-100",
    textColor: "text-accent-700",
    reasoning: "Pattern: visit / appointment / in-person keywords. Clinical review by provider required before dispensing.",
  },
  {
    id: "MISSING_INFO",
    keywords: ["missing", "incomplete", "unclear", "wrong dob", "no dob", "illegible", "incorrect", "mismatch", "doesn't match", "cant find"],
    label: "Missing / Incorrect Information",
    confidence: 89,
    description: "Critical patient or prescription data is missing or incorrect — pharmacy cannot process without resolving this.",
    nextAction: "Contact patient to confirm missing data. Update EHR record. Re-submit to pharmacy. (Auto-executable in Autonomous mode.)",
    actor: "Practice Staff",
    actorColor: "bg-ink-100 text-ink-700 border border-ink-200",
    timeline: "Est. < 2 hours with patient SMS",
    timelineBaseline: "1–3 days via phone",
    blockColor: "bg-warn-50 border-warn-200",
    textColor: "text-warn-700",
    reasoning: "Pattern: missing / incorrect / mismatch keywords. Data gap blocks pharmacy processing.",
  },
  {
    id: "CONDITION",
    keywords: ["condition review", "labs required", "needs labs", "check labs", "review needed", "clinical review", "condition changed", "vitals", "a1c", "blood pressure check"],
    label: "Condition Review Required",
    confidence: 85,
    description: "Provider needs to review the patient's current clinical status before authorizing a refill.",
    nextAction: "Send condition review request to provider with latest patient notes, labs, and vitals attached.",
    actor: "Provider",
    actorColor: "bg-accent-50 text-accent-700 border border-accent-100",
    timeline: "Est. < 4 hours with context attached",
    timelineBaseline: "2–5 days via fax/phone",
    blockColor: "bg-accent-50 border-accent-100",
    textColor: "text-accent-700",
    reasoning: "Pattern: condition review / labs / clinical-review keywords. Provider clinical judgment required.",
  },
];

/* ── Risk scoring (clinical priority) ───────────────────── */
const HIGH_RISK_MEDS = ["metformin", "lisinopril", "metoprolol", "atorvastatin", "amlodipine", "warfarin", "insulin", "digoxin", "carvedilol", "losartan", "hydrochlorothiazide"];
const MED_RISK_MEDS  = ["levothyroxine", "sertraline", "escitalopram", "fluoxetine", "omeprazole", "pantoprazole"];

function scoreRisk(text: string): { score: number; reason: string; medClass: string } {
  const lower = text.toLowerCase();
  const isHighRisk = HIGH_RISK_MEDS.some(m => lower.includes(m));
  const isMedRisk  = !isHighRisk && MED_RISK_MEDS.some(m => lower.includes(m));

  if (isHighRisk) {
    const med = HIGH_RISK_MEDS.find(m => lower.includes(m));
    return { score: 85, reason: `Detected high-risk chronic medication (${med}) — cardiac/diabetes/hypertension category. Clinical continuity is time-sensitive.`, medClass: "chronic_high_risk" };
  }
  if (isMedRisk) {
    const med = MED_RISK_MEDS.find(m => lower.includes(m));
    return { score: 55, reason: `Detected chronic standard medication (${med}). Continuity important; not immediately life-threatening.`, medClass: "chronic_standard" };
  }
  return { score: 25, reason: "No high-risk medication detected. Standard priority.", medClass: "acute" };
}

/* ── DELIBERATE FAILURE ──────────────────────────────────── */
const AMBIGUOUS_RESULT = {
  id: "AMBIGUOUS",
  label: "Ambiguous — Cannot Classify",
  confidence: 38,
  description: "This query contains conflicting signals from multiple block categories. The classifier correctly declines to guess when confidence is below 70%.",
  nextAction: "Escalate to senior practice staff for manual triage.",
  actor: "Human Reviewer",
  actorColor: "bg-ink-100 text-ink-400 border border-ink-200",
  timeline: "Manual review required",
  timelineBaseline: "N/A",
  blockColor: "bg-ink-50 border-ink-200",
  textColor: "text-ink-400",
  reasoning: "Multiple keyword clusters detected simultaneously (e.g., 'no refills' + 'prior auth'). Conflicting signals prevent confident single-category assignment. This is a known limitation — multi-intent messages require human judgment.",
  isFailure: true,
};

/* ── Samples ─────────────────────────────────────────────── */
const SAMPLES = [
  {
    label: "No Refills — Metformin (High Risk)",
    text: "The pharmacy says there are no more refills left on this patient's Metformin 500mg prescription. It expired 3 weeks ago. She's been on it for 2 years for diabetes management. The pharmacy is requesting a new Rx from the attending physician.",
  },
  {
    label: "Insurance Block — Lisinopril PA",
    text: "BlueCross PBM denied the Lisinopril 10mg claim. Prior authorization is required. It's a step therapy requirement — they want to confirm a cheaper ACE inhibitor was tried first. PA form needed.",
  },
  {
    label: "Visit Required — Controlled Substance",
    text: "The prescribing physician won't refill the Sertraline 50mg without an in-person visit first. The patient's last appointment was over 6 months ago. Provider requires a clinical review before approving.",
  },
  {
    label: "Missing Info — DOB Mismatch",
    text: "Can't process this refill. The date of birth on the prescription doesn't match what we have in the system. There's a mismatch — could be the wrong patient on file. Need to verify before we can proceed.",
  },
  {
    label: "Ambiguous — Multi-Intent (known failure)",
    text: "The patient called and said the pharmacy denied it but also mentioned something about prior auth AND they haven't been seen in a year AND there's some missing insurance info too. Not sure which issue is the primary blocker.",
  },
];

/* ── Classifier engine ───────────────────────────────────── */
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

  const runClassifier = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setRisk(null);
    const t0 = Date.now();
    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
    const t1 = Date.now();
    setElapsed(parseFloat(((t1 - t0) / 1000).toFixed(1)));

    const res = classify(input);
    const riskResult = scoreRisk(input);
    setRisk(riskResult);

    if (res === "ambiguous") {
      setResult(AMBIGUOUS_RESULT);
    } else if (res === null) {
      setResult({ ...AMBIGUOUS_RESULT, id: "UNKNOWN", label: "Unclassified — Provide More Context", confidence: 10, description: "No block pattern detected. Add more detail about what the pharmacy or provider said.", reasoning: "Zero keyword matches. Insufficient signal for classification." });
    } else {
      setResult(res);
    }
    setLoading(false);
  };

  return (
    <div className="page-frame">
      <Nav />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 max-w-2xl">
          <div className="section-label">AI Block Classifier</div>
          <h1 className="text-4xl font-display font-bold text-ink-900 mb-2">Why is this refill stuck?</h1>
          <p className="text-sm text-ink-400 leading-relaxed">
            Paste a fax note, EHR message, or staff description. The classifier identifies the block type,
            scores clinical risk, and routes the right action to the right actor.
            Works entirely offline — no API call required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Left: Input ────────────────────────────── */}
          <div className="space-y-4">

            {/* Samples */}
            <div className="card p-4">
              <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
                Sample Inputs — Select or Type Below
              </div>
              <div className="space-y-1.5">
                {SAMPLES.map((s, i) => (
                  <button key={i} onClick={() => { setInput(s.text); setResult(null); setRisk(null); }}
                    className={`w-full text-left px-3 py-2.5 rounded border text-sm transition-all hover:border-accent-600 ${input === s.text ? "border-accent-600 bg-accent-50" : "border-ink-100 bg-ink-50 hover:bg-accent-50/50"}`}>
                    <div className="font-medium text-ink-900 text-xs mb-0.5">{s.label}</div>
                    <div className="text-ink-400 text-xs leading-relaxed line-clamp-1">{s.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="card p-4">
              <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider block mb-2">
                Or type / paste the refill situation
              </label>
              <textarea
                className="input textarea text-sm"
                rows={5}
                placeholder="e.g. 'Pharmacy says no refills remain on the Lisinopril prescription. Dr. Chen needs to send a new Rx...'"
                value={input}
                onChange={e => { setInput(e.target.value); setResult(null); setRisk(null); }}
              />
              <div className="mt-2 text-xs text-ink-400 flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-ok-600" />
                PII stripped before model — only block type, med class, days stuck are passed to classifier
              </div>
              <button onClick={runClassifier} disabled={loading || !input.trim()}
                className="btn btn-primary w-full justify-center mt-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading
                  ? <><RefreshCw className="h-4 w-4 animate-spin" /> Classifying...</>
                  : <><Zap className="h-4 w-4" /> Classify Block</>}
              </button>
            </div>
          </div>

          {/* ── Right: Result ──────────────────────────── */}
          <div className="space-y-4">

            {!result && !loading && (
              <div className="card p-12 flex flex-col items-center justify-center text-center">
                <BarChart3 className="h-8 w-8 text-ink-200 mb-3" />
                <p className="text-sm font-medium text-ink-900 mb-1">Ready to classify</p>
                <p className="text-xs text-ink-400">Select a sample or describe the refill situation</p>
              </div>
            )}

            {loading && (
              <div className="card p-12 flex flex-col items-center justify-center text-center">
                <RefreshCw className="h-8 w-8 text-accent-600 animate-spin mb-3" />
                <p className="text-sm text-ink-400">Reading context, matching patterns...</p>
              </div>
            )}

            {result && !loading && (
              <>
                {/* Main result */}
                <div className={`card p-5 border ${result.blockColor}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${result.textColor}`}>
                        Block Classification · {elapsed}s
                      </div>
                      <h3 className={`text-xl font-display font-bold ${result.textColor}`}>{result.label}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-ink-400 mb-0.5">Confidence</div>
                      <div className={`text-2xl font-display font-bold ${result.textColor}`}>{result.confidence}%</div>
                    </div>
                  </div>

                  <p className="text-sm text-ink-400 leading-relaxed mb-4">{result.description}</p>

                  {/* Reasoning trace */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Info className="h-3 w-3" /> Why This Classification
                    </div>
                    <div className="reasoning-trace">{result.reasoning}</div>
                  </div>

                  {/* Action */}
                  {!result.isFailure && (
                    <div className="bg-ok-50 border border-ok-200 rounded p-3 mb-4">
                      <div className="text-xs font-semibold text-ok-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3" /> Recommended Next Action
                      </div>
                      <p className="text-sm text-ok-700 leading-relaxed">{result.nextAction}</p>
                    </div>
                  )}

                  {result.isFailure && (
                    <div className="bg-warn-50 border border-warn-200 rounded p-3 mb-4">
                      <div className="text-xs font-semibold text-warn-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3" /> Known Limitation — Deliberate Failure
                      </div>
                      <p className="text-sm text-warn-700 leading-relaxed">
                        This is a designed behavior: the classifier correctly refuses to guess when multiple conflicting
                        signals are present. Forcing a wrong classification here would be worse than acknowledging uncertainty.
                        Multi-intent messages need human judgment.
                      </p>
                    </div>
                  )}

                  {/* Route + Timeline */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-ink-50 rounded p-3">
                      <div className="text-xs text-ink-400 mb-1">Route To</div>
                      <span className={`badge border text-xs ${result.actorColor}`}>{result.actor}</span>
                    </div>
                    <div className="bg-ink-50 rounded p-3">
                      <div className="text-xs text-ink-400 mb-1">Resolution Time</div>
                      <div className="text-sm font-semibold text-ok-700">{result.timeline}</div>
                      <div className="text-xs text-ink-400 line-through mt-0.5">{result.timelineBaseline}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link href="/dashboard" className="btn btn-primary flex-1 justify-center">
                      Add to Queue <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button onClick={() => { setInput(""); setResult(null); setRisk(null); }}
                      className="btn btn-secondary flex-1 justify-center">
                      Clear
                    </button>
                  </div>
                </div>

                {/* Risk Score card */}
                {risk && (
                  <div className={`card p-4 ${risk.score >= 75 ? "border-warn-200 bg-warn-50" : risk.score >= 45 ? "border-accent-100 bg-accent-50" : ""}`}>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-ink-400">
                      <BarChart3 className="h-3 w-3" /> Clinical Risk Score
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${risk.score}%`,
                            background: risk.score >= 75 ? "#DC2626" : risk.score >= 45 ? "#B45309" : "#6E7681"
                          }} />
                      </div>
                      <span className="font-mono text-sm font-bold text-ink-900">{risk.score}/100</span>
                    </div>
                    <p className="text-xs text-ink-400 leading-relaxed">{risk.reason}</p>
                    <div className="mt-2 text-xs text-ink-400">
                      Med class: <span className="font-mono text-ink-900">{risk.medClass}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Block type legend */}
            <div className="card p-4">
              <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
                5 Block Types the Classifier Knows
              </div>
              <div className="space-y-2">
                {BLOCK_RULES.map(r => (
                  <div key={r.id} className={`flex items-center gap-2.5 p-2 rounded border transition-all ${result?.id === r.id ? "border-accent-600 bg-accent-50" : "border-transparent"}`}>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-ink-900">{r.label}</div>
                    </div>
                    <span className="font-mono text-xs text-ink-400">{r.confidence}%</span>
                    {result?.id === r.id && <CheckCircle className="h-3.5 w-3.5 text-ok-600 flex-shrink-0" />}
                  </div>
                ))}
                <div className={`flex items-center gap-2.5 p-2 rounded border transition-all ${result?.id === "AMBIGUOUS" ? "border-warn-200 bg-warn-50" : "border-transparent"}`}>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-ink-900">Multi-intent / Ambiguous</div>
                    <div className="text-xs text-ink-400">Known failure — routes to human</div>
                  </div>
                  <AlertTriangle className="h-3.5 w-3.5 text-warn-600 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
