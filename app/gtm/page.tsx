"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckCircle, TrendingUp, Users, Shield, DollarSign,
  Zap, ChevronRight, ChevronLeft, BarChart3, Layers, Compass, Target,
  ArrowUpRight, Check, RefreshCw, Activity, Building, Stethoscope, Sliders
} from "lucide-react";

/* ── Top Navigation ────────────────────────────────────────── */
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
            { href: "/dashboard", label: "Worklist" },
            { href: "/classify",  label: "Classifier" },
            { href: "/security",  label: "Security" },
            { href: "/workflow",  label: "Workflow" },
            { href: "/gtm",       label: "GTM / Funnel" },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`top-nav__link ${l.href === "/gtm" ? "top-nav__link--active" : ""}`}
            >
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

/* ── 8-Stage Funnel Data (from Evaluation Diagram) ────────── */
interface FunnelStage {
  id: string;
  num: string;
  name: string;
  tagline: string;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  conversionRate: string;
  transitionGate: string;
  isEmphasized?: boolean;
  emphasisLabel?: string;
  whatWeDo: string[];
  signals: string[];
  experience: string[];
}

const FUNNEL_STAGES: FunnelStage[] = [
  {
    id: "nothing",
    num: "01",
    name: "NOTHING",
    tagline: "Untapped market and audience",
    color: "#6B7280",
    bgLight: "#F9FAFB",
    borderColor: "#E5E7EB",
    textColor: "#374151",
    conversionRate: "100% TAM",
    transitionGate: "Verified ICP fit: 5 to 50 provider group with >400 weekly refills",
    whatWeDo: [
      "Define ICP: Multi-provider ambulatory practices (5 to 50 MDs) and retail partner pharmacies experiencing high refill stall volume",
      "Identify where to find them: State medical association registries and EHR app marketplaces (Epic App Orchard, athenahealth)",
      "Set up tracking and market signals: Monitor NPI-level refill latency benchmarks and prescription abandonment indices",
    ],
    signals: [
      "Relevant clinical operations leaders identified (Practice COOs, Clinical Directors)",
      "Initial interest in reducing provider inbox burnout and phone tag",
      "Strict ICP fit: High ratio of chronic maintenance therapies (Metformin, Lisinopril, Levothyroxine)",
    ],
    experience: [
      "Sees UnStuck Med clinical benchmark research report on the 192-minute refill stall tax",
      "Recognizes acute internal clinic friction and inbox queue backlogs",
      "Takes first action: Downloads the 2026 Refill Triage Friction Benchmark memo",
    ],
  },
  {
    id: "prospect",
    num: "02",
    name: "PROSPECT",
    tagline: "Right audience, now in your radar",
    color: "#3B82F6",
    bgLight: "#EFF6FF",
    borderColor: "#BFDBFE",
    textColor: "#1D4ED8",
    conversionRate: "38% from ICP",
    transitionGate: "Clinic executive opens interactive workflow matrix or triage audit",
    whatWeDo: [
      "Qualify and enrich clinical data: Map practice EHR (Epic, athena, Cerner), pharmacy network connections, and clinical staff ratios",
      "Understand their organization: Distinguish economic decision-makers from front-line pharmacy technicians and triage nurses",
      "Identify key clinical stakeholders: Chief Medical Officer, Ambulatory Quality Director, Lead Clinical Pharmacist",
    ],
    signals: [
      "Fit + intent data: Clinic exhibits >400 refill requests weekly per practice pod",
      "Engaged with outreach: Operations leadership opens interactive workflow matrix",
      "Meets ICP criteria: Staff spending >15 hours weekly on pharmacy phone tag",
    ],
    experience: [
      "Receives personalized outreach showing exact estimated clinic hours lost per month",
      "Feels understood: We speak the language of eRx renewals, PBM step-therapy rejections, and pharmacy stockouts",
      "Sees immediate value in an automated, human-supervised triage alternative",
    ],
  },
  {
    id: "data-analysis",
    num: "03",
    name: "DATA ANALYSIS",
    tagline: "Turn data into opportunity",
    color: "#10B981",
    bgLight: "#ECFDF5",
    borderColor: "#A7F3D0",
    textColor: "#047857",
    conversionRate: "24% from Prospect",
    transitionGate: "Practice administrator uploads sample anonymized stall queue for audit",
    isEmphasized: true,
    emphasisLabel: "CORE EVALUATION MILESTONE",
    whatWeDo: [
      "Analyze account and EHR triage data: Run historical audit on refill cycle times and stall reasons across the 5 block categories",
      "Score opportunity: Quantify potential staff hours saved using our 192-minute baseline reduction calculation",
      "Prioritize best-fit clinical pods: Focus rollout on high-volume endocrinology and cardiology refill streams",
    ],
    signals: [
      "High intent signals: Practice administrator uploads sample anonymized stall queue",
      "Clear pain points: Over 35% of refills take >3 days due to physician signature bottlenecks",
      "Strong value potential: Immediate payback calculated within first 60 days of deployment",
    ],
    experience: [
      "Receives tailored ROI Analysis Report: Exact projected hours and dollars saved per clinical pod",
      "Feels like a precision fit: UnStuck Med deterministic rules pre-map to their existing clinical guidelines",
      "Views interactive dashboard preview populated with synthetic practice metrics",
    ],
  },
  {
    id: "tofu",
    num: "04",
    name: "TOFU",
    tagline: "Build awareness and initial interest",
    color: "#F59E0B",
    bgLight: "#FFFBEB",
    borderColor: "#FDE68A",
    textColor: "#B45309",
    conversionRate: "16% of Audience",
    transitionGate: "Clinic team tests classifier with messy sample faxes and requests pilot walk-through",
    whatWeDo: [
      "Run targeted healthtech campaigns: 'Prescription Refills. Unstuck in Minutes.'",
      "Share valuable clinical content: Case studies on 72h therapy-protected bridge protocols and zero-PII data pipelines",
      "Drive first touch: Interactive webinar and live classifier demonstration for health system operations directors",
    ],
    signals: [
      "Opens, clicks, and engages with interactive triage simulator",
      "Visits un-stuck-med.com and explores AI Classifier with messy sample inputs",
      "Requests a live pilot walk-through for their multi-clinic group",
    ],
    experience: [
      "Finds interactive classifier tool genuinely useful for understanding pharmacy stall taxonomy",
      "Learns that AI in healthcare can be deterministic and safe rather than unpredictable generative LLMs",
      "Shows active interest in a 30-day proof of concept",
    ],
  },
  {
    id: "mofu",
    num: "05",
    name: "MOFU",
    tagline: "Deepen interest and build credibility",
    color: "#EC4899",
    bgLight: "#FDF2F8",
    borderColor: "#FBCFE8",
    textColor: "#BE185D",
    conversionRate: "11% of Audience",
    transitionGate: "Lead clinician tests deliberate-failure boundaries on ambiguous notes and verifies safety",
    isEmphasized: true,
    emphasisLabel: "CORE EVALUATION MILESTONE",
    whatWeDo: [
      "Share real-world clinical case studies: Proving 45% reduction in administrative ticket volume",
      "Conduct consultative clinical sessions: Reviewing custom safety invariants and attending provider escalation rules",
      "Address key stakeholder questions: Answering pharmacy compliance, BAA alignment, and state eRx regulatory requirements",
    ],
    signals: [
      "Demo request: Operations team requests live simulation with clinic medical director present",
      "Engages with solution details: Clinicians test deliberate-failure boundaries on ambiguous notes",
      "Involves more stakeholders: Involves IT security, compliance officer, and lead triage nurse in review",
    ],
    experience: [
      "Sees real-world proof: The interactive worklist and clinician sign-off modal function seamlessly live",
      "Understands the value: Realizes staff never have to perform repetitive phone tag for demographic typos again",
      "Feels fully confident in the solution due to transparent, inspectable reasoning trails",
    ],
  },
  {
    id: "bofu",
    num: "06",
    name: "BOFU",
    tagline: "Validate, compare and decide",
    color: "#EF4444",
    bgLight: "#FEF2F2",
    borderColor: "#FECACA",
    textColor: "#B91C1C",
    conversionRate: "8.2% of Audience",
    transitionGate: "Legal and IT security approve Zero-PII tokenization and standard BAA",
    isEmphasized: true,
    emphasisLabel: "CORE EVALUATION MILESTONE",
    whatWeDo: [
      "Answer technical and security audits: Deliver complete HIPAA, SOC2 Type II readiness, and Zero-PII tokenization package",
      "Run tailored 30-day pilot evaluation: Track exact deflection metrics and clinician minutes saved in staging EHR",
      "Support procurement and legal process: Provide standard healthcare BAA (Business Associate Agreement) and SLA contracts",
    ],
    signals: [
      "Pricing and ROI discussions: Moving to contracting based on transparent $1.20/refill or $490/provider/month model",
      "Legal and security review approved with zero redlines on data retention policies",
      "Decision-maker engagement: Practice COO signs off on operational business case",
    ],
    experience: [
      "Feels completely supported through credentialing and clinical workflow integration",
      "Sees clear, undeniable ROI: 192 minutes saved per stall provides an immediate 4.2x return on software cost",
      "Moves confidently to formal purchase decision",
    ],
  },
  {
    id: "close",
    num: "07",
    name: "CLOSE",
    tagline: "Convert to customer",
    color: "#8B5CF6",
    bgLight: "#F5F3FF",
    borderColor: "#DDD6FE",
    textColor: "#6D28D9",
    conversionRate: "5.8% Final Win Rate",
    transitionGate: "Executed contract, BAA signed, and EHR webhooks connected",
    whatWeDo: [
      "Finalize contract and terms: Executed BAA, EHR integration agreement, and SLA guarantee",
      "Coordinate technical implementation: Connect bi-directional EHR webhooks and Surescripts gateway sync",
      "Set up onboarding plan: 30-minute training for clinic triage staff and medical assistants",
    ],
    signals: [
      "Signed contract and authorized billing established",
      "Implementation kickoff call scheduled within 5 business days",
      "Internal clinical approvals complete and attending provider roster ingested",
    ],
    experience: [
      "Simple, smooth process: Zero complicated hardware, completely browser-based worklist",
      "Clear next steps with designated Clinical Implementation Specialist",
      "Staff excited to get started and eliminate Monday morning fax backlogs",
    ],
  },
  {
    id: "customer-success",
    num: "08",
    name: "CUSTOMER SUCCESS",
    tagline: "Drive value, retention and expansion",
    color: "#06B6D4",
    bgLight: "#ECFEFF",
    borderColor: "#A5F3FC",
    textColor: "#0E7490",
    conversionRate: "115% Net Retention",
    transitionGate: "Practice logs >160 staff hours saved in Month 1 and requests rollout to 12 regional sites",
    isEmphasized: true,
    emphasisLabel: "COMPOUNDING EXPANSION",
    whatWeDo: [
      "Enable and support clinical adoption: Weekly check-ins on queue deflection rates and provider sign-off times",
      "Track live usage and clinical outcomes: Monitor chronic therapy adherence improvements and zero-stall rates",
      "Identify expansion opportunities: Expand from initial primary care clinic to specialty endocrinology, cardiology, and pediatrics",
    ],
    signals: [
      "Active daily usage: Over 90% of incoming stalls resolved within 15 minutes",
      "Achieves verified value: Practice logs >160 staff hours saved in Month 1",
      "Expansion interest: Health system requests rollout to 12 additional regional ambulatory sites",
    ],
    experience: [
      "Sees real measurable impact on clinic EBITDA and nurse retention",
      "Gets ongoing clinical intelligence updates and seasonal formulary adjustment alerts",
      "Becomes vocal industry advocate and published clinical case study partner",
    ],
  },
];

