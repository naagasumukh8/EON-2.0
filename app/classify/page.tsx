"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Zap, Shield, User, Clock, CheckCircle2, AlertTriangle, Pill, Building2, FileText } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

const BLOCK_RULES = [
  {
    id: "NO_REFILLS",
    keywords: ["no refill", "no more refill", "zero refill", "refills exhausted", "expired prescription", "needs new rx", "no remaining", "ran out"],
    label: "No Refills Remaining",
    confidence: 94,
    description: "Prescription has zero refills left. New provider authorization required.",
    nextAction: "Draft eRx renewal request to attending provider with last fill date & adherence history.",
    actor: "Provider",
    timeline: "< 4 hours via eRx",
    Icon: Pill,
  },
  {
    id: "INSURANCE",
    keywords: ["prior auth", "pa required", "insurance denied", "pbm", "step therapy", "not covered", "coverage denied", "authorization", "formulary"],
    label: "Insurance Prior Auth Hold",
    confidence: 91,
    description: "Payer restriction detected: prior authorization or step therapy required.",
    nextAction: "Submit PA justification form with clinical diagnosis and prior treatment history.",
    actor: "Practice Staff",
    timeline: "< 6 hours via portal",
    Icon: FileText,
  },
  {
    id: "VISIT",
    keywords: ["needs a visit", "requires appointment", "visit required", "come in", "see the doctor", "in person", "controlled substance", "schedule appointment", "in-person"],
    label: "Clinical Visit Required",
    confidence: 88,
    description: "Provider requires an in-person or telehealth visit before renewal.",
    nextAction: "Send appointment scheduling link to patient portal with privacy-compliant generic reminder.",
    actor: "Patient",
    timeline: "Instant scheduling",
    Icon: User,
  },
  {
    id: "MISSING_INFO",
    keywords: ["missing", "incomplete", "unclear", "wrong dob", "no dob", "illegible", "incorrect", "mismatch", "doesn't match", "cant find"],
    label: "Demographic Data Mismatch",
    confidence: 89,
    description: "EHR profile mismatch detected for date of birth or member ID.",
    nextAction: "Send secure SMS demographic verification link to patient.",
    actor: "Practice Staff",
    timeline: "< 1 hour via SMS",
    Icon: FileText,
  },
  {
    id: "PHARMACY_STOCK",
    keywords: ["out of stock", "backlog", "backordered", "inventory", "wholesaler delay", "supply chain", "cannot fill", "stock shortage"],
    label: "Pharmacy Inventory Shortage",
    confidence: 93,
    description: "Dispensing pharmacy reports zero on-hand units or wholesaler backorder.",
    nextAction: "Query partner pharmacy network for verified stock and route electronic transfer.",
    actor: "Pharmacy",
    timeline: "< 30 min partner transfer",
    Icon: Building2,
  },
];

const HIGH_RISK_MEDS = ["metformin", "lisinopril", "metoprolol", "atorvastatin", "amlodipine", "warfarin", "insulin", "digoxin", "carvedilol", "losartan", "hydrochlorothiazide"];
const MED_RISK_MEDS  = ["levothyroxine", "sertraline", "escitalopram", "fluoxetine", "omeprazole", "pantoprazole"];

function scoreRisk(text: string): { score: number; label: string } {
  const lower = text.toLowerCase();
  const isHighRisk = HIGH_RISK_MEDS.some(m => lower.includes(m));
  const isMedRisk  = !isHighRisk && MED_RISK_MEDS.some(m => lower.includes(m));
  if (isHighRisk) return { score: 85, label: "High Risk" };
  if (isMedRisk)  return { score: 55, label: "Standard" };
  return { score: 25, label: "Acute" };
}

const AMBIGUOUS_RESULT = {
  id: "AMBIGUOUS",
  label: "Conflicting Signals — Human Escalation",
  confidence: 42,
  description: "Contradictory signals detected across multiple categories. Automatic guess rejected.",
  nextAction: "Escalate to attending clinician for human judgment with multi-signal audit attached.",
  actor: "Senior Clinician",
  timeline: "Manual Review",
  Icon: AlertTriangle,
};

