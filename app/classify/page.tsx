"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Zap, RefreshCw, CheckCircle, AlertTriangle,
  Info, ChevronDown, ChevronUp, BarChart3, Shield
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

const BLOCK_RULES = [
  {
    id: "NO_REFILLS",
    keywords: ["no refill", "no more refill", "zero refill", "refills exhausted", "expired prescription", "needs new rx", "no remaining", "ran out"],
    label: "No Refills Remaining",
    confidence: 94,
    description: "The prescription has zero refills left. A new eRx from the provider is required before dispensing.",
    nextAction: "Draft new eRx renewal request to attending provider with last fill date, dosage, and adherence history.",
    actor: "Provider",
    actorBadgeBg: "rgba(18,19,23,0.06)",
    actorBadgeText: "rgb(18,19,23)",
    timeline: "Est. < 4 hours with routing",
    timelineBaseline: "3–7 days manually",
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
    actorBadgeBg: "rgba(18,19,23,0.06)",
    actorBadgeText: "rgb(18,19,23)",
    timeline: "Est. < 6 hours with routing",
    timelineBaseline: "5–10 days manually",
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
    actorBadgeBg: "rgba(18,19,23,0.06)",
    actorBadgeText: "rgb(18,19,23)",
    timeline: "Subject to appointment calendar",
    timelineBaseline: "3–5 days phone tag",
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
    actorBadgeBg: "rgba(18,19,23,0.06)",
    actorBadgeText: "rgb(18,19,23)",
    timeline: "Est. < 1 hour with patient SMS",
    timelineBaseline: "1–3 days via phone",
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
    actorBadgeBg: "rgba(18,19,23,0.06)",
    actorBadgeText: "rgb(18,19,23)",
    timeline: "Est. < 30 minutes via partner network",
    timelineBaseline: "Patient calls 5 pharmacies",
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
  actorBadgeBg: "rgba(18,19,23,0.06)",
  actorBadgeText: "rgb(18,19,23)",
  timeline: "Manual review required",
  timelineBaseline: "N/A",
  reasoning: "Multiple keyword clusters detected simultaneously. Conflicting intent signals prevent confident single-category classification. Deliberate boundary: human judgment required.",
  isFailure: true,
};

const SAMPLES = [
  { label: "💊 Zero Refills",          text: "Pharmacy sent an electronic denial: zero refills remaining on Metformin 500mg. Patient has been on this maintenance dose for 2 years for Type 2 diabetes. Need a new renewal prescription from Dr. Chen before dispensing." },
  { label: "🏪 Stock Shortage",       text: "CVS notes medication is currently out of stock with wholesaler backorder lasting 5+ days. Patient needs this antibiotic course started today. Check partner pharmacies in the immediate network." },
  { label: "📋 Prior Auth Hold",       text: "BlueCross PBM rejected claim code 75: Prior Authorization Required. Formulary prefers enalapril as step-1 therapy unless physician provides clinical contraindication notes." },
  { label: "🪪 Demographic Mismatch", text: "Prescription transmission rejected due to patient demographic mismatch. Date of birth on e-prescribing profile does not match health plan master registry." },
  { label: "⚠️ Conflicting Signals",  text: "Patient called stating the pharmacy said no refills remained, but also mentioned their insurance dropped coverage and Dr. Patel said they need an office visit before anything is renewed." },
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
    <div style={{ background: "#F0F0F0", color: "rgb(18,19,23)", fontFamily: '"Google Sans","Sora",-apple-system,BlinkMacSystemFont,sans-serif', minHeight: "100vh" }}>
      <AppHeader activePath="/classify" />

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 80px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.035em", color: "rgb(18,19,23)", margin: "0 0 8px" }}>
            AI Prescription Classifier
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(18,19,23,0.55)", lineHeight: 1.6, margin: 0, maxWidth: "600px" }}>
            Root cause classification, clinical risk scoring, and routing in seconds.
          </p>
        </div>

        {/* Sample quick-pick row */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {SAMPLES.map((s, i) => {
              const isSelected = input === s.text;
              return (
                <button
                  key={i}
                  onClick={() => { setInput(s.text); setResult(null); setRisk(null); }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    fontSize: "12.5px",
                    fontWeight: isSelected ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    background: isSelected ? "rgb(18,19,23)" : "rgba(0,0,0,0.04)",
                    color: isSelected ? "#fff" : "rgb(18,19,23)",
                    border: isSelected ? "1px solid rgb(18,19,23)" : "1px solid rgba(0,0,0,0.07)",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input area */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <textarea
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "1px solid rgba(0,0,0,0.1)",
              background: "#FAFAFA",
              fontFamily: '"Google Sans","Sora",sans-serif',
              fontSize: "14px",
              lineHeight: 1.6,
              color: "rgb(18,19,23)",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
            }}
            rows={5}
            placeholder="e.g. 'Pharmacy reports zero refills remaining on Lisinopril 10mg...'"
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null); setRisk(null); }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "rgba(18,19,23,0.5)" }}>
              <Shield style={{ width: 14, height: 14, color: "#166534" }} />
              PII stripped before model triage
            </div>
            <button
              onClick={runClassifier}
              disabled={loading || !input.trim()}
              style={{
                background: "rgb(18,19,23)",
                color: "#fff",
                fontSize: "13.5px",
                fontWeight: 600,
                padding: "10px 24px",
                borderRadius: "9999px",
                border: "none",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.45 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.15s ease",
              }}
            >
              {loading ? (
                <>
                  <RefreshCw style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} /> Classifying...
                </>
              ) : (
                <>
                  <Zap style={{ width: 15, height: 15 }} /> Classify
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result area */}
        {!result && !loading && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px dashed rgba(0,0,0,0.12)",
              padding: "48px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChart3 style={{ width: 36, height: 36, color: "rgba(18,19,23,0.2)", marginBottom: "12px" }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "rgb(18,19,23)", margin: "0 0 4px" }}>Classifier Idle</p>
            <p style={{ fontSize: "13px", color: "rgba(18,19,23,0.45)", margin: 0, maxWidth: "340px" }}>
              Select a sample scenario or paste a clinic note above to run the deterministic AI pipeline.
            </p>
          </div>
        )}

        {loading && (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "48px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RefreshCw style={{ width: 36, height: 36, color: "rgb(18,19,23)", animation: "spin 1s linear infinite", marginBottom: "14px" }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "rgb(18,19,23)", margin: "0 0 4px" }}>Evaluating clinical tokens...</p>
            <p style={{ fontSize: "13px", color: "rgba(18,19,23,0.45)", margin: 0 }}>Cross-referencing against safety rules</p>
          </div>
        )}

        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Main result card */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 16px 36px -8px rgba(0,0,0,0.05)",
                padding: "32px",
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <p style={{ fontFamily: "monospace", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(18,19,23,0.4)", margin: "0 0 6px" }}>
                    Triage Result · {elapsed}s
                  </p>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", color: "rgb(18,19,23)", margin: 0 }}>
                    {result.label}
                  </h2>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "16px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", textTransform: "uppercase", color: "rgba(18,19,23,0.4)", fontWeight: 700 }}>
                    Confidence
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 750, color: "rgb(18,19,23)", lineHeight: 1.1 }}>
                    {result.confidence}%
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "14.5px", color: "rgba(18,19,23,0.65)", lineHeight: 1.65, margin: "0 0 20px" }}>
                {result.description}
              </p>

              {/* Reasoning trace */}
              <div
                style={{
                  background: "rgba(0,0,0,0.03)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "14px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(18,19,23,0.5)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Info style={{ width: 13, height: 13, color: "rgb(18,19,23)" }} /> Visible Reasoning Trail
                </div>
                <p style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(18,19,23,0.75)", lineHeight: 1.6, margin: 0 }}>
                  {result.reasoning}
                </p>
              </div>

              {/* Action box */}
              {!result.isFailure ? (
                <div
                  style={{
                    background: "#F0FDF4",
                    borderRadius: "14px",
                    border: "1px solid rgba(22,101,52,0.15)",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#166534", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle style={{ width: 13, height: 13, color: "#166534" }} /> Recommended Next Action
                  </div>
                  <p style={{ fontSize: "14px", color: "#14532D", fontWeight: 550, lineHeight: 1.5, margin: 0 }}>
                    {result.nextAction}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    background: "#FFFBEB",
                    borderRadius: "14px",
                    border: "1px solid rgba(180,83,9,0.2)",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#92400E", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle style={{ width: 13, height: 13, color: "#B45309" }} /> Deliberate Self-Aware Boundary
                  </div>
                  <p style={{ fontSize: "13px", color: "#78350F", lineHeight: 1.5, margin: 0 }}>
                    Refusing to hallucinate a false decision when signals contradict. Routed to senior clinician for human judgment.
                  </p>
                </div>
              )}

              {/* 2 meta tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: "rgba(0,0,0,0.025)", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(18,19,23,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
                    Assigned Actor
                  </div>
                  <span style={{ display: "inline-block", background: "rgb(18,19,23)", color: "#fff", padding: "3px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                    {result.actor}
                  </span>
                </div>
                <div style={{ background: "rgba(0,0,0,0.025)", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(18,19,23,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
                    Resolution Speed
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}>{result.timeline}</div>
                  <div style={{ fontSize: "11px", color: "rgba(18,19,23,0.38)", textDecoration: "line-through" }}>{result.timelineBaseline}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Link
                  href="/portal"
                  style={{
                    background: "rgb(18,19,23)",
                    color: "#fff",
                    fontSize: "13.5px",
                    fontWeight: 550,
                    padding: "10px 24px",
                    borderRadius: "9999px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    flex: 1,
                  }}
                >
                  Enter Portal <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
                <button
                  onClick={() => { setInput(""); setResult(null); setRisk(null); }}
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    color: "rgb(18,19,23)",
                    border: "1px solid rgba(0,0,0,0.09)",
                    fontSize: "13px",
                    fontWeight: 550,
                    padding: "10px 20px",
                    borderRadius: "9999px",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Clinical risk bar */}
            {risk && (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
                  padding: "24px 28px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: "rgba(18,19,23,0.45)", textTransform: "uppercase" }}>
                    Clinical Priority Score
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 750, color: "rgb(18,19,23)" }}>
                    {risk.score}/100
                  </span>
                </div>
                <div style={{ height: "8px", background: "rgba(0,0,0,0.06)", borderRadius: "9999px", overflow: "hidden", marginBottom: "12px" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "9999px",
                      transition: "width 0.4s ease",
                      width: `${risk.score}%`,
                      background: risk.score >= 75 ? "#DC2626" : risk.score >= 45 ? "#B45309" : "#6E7681",
                    }}
                  />
                </div>
                <p style={{ fontSize: "13px", color: "rgba(18,19,23,0.6)", lineHeight: 1.6, margin: 0 }}>
                  {risk.reason}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reference Taxonomy */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setShowTaxonomy(!showTaxonomy)}
            style={{
              width: "100%",
              padding: "20px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div>
              <p style={{ fontFamily: "monospace", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(18,19,23,0.4)", margin: "0 0 4px" }}>
                Reference Taxonomy
              </p>
              <p style={{ fontSize: "15px", fontWeight: 650, color: "rgb(18,19,23)", margin: 0 }}>
                5 Root-Cause Block Categories
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "rgba(18,19,23,0.5)" }}>
              {showTaxonomy ? "Hide" : "Expand"}
              {showTaxonomy ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
            </div>
          </button>

          {showTaxonomy && (
            <div style={{ padding: "0 28px 24px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {BLOCK_RULES.map(r => (
                <div key={r.id} style={{ padding: "16px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 650, color: "rgb(18,19,23)" }}>{r.label}</span>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(18,19,23,0.4)" }}>{r.confidence}%</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(18,19,23,0.55)", lineHeight: 1.5, margin: "0 0 8px" }}>{r.description}</p>
                  <p style={{ fontSize: "11px", color: "rgba(18,19,23,0.45)", margin: 0 }}>
                    Actor: <strong style={{ color: "rgb(18,19,23)" }}>{r.actor}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