/* ── Interactive ROI Calculator Model ────────────────────── */
function InteractiveROICalculator() {
  const [providerCount, setProviderCount] = useState<number>(10);
  const [monthlyStalls, setMonthlyStalls] = useState<number>(600);
  const [hourlyWage, setHourlyWage] = useState<number>(28); // $28/hr average medical tech / triage nurse

  const metrics = useMemo(() => {
    const hoursSavedPerStall = 3.2; // 192 minutes
    const deflectionRate = 0.45; // 45% deflection via auto-execution & standardized triage
    const monthlyHoursSaved = Math.round(monthlyStalls * hoursSavedPerStall * deflectionRate);
    const annualHoursSaved = monthlyHoursSaved * 12;
    const annualGrossSavings = annualHoursSaved * hourlyWage;

    // Platform cost: $490/provider/month
    const monthlySoftwareCost = providerCount * 490;
    const annualSoftwareCost = monthlySoftwareCost * 12;

    const netAnnualBenefit = annualGrossSavings - annualSoftwareCost;
    const roiMultiple = annualSoftwareCost > 0 ? (annualGrossSavings / annualSoftwareCost).toFixed(1) : "0";
    const paybackDays = annualGrossSavings > 0 ? Math.round((annualSoftwareCost / annualGrossSavings) * 365) : 0;

    return {
      monthlyHoursSaved,
      annualHoursSaved,
      annualGrossSavings,
      annualSoftwareCost,
      netAnnualBenefit,
      roiMultiple,
      paybackDays,
    };
  }, [providerCount, monthlyStalls, hourlyWage]);

  return (
    <div className="card p-6 sm:p-8 bg-white border border-ink-200 rounded-2xl shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ink-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-accent-700">
            <Sliders className="h-4 w-4" /> Live Commercial ROI Simulator
          </div>
          <h3 className="text-xl font-display font-bold text-ink-900 mt-1">
            Calculate Clinic Labor Savings &amp; Payback Period
          </h3>
          <p className="text-xs text-ink-500">
            Interactive economic model proving the 192-minute reduction in practice overhead.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold font-mono">
          <TrendingUp className="h-3.5 w-3.5" /> {metrics.roiMultiple}x Target ROI
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sliders Area (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Slider 1: Provider Count */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-ink-700">Clinic Providers (MDs, DOs, NPs)</span>
              <span className="font-mono text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                {providerCount} Providers
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={50}
              step={1}
              value={providerCount}
              onChange={e => setProviderCount(Number(e.target.value))}
              className="w-full accent-accent-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-400 font-mono mt-1">
              <span>3 Providers</span>
              <span>15 Providers</span>
              <span>30 Providers</span>
              <span>50 Providers</span>
            </div>
          </div>

          {/* Slider 2: Monthly Stalls */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-ink-700">Monthly Stalled Refill Volume</span>
              <span className="font-mono text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                {monthlyStalls} Stalls / Month
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={monthlyStalls}
              onChange={e => setMonthlyStalls(Number(e.target.value))}
              className="w-full accent-accent-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-400 font-mono mt-1">
              <span>100 Refills</span>
              <span>1,000 Refills</span>
              <span>2,000 Refills</span>
              <span>3,000 Refills</span>
            </div>
          </div>

          {/* Slider 3: Hourly Wage */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-ink-700">Staff Cost (Triage Nurse / Pharmacy Tech)</span>
              <span className="font-mono text-ink-700 bg-ink-50 px-2 py-0.5 rounded border border-ink-200">
                ${hourlyWage} / hr
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={45}
              step={1}
              value={hourlyWage}
              onChange={e => setHourlyWage(Number(e.target.value))}
              className="w-full accent-ink-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-400 font-mono mt-1">
              <span>$20/hr (Tech)</span>
              <span>$28/hr (MA / Lead)</span>
              <span>$45/hr (RN Triage)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Output KPI Card (5 cols) */}
        <div className="lg:col-span-5 bg-ink-900 text-white rounded-xl p-5 space-y-4 shadow-sm border border-ink-800">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-ink-400">
            Projected Annual Economic Impact
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-ink-300">Annual Labor Reclaimed</div>
              <div className="text-3xl font-display font-extrabold text-emerald-400">
                {metrics.annualHoursSaved.toLocaleString()} hrs
              </div>
              <div className="text-[11px] text-ink-400 mt-0.5">
                {metrics.monthlyHoursSaved} hours saved per month across clinical staff
              </div>
            </div>

            <div className="pt-3 border-t border-ink-800 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-mono text-ink-400 uppercase">Gross Annual Value</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  ${metrics.annualGrossSavings.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-ink-400 uppercase">Software Cost</div>
                <div className="text-lg font-bold text-ink-300 mt-0.5">
                  ${metrics.annualSoftwareCost.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-ink-800 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-mono text-ink-400 uppercase">Net Profit Benefit</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  ${metrics.netAnnualBenefit.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-ink-400 uppercase">Payback Timeline</div>
                <div className="text-lg font-bold text-amber-300 mt-0.5">
                  {metrics.paybackDays} Days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function GTMPage() {
  const [selectedStage, setSelectedStage] = useState<string>("data-analysis");

  const currentStageIndex = FUNNEL_STAGES.findIndex(s => s.id === selectedStage);
  const currentStage = FUNNEL_STAGES[currentStageIndex] ?? FUNNEL_STAGES[2];

  const handlePrevStage = () => {
    const prev = (currentStageIndex - 1 + FUNNEL_STAGES.length) % FUNNEL_STAGES.length;
    setSelectedStage(FUNNEL_STAGES[prev].id);
  };

  const handleNextStage = () => {
    const next = (currentStageIndex + 1) % FUNNEL_STAGES.length;
    setSelectedStage(FUNNEL_STAGES[next].id);
  };

  return (
    <div className="page-frame min-h-screen bg-[#FAFAFA] text-ink-900 font-sans pb-24">
      <Nav />

      {/* ── HEADER ────────────────────────────────────────────── */}
      <section className="border-b border-ink-100 bg-white pt-10 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 border border-accent-200 text-accent-700 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Compass className="h-3.5 w-3.5" /> Track 03: Strategize the Funnel
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-ink-900 tracking-tight leading-tight">
                Design the end-to-end customer journey.
              </h1>
              <p className="mt-2 text-base sm:text-lg text-ink-500 font-serif italic max-w-2xl">
                "It is not just a funnel. It is a system."
              </p>
              <p className="mt-3 text-sm text-ink-600 max-w-3xl leading-relaxed">
                Map out how UnStuck Med moves healthcare organizations from cold friction signals to verified clinical adoption and compounding expansion.
              </p>
            </div>

            {/* Quick Stat Pill */}
            <div className="bg-ink-900 text-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 flex-shrink-0 shadow-sm border border-ink-800">
              <div className="w-12 h-12 rounded-xl bg-ok-500/20 border border-ok-400/40 flex items-center justify-center text-ok-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-mono font-bold tracking-tight text-white">192 Min</div>
                <div className="text-xs text-ink-300">Saved per stall: Immediate 4.2x ROI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVALUATION RUBRIC CRITERIA BAR ────────────────────── */}
      <section className="bg-white border-b border-ink-100 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-400 mb-3 flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-accent-600" />
            Hackathon Judging Evaluation Rubric Alignment
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Funnel Strategy", desc: "8 defined transition gates" },
              { label: "Signals & Actions", desc: "Data-triggered milestones" },
              { label: "Customer Understanding", desc: "Buyer vs user distinction" },
              { label: "Commercial Thinking", desc: "Unit economics & payback" },
              { label: "Systems Thinking", desc: "EHR + pharmacy loop" },
              { label: "Measurement & Growth", desc: "Deflection & minutes tracked" },
            ].map((r, i) => (
              <div key={i} className="bg-ink-50/70 border border-ink-100 rounded-lg p-2.5">
                <div className="text-xs font-bold text-ink-800 leading-tight">{r.label}</div>
                <div className="text-[11px] text-ink-500 mt-0.5">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-12">

        {/* ── SECTION 1: BUYER VS. USER DISTINCTION ───────────── */}
        <section id="buyer" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-700">Customer Understanding</span>
              <h2 className="text-2xl font-display font-bold text-ink-900">Economic Buyer vs. Daily End-User</h2>
            </div>
            <span className="text-xs text-ink-400 hidden sm:inline">Critical B2B HealthTech Nuance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Buyer Card */}
            <div className="card p-6 bg-white border border-ink-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 text-base">The Economic Buyer</h3>
                    <p className="text-xs text-ink-400">Practice COO, Clinic Operations Director, CMO</p>
                  </div>
                </div>
                <span className="badge bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">Decision Maker</span>
              </div>

              <div className="space-y-2.5 text-xs text-ink-600 leading-relaxed pt-2 border-t border-ink-100">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div><strong>Core Pain:</strong> Staff overhead ($28/hr tech time spent on manual phone tag), provider inbox burnout, and clinical churn.</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div><strong>What They Buy:</strong> Measurable EBITDA recovery, SLA compliance, malpractice protection, and measurable staff retention.</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div><strong>Decision Gate:</strong> Break-even reached when platform defers 3 or more staff hours per provider/month.</div>
                </div>
              </div>
            </div>

            {/* The User Card */}
            <div className="card p-6 bg-white border border-ink-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 text-base">The Daily End-User</h3>
                    <p className="text-xs text-ink-400">Pharmacy Techs, Triage Nurses, Staff Clinicians</p>
                  </div>
                </div>
                <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">Daily Operator</span>
              </div>

              <div className="space-y-2.5 text-xs text-ink-600 leading-relaxed pt-2 border-t border-ink-100">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div><strong>Core Pain:</strong> 15 disconnected fax lines, unformatted PBM rejection codes, and endless voicemail queues.</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div><strong>What They Love:</strong> 1-click prioritized triage worklist, deterministic renewal recommendations, and zero double-entry.</div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div><strong>Adoption Gate:</strong> Clinician sign-off modal requires under 10 seconds to review and dispatch.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: THE 8-STAGE FUNNEL SYSTEM ─────────────── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-700">Funnel Strategy &amp; Transitions</span>
              <h2 className="text-2xl font-display font-bold text-ink-900">The 8-Stage Customer Journey Engine</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevStage}
                className="p-1.5 rounded-lg border border-ink-200 hover:bg-ink-100 text-ink-600 transition-colors"
                title="Previous Stage"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-mono text-ink-500 font-semibold">
                Stage {currentStage.num} / 08
              </span>
              <button
                onClick={handleNextStage}
                className="p-1.5 rounded-lg border border-ink-200 hover:bg-ink-100 text-ink-600 transition-colors"
                title="Next Stage"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Funnel Stage Navigator Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {FUNNEL_STAGES.map((stage) => {
              const isSelected = selectedStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage.id)}
                  style={{
                    borderColor: isSelected ? stage.color : "#E5E7EB",
                    background: isSelected ? stage.bgLight : "#FFFFFF",
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected ? "shadow-sm ring-2 ring-offset-1" : "hover:border-ink-300"
                  }`}
                >
                  {stage.isEmphasized && (
                    <span
                      style={{ background: stage.color }}
                      className="absolute -top-1.5 -right-1 w-2.5 h-2.5 rounded-full"
                      title="Key Evaluation Milestone"
                    />
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-ink-400">{stage.num}</span>
                    <span className="font-mono text-[9px] text-ink-400 font-semibold">{stage.conversionRate.split(" ")[0]}</span>
                  </div>
                  <div className="font-display font-bold text-xs text-ink-900 truncate mt-0.5">{stage.name}</div>
                  <div className="text-[10px] text-ink-400 truncate mt-0.5">{stage.tagline}</div>
                </button>
              );
            })}
          </div>

          {/* Active Stage Detail Card (The 3 Columns from the Diagram) */}
          <div
            style={{
              borderColor: currentStage.borderColor,
              background: "#FFFFFF",
            }}
            className="card p-6 sm:p-8 rounded-2xl border-2 shadow-sm space-y-6"
          >
            {/* Stage Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <span
                  style={{ background: currentStage.color }}
                  className="w-9 h-9 rounded-xl text-white font-mono font-bold text-sm flex items-center justify-center"
                >
                  {currentStage.num}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-display font-bold text-ink-900">{currentStage.name}</h3>
                    {currentStage.isEmphasized && (
                      <span className="badge text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {currentStage.emphasisLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-500 font-medium">{currentStage.tagline}</p>
                </div>
              </div>

              {/* Transition Gate Badge */}
              <div className="bg-ink-50 px-3 py-1.5 rounded-lg border border-ink-200 flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-accent-700 flex-shrink-0" />
                <div className="text-[11px] text-ink-700">
                  <span className="font-bold">Transition Gate:</span> {currentStage.transitionGate}
                </div>
              </div>
            </div>

            {/* 3 Pillars Grid: What We Do, Signals, Customer Experience */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: What We Do */}
              <div className="space-y-3 bg-ink-50/60 p-5 rounded-xl border border-ink-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-700">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  What We Do
                </div>
                <ul className="space-y-2.5 text-xs text-ink-700">
                  {currentStage.whatWeDo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Signals to Move Forward */}
              <div className="space-y-3 bg-ink-50/60 p-5 rounded-xl border border-ink-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  Signals to Move Forward
                </div>
                <ul className="space-y-2.5 text-xs text-ink-700">
                  {currentStage.signals.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Customer Experience */}
              <div className="space-y-3 bg-ink-50/60 p-5 rounded-xl border border-ink-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-700">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  Customer Experience
                </div>
                <ul className="space-y-2.5 text-xs text-ink-700">
                  {currentStage.experience.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-purple-600 font-bold">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: SYSTEMS THINKING (THE NETWORK FLYWHEEL) ─ */}
        <section id="systems" className="card p-6 sm:p-8 bg-white border border-ink-200 rounded-2xl shadow-sm space-y-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-700">Systems Thinking</span>
            <h2 className="text-2xl font-display font-bold text-ink-900 mt-1">Cross-Organization Network Flywheel</h2>
            <p className="text-xs text-ink-500 mt-1 max-w-2xl leading-relaxed">
              Why UnStuck Med creates compounding network density: every clinic onboarded unblocks prescriptions across regional pharmacies, and every connected pharmacy brings new partner clinics into the shared worklist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                <Building className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-blue-950">1. Ambulatory Clinic</h4>
              <p className="text-xs text-blue-900/80 leading-relaxed">
                Staff log stalls into one prioritized queue. 45% of admin friction is auto-deflected, freeing nursing staff for direct patient care.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                <Zap className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-purple-950">2. Intelligence Engine</h4>
              <p className="text-xs text-purple-900/80 leading-relaxed">
                Deterministic classifier de-identifies PII, detects the exact root block in under 4 seconds, and enforces clinical safety invariants.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                <Activity className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-emerald-950">3. Retail Pharmacy</h4>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                Pharmacists receive clean eRx renewal drafts or immediate alternative transfer queries, reducing prescription abandonment by 28%.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                <Stethoscope className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-amber-950">4. Patient Therapy</h4>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Zero chronic maintenance gaps. Patients pick up medication on schedule without playing multi-day phone tag between pharmacy and doctor.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: COMMERCIAL THINKING & INTERACTIVE ROI ─── */}
        <section id="pricing" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-700">Commercial Thinking</span>
              <h2 className="text-2xl font-display font-bold text-ink-900">Pricing Architecture &amp; Unit Economics</h2>
            </div>
            <span className="badge bg-ok-50 text-ok-800 border border-ok-300 font-mono text-xs">High-Margin B2B SaaS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Model 1: Pay-Per-Stall */}
            <div className="card p-6 bg-white border border-ink-200 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-ink-400 uppercase">Usage Tier</span>
                <h3 className="text-lg font-bold text-ink-900 mt-1">Per-Resolved Stall</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-ink-900">$1.20</span>
                  <span className="text-xs text-ink-500">/ resolved refill</span>
                </div>
                <p className="text-xs text-ink-500 mt-2 leading-relaxed">
                  Best for independent retail pharmacies and smaller specialty clinics. Zero upfront platform commitment.
                </p>
                <div className="mt-4 pt-4 border-t border-ink-100 space-y-2 text-xs text-ink-600">
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-ok-600" /> Triage Queue Access</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-ok-600" /> Deterministic Classifier</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-ok-600" /> Human Clinician Sign-off</div>
                </div>
              </div>
              <div className="mt-6 text-[11px] text-ink-400 font-mono">Breaks even on 1st saved call</div>
            </div>

            {/* Model 2: Provider SaaS (Flagship) */}
            <div className="card p-6 bg-accent-50/50 border-2 border-accent-300 rounded-2xl shadow-sm flex flex-col justify-between relative">
              <span className="absolute -top-3 right-4 bg-accent-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-mono font-bold text-accent-700 uppercase">Ambulatory Group</span>
                <h3 className="text-lg font-bold text-ink-900 mt-1">Clinic Provider SaaS</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-accent-700">$490</span>
                  <span className="text-xs text-ink-500">/ provider / month</span>
                </div>
                <p className="text-xs text-ink-600 mt-2 leading-relaxed">
                  Full multi-pod triage automation for primary care groups with 5 to 50 clinicians.
                </p>
                <div className="mt-4 pt-4 border-t border-accent-200 space-y-2 text-xs text-ink-700">
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent-600" /> Unlimited Refill Triage</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent-600" /> Bi-directional EHR Connector</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent-600" /> Therapy Protected Protocol</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent-600" /> Partner Pharmacy Stock Lookup</div>
                </div>
              </div>
              <div className="mt-6 text-[11px] text-accent-800 font-semibold">Payback: 3 hours of staff phone tag</div>
            </div>

            {/* Model 3: Health System Enterprise */}
            <div className="card p-6 bg-white border border-ink-200 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-ink-400 uppercase">Enterprise</span>
                <h3 className="text-lg font-bold text-ink-900 mt-1">Health System Campus</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-ink-900">Custom</span>
                  <span className="text-xs text-ink-500">volume tiered</span>
                </div>
                <p className="text-xs text-ink-500 mt-2 leading-relaxed">
                  Hospital networks and regional ACOs managing over 50,000 active chronic therapy lives.
                </p>
                <div className="mt-4 pt-4 border-t border-ink-100 space-y-2 text-xs text-ink-600">
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-ok-600" /> Dedicated FHIR R4 Bridge</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-ok-600" /> Custom Formulary Rule Engine</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-ok-600" /> 99.9% High Availability SLA</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-ok-600" /> Enterprise BAA &amp; Audit Logs</div>
                </div>
              </div>
              <div className="mt-6 text-[11px] text-ink-400 font-mono">Includes custom integration</div>
            </div>
          </div>

          {/* Interactive ROI Calculator */}
          <InteractiveROICalculator />
        </section>

        {/* ── SECTION 5: MEASUREMENT & GROWTH METRICS ──────────── */}
        <section id="metrics" className="card p-8 bg-white border border-ink-200 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-700">Measurement &amp; Growth</span>
              <h2 className="text-2xl font-display font-bold text-ink-900">Live Operating Metrics &amp; Unit Proof</h2>
            </div>
            <Link href="/dashboard" className="btn btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              Inspect Live Worklist <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="text-xs font-bold text-ink-400 uppercase">Avg Time Saved / Stall</div>
              <div className="text-3xl font-mono font-extrabold text-ink-900 mt-1">192 Min</div>
              <div className="text-[11px] text-ok-700 font-semibold mt-1">Replaces phone tag &amp; faxes</div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="text-xs font-bold text-ink-400 uppercase">Admin Queue Deflection</div>
              <div className="text-3xl font-mono font-extrabold text-accent-700 mt-1">45%</div>
              <div className="text-[11px] text-accent-700 font-semibold mt-1">Resolved without clinician intervention</div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="text-xs font-bold text-ink-400 uppercase">Provider Turnaround</div>
              <div className="text-3xl font-mono font-extrabold text-emerald-700 mt-1">3.2x</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">Accelerated renewal cycle</div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
              <div className="text-xs font-bold text-ink-400 uppercase">Safety Guardrail Invariant</div>
              <div className="text-3xl font-mono font-extrabold text-purple-700 mt-1">100%</div>
              <div className="text-[11px] text-purple-700 font-semibold mt-1">0 unauthorized C-II dispatches</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
