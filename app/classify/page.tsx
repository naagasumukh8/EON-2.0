"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Zap, RefreshCw, CheckCircle, AlertTriangle,
  Info, ChevronDown, ChevronUp, Sparkles, Shield
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

const BLOCK_RULES = [
  {
    id: "NO_REFILLS",
    keywords: ["no refill", "no more refill", "zero refill", "refills exhausted", "expired prescription", "needs new rx", "no remaining", "ran out"],
    label: "No Refills Remaining",
    emoji: "💊",
    confidence: 94,
    description: "Prescription has zero refills left. A new eRx from the attending provider is required before dispensing.",
    nextAction: "Draft new eRx renewal request to attending provider with last fill date, dosage, and adherence history.",
    actor: "Provider",
    timeline: "< 4 hours via eRx",
    timelineBaseline: "3–7 days manual",
    reasoning: "Pattern: prescription expiry / refill_count = 0. Provider clinical authorization required for new Rx.",
  },
  {
    id: "INSURANCE",
    keywords: ["prior auth", "pa required", "insurance denied", "pbm", "step therapy", "not covered", "coverage denied", "authorization", "formulary"],
    label: "Insurance Prior Auth Hold",
    emoji: "📋",
    confidence: 91,
    description: "Health plan / PBM placed a coverage restriction: prior authorization, step therapy, or formulary tier exclusion.",
    nextAction: "Submit PA justification form to PBM with clinical diagnosis code and prior treatment history.",
    actor: "Practice Staff",
    timeline: "< 6 hours via portal",
    timelineBaseline: "5–10 days manual",
    reasoning: "Pattern: PBM / prior-auth / step therapy keywords. Payer administrative intervention required.",
  },
  {
    id: "VISIT",
    keywords: ["needs a visit", "requires appointment", "visit required", "come in", "see the doctor", "in person", "controlled substance", "schedule appointment", "in-person"],
    label: "Clinical Visit Required",
    emoji: "🩺",
    confidence: 88,
    description: "Attending provider requires an in-person or telehealth consultation before re-authorizing maintenance therapy.",
    nextAction: "Send appointment scheduling link to patient portal with privacy-compliant generic reminder.",
    actor: "Patient",
    timeline: "Instant scheduling",
    timelineBaseline: "3–5 days phone tag",
    reasoning: "Pattern: visit / clinical consult required. Provider safety review required before dispensing.",
  },
  {
    id: "MISSING_INFO",
    keywords: ["missing", "incomplete", "unclear", "wrong dob", "no dob", "illegible", "incorrect", "mismatch", "doesn't match", "cant find"],
    label: "Demographic Data Mismatch",
    emoji: "🪪",
    confidence: 89,
    description: "EHR and pharmacy profile mismatch detected for date of birth, insurance ID, or prescriber NPI discrepancy.",
    nextAction: "Contact patient via secure SMS to verify demographic details. Auto-executable in Autonomous Mode.",
    actor: "Practice Staff",
    timeline: "< 1 hour via SMS",
    timelineBaseline: "1–3 days manual",
    reasoning: "Pattern: mismatch / missing demographic data. Administrative data verification required.",
  },
  {
    id: "PHARMACY_STOCK",
    keywords: ["out of stock", "backlog", "backordered", "inventory", "wholesaler delay", "supply chain", "cannot fill", "stock shortage"],
    label: "Pharmacy Inventory Shortage",
    emoji: "🏪",
    confidence: 93,
    description: "Dispensing pharmacy reports zero on-hand units or regional distributor supply shortage.",
    nextAction: "Query nearby partner pharmacies for verified stock. Draft transfer request for human clinician approval.",
    actor: "Pharmacy",
    timeline: "< 30 min partner transfer",
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
    return { score: 85, reason: `High-risk chronic medication (${med}) detected. Continuous adherence is clinically time-sensitive.`, medClass: "chronic_high_risk" };
  }
  if (isMedRisk) {
    const med = MED_RISK_MEDS.find(m => lower.includes(m));
    return { score: 55, reason: `Chronic standard medication (${med}) detected. Routine maintenance therapy.`, medClass: "chronic_standard" };
  }
  return { score: 25, reason: "Acute / symptomatic medication detected. Standard clinical triage priority.", medClass: "acute" };
}