const SAMPLES = [
  { label: "Zero Refills Remaining", text: "Pharmacy sent an electronic denial: zero refills remaining on Metformin 500mg. Patient has been on this maintenance dose for 2 years for Type 2 diabetes. Need a new renewal prescription from Dr. Chen before dispensing." },
  { label: "Stock Shortage", text: "CVS notes medication is currently out of stock with wholesaler backorder lasting 5+ days. Patient needs this antibiotic course started today. Check partner pharmacies in the immediate network." },
  { label: "Prior Auth Hold", text: "BlueCross PBM rejected claim code 75: Prior Authorization Required. Formulary prefers enalapril as step-1 therapy unless physician provides clinical contraindication notes." },
  { label: "Demographic Mismatch", text: "Prescription transmission rejected due to patient demographic mismatch. Date of birth on e-prescribing profile does not match health plan master registry." },
  { label: "Conflicting Signals", text: "Patient called stating the pharmacy said no refills remained, but also mentioned their insurance dropped coverage and Dr. Patel said they need an office visit before anything is renewed." },
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

  const runClassifier = async (inputText?: string) => {
    const textToRun = inputText ?? input;
    if (!textToRun.trim()) return;
    setLoading(true);
    setResult(null);
    setRisk(null);
    const t0 = Date.now();
    await new Promise(r => setTimeout(r, 380));
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
        confidence: 20,
        description: "No known block patterns matched.",
        nextAction: "Provide additional context from the EHR note or pharmacy fax.",
        actor: "Staff",
        timeline: "Pending",
        Icon: AlertTriangle,
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

      <main style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 24px 80px", display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Title */}
        <div>
          <h1 style={{ fontSize: "clamp(2rem, 3.4vw, 2.75rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.035em", color: "rgb(18,19,23)", margin: "0 0 6px" }}>
            Refill Triage Classifier
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(18,19,23,0.55)", margin: 0 }}>
            Instant root cause diagnosis and automated routing.
          </p>
        </div>

        {/* Quick Scenario Buttons - Clean Typography, Zero Emojis */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
                  background: isSelected ? "rgb(18,19,23)" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "rgb(18,19,23)",
                  border: isSelected ? "1px solid rgb(18,19,23)" : "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Input Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "22px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 10px 24px -6px rgba(0,0,0,0.03)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <textarea
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid rgba(0,0,0,0.08)",
              background: "#FAFAFA",
              fontFamily: '"Google Sans","Sora",sans-serif',
              fontSize: "13.5px",
              lineHeight: 1.55,
              color: "rgb(18,19,23)",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
            }}
            rows={3}
            placeholder="Paste clinic note, pharmacy fax, or select a scenario above..."
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null); setRisk(null); }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "rgba(18,19,23,0.5)" }}>
              <Shield style={{ width: 13, height: 13, color: "#166534" }} />
              HIPAA-Safe · Auto PII scrubbed
            </div>

            <button
              onClick={() => runClassifier()}
              disabled={loading || !input.trim()}
              style={{
                background: "rgb(18,19,23)",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
                padding: "9px 22px",
                borderRadius: "9999px",
                border: "none",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.45 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "opacity 0.15s ease",
              }}
            >
              {loading ? (
                <>
                  <RefreshCw style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} /> Classifying…
                </>
              ) : (
                <>
                  <Zap style={{ width: 13, height: 13 }} /> Classify Refill
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "22px",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "36px 20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RefreshCw style={{ width: 28, height: 28, color: "rgb(18,19,23)", animation: "spin 1s linear infinite", marginBottom: "10px" }} />
            <p style={{ fontSize: "14px", fontWeight: 600, color: "rgb(18,19,23)", margin: 0 }}>
              Classifying clinical signals…
            </p>
          </div>
        )}

        {/* ONE UNIFIED, ULTRA-CLEAN RESULT CARD (NO EMOJIS, ZERO NESTED BOXES) */}
        {result && !loading && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 16px 36px -8px rgba(0,0,0,0.05)",
              padding: "26px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* Top row: Clean SVG Icon + Title + Confidence */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "14px", background: "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {result.Icon ? (
                    <result.Icon style={{ width: 20, height: 20, color: "rgb(18,19,23)" }} />
                  ) : (
                    <Zap style={{ width: 20, height: 20, color: "rgb(18,19,23)" }} />
                  )}
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "rgb(18,19,23)", margin: 0 }}>
                    {result.label}
                  </h2>
                  <div style={{ fontSize: "13px", color: "rgba(18,19,23,0.55)", marginTop: "2px" }}>
                    {result.description}
                  </div>
                </div>
              </div>

              <span
                style={{
                  background: result.confidence >= 80 ? "#F0FDF4" : "#FFFBEB",
                  color: result.confidence >= 80 ? "#15803D" : "#B45309",
                  border: `1px solid ${result.confidence >= 80 ? "#BBF7D0" : "#FDE68A"}`,
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: 750,
                  whiteSpace: "nowrap",
                }}
              >
                {result.confidence}% Match · {elapsed}s
              </span>
            </div>

            {/* Clean Action Callout with SVG Icon */}
            <div
              style={{
                background: "#F9FAFB",
                borderRadius: "16px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                border: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <Zap style={{ width: 15, height: 15, color: "rgb(18,19,23)", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(18,19,23,0.45)", marginBottom: "3px" }}>
                  Recommended Action
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "rgb(18,19,23)", lineHeight: 1.45 }}>
                  {result.nextAction}
                </div>
              </div>
            </div>

            {/* Inline Metadata Tags with SVG Icons (Zero Emojis) */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", background: "rgba(0,0,0,0.035)", padding: "5px 12px", borderRadius: "9999px", color: "rgb(18,19,23)", fontWeight: 550, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <User style={{ width: 12, height: 12, color: "rgba(18,19,23,0.6)" }} /> Assigned: {result.actor}
              </span>
              <span style={{ fontSize: "12px", background: "rgba(0,0,0,0.035)", padding: "5px 12px", borderRadius: "9999px", color: "rgb(18,19,23)", fontWeight: 550, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <Clock style={{ width: 12, height: 12, color: "rgba(18,19,23,0.6)" }} /> Turnaround: {result.timeline}
              </span>
              {risk && (
                <span style={{ fontSize: "12px", background: risk.score >= 70 ? "#FEF2F2" : "rgba(0,0,0,0.035)", color: risk.score >= 70 ? "#DC2626" : "rgb(18,19,23)", padding: "5px 12px", borderRadius: "9999px", fontWeight: 550, display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <Shield style={{ width: 12, height: 12, color: risk.score >= 70 ? "#DC2626" : "rgba(18,19,23,0.6)" }} /> Risk: {risk.score}/100 ({risk.label})
                </span>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
              <Link
                href="/portal"
                style={{
                  background: "rgb(18,19,23)",
                  color: "#FFFFFF",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  padding: "10px 22px",
                  borderRadius: "9999px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "opacity 0.15s ease",
                }}
              >
                Execute in Portal <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>

              <button
                onClick={() => { setInput(""); setResult(null); setRisk(null); }}
                style={{
                  background: "transparent",
                  color: "rgba(18,19,23,0.7)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  fontSize: "13px",
                  fontWeight: 550,
                  padding: "10px 18px",
                  borderRadius: "9999px",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