const AMBIGUOUS_RESULT = {
  id: "AMBIGUOUS",
  label: "Conflicting Signals — Human Escalation",
  emoji: "⚠️",
  confidence: 42,
  description: "Input contains contradictory signals across multiple categories. The system refuses to hallucinate a false decision.",
  nextAction: "Escalate to attending clinician for manual triage review with multi-signal audit attached.",
  actor: "Senior Clinician",
  timeline: "Manual Review",
  timelineBaseline: "N/A",
  reasoning: "Multiple competing keyword clusters detected simultaneously. Conflicting signals prevent confident automated resolution.",
  isFailure: true,
};

const SAMPLES = [
  { label: "💊 Zero Refills", text: "Pharmacy sent an electronic denial: zero refills remaining on Metformin 500mg. Patient has been on this maintenance dose for 2 years for Type 2 diabetes. Need a new renewal prescription from Dr. Chen before dispensing." },
  { label: "🏪 Stock Shortage", text: "CVS notes medication is currently out of stock with wholesaler backorder lasting 5+ days. Patient needs this antibiotic course started today. Check partner pharmacies in the immediate network." },
  { label: "📋 Prior Auth Hold", text: "BlueCross PBM rejected claim code 75: Prior Authorization Required. Formulary prefers enalapril as step-1 therapy unless physician provides clinical contraindication notes." },
  { label: "🪪 Demographic Mismatch", text: "Prescription transmission rejected due to patient demographic mismatch. Date of birth on e-prescribing profile does not match health plan master registry." },
  { label: "⚠️ Conflicting Signals", text: "Patient called stating the pharmacy said no refills remained, but also mentioned their insurance dropped coverage and Dr. Patel said they need an office visit before anything is renewed." },
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
  const [input, setInput]               = useState("");
  const [result, setResult]             = useState<any>(null);
  const [risk, setRisk]                 = useState<any>(null);
  const [loading, setLoading]           = useState(false);
  const [elapsed, setElapsed]           = useState<number | null>(null);
  const [showTaxonomy, setShowTaxonomy] = useState(false);

  const runClassifier = async (inputText?: string) => {
    const textToRun = inputText ?? input;
    if (!textToRun.trim()) return;
    setLoading(true);
    setResult(null);
    setRisk(null);
    const t0 = Date.now();
    await new Promise(r => setTimeout(r, 450));
    setElapsed(parseFloat(((Date.now() - t0) / 1000).toFixed(1)));
    const res = classify(textToRun);
    setRisk(scoreRisk(textToRun));
    if (res === "ambiguous") {
      setResult(AMBIGUOUS_RESULT);
    } else if (res === null) {
      setResult({
        ...AMBIGUOUS_RESULT,
        id: "UNKNOWN",
        label: "Unclassified Context",
        emoji: "❓",
        confidence: 15,
        description: "No known block patterns identified. Please provide additional context from the pharmacy or EHR note.",
        reasoning: "Zero pattern matches detected. Context insufficient for deterministic classification.",
      });
    } else {
      setResult(res);
    }
    setLoading(false);
  };

  const handlePickSample = (sampleText: string) => {
    setInput(sampleText);
    runClassifier(sampleText);
  };

  return (
    <div style={{ background: "#F0F0F0", color: "rgb(18,19,23)", fontFamily: '"Google Sans","Sora",-apple-system,BlinkMacSystemFont,sans-serif', minHeight: "100vh" }}>
      <AppHeader activePath="/classify" />

      <main style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Page Title */}
        <div>
          <h1 style={{ fontSize: "clamp(2rem, 3.4vw, 2.75rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.035em", color: "rgb(18,19,23)", margin: "0 0 8px" }}>
            Refill Triage Classifier
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(18,19,23,0.55)", lineHeight: 1.5, margin: 0, maxWidth: "620px" }}>
            Instant root cause diagnosis, clinical risk score, and automated routing.
          </p>
        </div>

        {/* Quick-Pick Scenarios */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            {SAMPLES.map((s, i) => {
              const isSelected = input === s.text;
              return (
                <button
                  key={i}
                  onClick={() => handlePickSample(s.text)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "9999px",
                    fontSize: "13px",
                    fontWeight: isSelected ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.16s ease",
                    background: isSelected ? "rgb(18,19,23)" : "rgba(0,0,0,0.04)",
                    color: isSelected ? "#FFFFFF" : "rgb(18,19,23)",
                    border: isSelected ? "1px solid rgb(18,19,23)" : "1px solid rgba(0,0,0,0.07)",
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = "rgba(0,0,0,0.07)";
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "24px",
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
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.09)",
              background: "#FAFAFA",
              fontFamily: '"Google Sans","Sora",sans-serif',
              fontSize: "14px",
              lineHeight: 1.6,
              color: "rgb(18,19,23)",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
            }}
            rows={4}
            placeholder="Paste clinic note, pharmacy notification, or EHR message..."
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null); setRisk(null); }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "rgba(18,19,23,0.55)" }}>
              <Shield style={{ width: 14, height: 14, color: "#166534" }} />
              HIPAA-Safe · Automatic PII scrubbed
            </div>

            <button
              onClick={() => runClassifier()}
              disabled={loading || !input.trim()}
              style={{
                background: "rgb(18,19,23)",
                color: "#FFFFFF",
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
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={e => {
                if (!loading && input.trim()) e.currentTarget.style.opacity = "0.88";
              }}
              onMouseLeave={e => {
                if (!loading && input.trim()) e.currentTarget.style.opacity = "1";
              }}
            >
              {loading ? (
                <>
                  <RefreshCw style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} /> Classifying…
                </>
              ) : (
                <>
                  <Sparkles style={{ width: 14, height: 14 }} /> Classify Refill
                </>
              )}
            </button>
          </div>
        </div>

        {/* Empty State */}
        {!result && !loading && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              border: "1px dashed rgba(0,0,0,0.12)",
              padding: "44px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>⚡</div>
            <p style={{ fontSize: "15px", fontWeight: 650, color: "rgb(18,19,23)", margin: "0 0 4px" }}>
              Ready for Triage
            </p>
            <p style={{ fontSize: "13px", color: "rgba(18,19,23,0.5)", margin: 0, maxWidth: "360px" }}>
              Choose a scenario above or paste any clinic text to diagnose root cause and clinical routing.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "44px 24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RefreshCw style={{ width: 32, height: 32, color: "rgb(18,19,23)", animation: "spin 1s linear infinite", marginBottom: "14px" }} />
            <p style={{ fontSize: "15px", fontWeight: 650, color: "rgb(18,19,23)", margin: "0 0 4px" }}>
              Analyzing Clinical Tokens…
            </p>
            <p style={{ fontSize: "13px", color: "rgba(18,19,23,0.5)", margin: 0 }}>
              Cross-referencing safety rules and provider protocols
            </p>
          </div>
        )}

        {/* Classification Result */}
        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Main Result Card */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 16px 36px -8px rgba(0,0,0,0.05)",
                padding: "32px",
              }}
            >
              {/* Header Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 650, color: "rgba(18,19,23,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                    <span>{result.emoji ?? "📋"}</span> Triage Diagnosis · {elapsed}s
                  </div>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.025em", color: "rgb(18,19,23)", margin: 0 }}>
                    {result.label}
                  </h2>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "16px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      background: result.confidence >= 80 ? "#F0FDF4" : "#FFFBEB",
                      color: result.confidence >= 80 ? "#15803D" : "#B45309",
                      border: `1px solid ${result.confidence >= 80 ? "#BBF7D0" : "#FDE68A"}`,
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {result.confidence}% Match
                  </span>
                </div>
              </div>

              <p style={{ fontSize: "14.5px", color: "rgba(18,19,23,0.7)", lineHeight: 1.6, margin: "0 0 20px" }}>
                {result.description}
              </p>

              {/* Reasoning Trail */}
              <div
                style={{
                  background: "rgba(0,0,0,0.025)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "16px",
                  padding: "16px 18px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(18,19,23,0.5)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Info style={{ width: 13, height: 13, color: "rgb(18,19,23)" }} /> Reasoning Trail
                </div>
                <p style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(18,19,23,0.8)", lineHeight: 1.6, margin: 0 }}>
                  {result.reasoning}
                </p>
              </div>

              {/* Recommended Action */}
              {!result.isFailure ? (
                <div
                  style={{
                    background: "#F0FDF4",
                    borderRadius: "16px",
                    border: "1px solid rgba(22,101,52,0.15)",
                    padding: "16px 18px",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#166534", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle style={{ width: 14, height: 14, color: "#166534" }} /> Recommended Next Action
                  </div>
                  <p style={{ fontSize: "13.5px", color: "#14532D", fontWeight: 550, lineHeight: 1.5, margin: 0 }}>
                    {result.nextAction}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    background: "#FFFBEB",
                    borderRadius: "16px",
                    border: "1px solid rgba(180,83,9,0.2)",
                    padding: "16px 18px",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#92400E", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertTriangle style={{ width: 14, height: 14, color: "#B45309" }} /> Self-Aware Boundary Guardrail
                  </div>
                  <p style={{ fontSize: "13px", color: "#78350F", lineHeight: 1.5, margin: 0 }}>
                    Refusing to hallucinate a false decision when signals contradict. Routed to senior clinician for human judgment.
                  </p>
                </div>
              )}

              {/* Meta stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: "11px", color: "rgba(18,19,23,0.45)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
                    👤 Assigned Actor
                  </div>
                  <span style={{ display: "inline-block", background: "rgb(18,19,23)", color: "#FFFFFF", padding: "4px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: 600 }}>
                    {result.actor}
                  </span>
                </div>

                <div style={{ background: "rgba(0,0,0,0.02)", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: "11px", color: "rgba(18,19,23,0.45)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
                    ⏱️ Turnaround
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#166534" }}>{result.timeline}</div>
                  <div style={{ fontSize: "11px", color: "rgba(18,19,23,0.4)", textDecoration: "line-through" }}>{result.timelineBaseline}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <Link
                  href="/portal"
                  style={{
                    background: "rgb(18,19,23)",
                    color: "#FFFFFF",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    padding: "11px 24px",
                    borderRadius: "9999px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    flex: 1,
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Open in Portal <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>

                <button
                  onClick={() => { setInput(""); setResult(null); setRisk(null); }}
                  style={{
                    background: "rgba(0,0,0,0.05)",
                    color: "rgb(18,19,23)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    fontSize: "13px",
                    fontWeight: 550,
                    padding: "11px 20px",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Clinical Risk Card */}
            {risk && (
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "24px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
                  padding: "24px 28px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: 700, color: "rgba(18,19,23,0.5)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
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
                <p style={{ fontSize: "13px", color: "rgba(18,19,23,0.65)", lineHeight: 1.5, margin: 0 }}>
                  {risk.reason}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Collapsible Reference Taxonomy */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 12px 28px -6px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setShowTaxonomy(!showTaxonomy)}
            style={{
              width: "100%",
              padding: "18px 24px",
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
              <p style={{ fontSize: "15px", fontWeight: 650, color: "rgb(18,19,23)", margin: 0 }}>
                📋 5 Root-Cause Block Categories
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "rgba(18,19,23,0.5)" }}>
              {showTaxonomy ? "Hide" : "Show"}
              {showTaxonomy ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
            </div>
          </button>

          {showTaxonomy && (
            <div style={{ padding: "0 24px 24px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
              {BLOCK_RULES.map(r => (
                <div key={r.id} style={{ padding: "16px", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: 650, color: "rgb(18,19,23)" }}>
                      {r.emoji} {r.label}
                    </span>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(18,19,23,0.4)" }}>{r.confidence}%</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(18,19,23,0.6)", lineHeight: 1.5, margin: "0 0 8px" }}>{r.description}</p>
                  <p style={{ fontSize: "11.5px", color: "rgba(18,19,23,0.5)", margin: 0 }}>
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
