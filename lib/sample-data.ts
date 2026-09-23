// Authentic sample data and problem definitions extracted from the Polymath Innovae x Eonexea AI Hackathon

export interface SupportTicket {
  id: string;
  query: string;
  source: "Reddit" | "Twitter / X" | "Support Form" | "Email";
  sentiment: "Frustrated" | "Neutral" | "Distressed" | "Curious";
  verdict: "AI Can Handle" | "Needs Human";
  confidence: number;
  reasoning: string;
  isDeliberateError?: boolean;
  errorRationale?: string;
}

export interface BuildVsBuyScenario {
  id: string;
  name: string;
  devMonths: number;
  teamSizeNeeded: number;
  vendorCostAnnual: number;
  strategicDifferentiation: number; // 1-10
  integrationComplexity: number; // 1-10
  techDebtTolerance: number; // 1-10
  recommendation: "Build In-House" | "Buy Off-the-Shelf" | "Hybrid / Phased";
  verdictSummary: string;
  tradeoffAnalysis: string[];
}

export interface FeedbackReview {
  id: string;
  text: string;
  rating: number;
  source: "App Store" | "Play Store" | "NPS Survey" | "Zendesk";
  theme: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  isQuietInsight?: boolean;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  referenceRange: string;
  status: "Borderline High" | "Borderline Low" | "Equivocal";
  clinicalContext: string;
  plainLanguageExplanation: string;
  anxiousToneResponse: string;
  dismissiveToneResponse: string;
  doctorQuestions: string[];
  safetyBoundary: string;
}

export interface SpecialistReferral {
  id: string;
  patientInitials: string;
  referringDept: string;
  specialistType: string;
  daysInStage: number;
  stage: "Issued" | "Contacted" | "Scheduled" | "Completed" | "Dropped Off";
  riskLevel: "Normal" | "Elevated Risk" | "Critical Drop-off";
  stuckReason: string;
  recommendedNudge: string;
}

// ---------------- TRACK 1 DATA ----------------

export const SAMPLE_TICKETS: SupportTicket[] = [
  {
    id: "TCK-101",
    query: "Can you tell me where my order #48291 is? It has been 3 days since tracking updated.",
    source: "Support Form",
    sentiment: "Neutral",
    verdict: "AI Can Handle",
    confidence: 96,
    reasoning: "Standard transactional query with unambiguous order ID. Deterministic API fetch can resolve status without emotional risk.",
  },
  {
    id: "TCK-102",
    query: "I ordered the night recovery serum for my daughter's wedding on Saturday. The bottle arrived shattered and glass cut my hand! I need this fixed immediately.",
    source: "Email",
    sentiment: "Distressed",
    verdict: "Needs Human",
    confidence: 99,
    reasoning: "High emotional charge, physical injury risk, and urgent time constraint. An automated deflection would severely destroy brand trust.",
  },
  {
    id: "TCK-103",
    query: "What is your return policy if I opened the seal on the moisturizer?",
    source: "Support Form",
    sentiment: "Curious",
    verdict: "AI Can Handle",
    confidence: 94,
    reasoning: "Factual policy lookup. No dispute or emotional escalation present.",
  },
  {
    id: "TCK-104",
    query: "You charged my card ₹3,499 twice for one subscription order. My rent is due tomorrow and my account is overdrawn! Cancel everything right now.",
    source: "Twitter / X",
    sentiment: "Frustrated",
    verdict: "Needs Human",
    confidence: 98,
    reasoning: "Financial distress + threat of churn + external consequence (overdraft). Requires empathetic human de-escalation and manual billing override.",
  },
  {
    id: "TCK-105",
    query: "Does the SPF 50 shield contain oxybenzone or octinoxate? I have sensitive eczema skin.",
    source: "Reddit",
    sentiment: "Neutral",
    verdict: "AI Can Handle",
    confidence: 91,
    reasoning: "Ingredient formulation fact verification. Straightforward retrieval from certified product spec sheet.",
  },
  {
    id: "TCK-106",
    query: "My order was completely ruined, just cancel it all - oh wait actually nevermind, just please change my delivery address to 4th Cross Indiranagar if it hasn't dispatched.",
    source: "Support Form",
    sentiment: "Frustrated",
    verdict: "Needs Human",
    confidence: 68,
    reasoning: "Rapid intention flip within a single message ('cancel everything' vs 'change address'). Edge case prone to LLM race condition.",
    isDeliberateError: true,
    errorRationale: "Deliberate Boundary Failure: Baseline LLMs frequently trigger the 'Cancellation' webhook due to high-weight keywords before processing the subsequent correction. This prototype flags such multi-intent reversals for human review.",
  },
  {
    id: "TCK-107",
    query: "How do I swap my monthly coffee bean grind size from French Press to Aeropress?",
    source: "Support Form",
    sentiment: "Curious",
    verdict: "AI Can Handle",
    confidence: 95,
    reasoning: "Standard self-serve account setting manipulation easily handled via structured guide or direct action link.",
  },
  {
    id: "TCK-108",
    query: "I've been emailing support for 4 days with zero response. At this point I'm reporting you to the consumer forum.",
    source: "Twitter / X",
    sentiment: "Frustrated",
    verdict: "Needs Human",
    confidence: 99,
    reasoning: "Legal escalation threshold reached. Requires immediate Tier-2 supervisor intervention and SLA breach acknowledgement.",
  },
];

export const BUILD_VS_BUY_PRESETS: BuildVsBuyScenario[] = [
  {
    id: "SCN-1",
    name: "Customer Analytics & Funnel Tracking",
    devMonths: 4,
    teamSizeNeeded: 3,
    vendorCostAnnual: 24000,
    strategicDifferentiation: 2,
    integrationComplexity: 4,
    techDebtTolerance: 5,
    recommendation: "Buy Off-the-Shelf",
    verdictSummary: "Analytics infrastructure is a commodity utility. Low strategic differentiation (2/10) does not justify dedicating 3 core engineers for 4 months.",
    tradeoffAnalysis: [
      "Vendor licensing saves 12 engineer-months (~$120k value)",
      "Mixpanel / PostHog provide continuous maintenance and GDPR compliance out-of-box",
      "Opportunity cost of engineers not building core product differentiation is high",
    ],
  },
  {
    id: "SCN-2",
    name: "Proprietary AI Matching Algorithm",
    devMonths: 6,
    teamSizeNeeded: 2,
    vendorCostAnnual: 60000,
    strategicDifferentiation: 9,
    integrationComplexity: 8,
    techDebtTolerance: 3,
    recommendation: "Build In-House",
    verdictSummary: "Core competitive moat. High strategic differentiation (9/10) and high integration complexity make relying on a third-party vendor a severe existential risk.",
    tradeoffAnalysis: [
      "IP ownership retains company enterprise value",
      "Off-the-shelf vendors lack domain-specific optimization",
      "Vendor lock-in on your core value proposition would be fatal during scale",
    ],
  },
  {
    id: "SCN-3",
    name: "Billing & Subscription Engine",
    devMonths: 3,
    teamSizeNeeded: 2,
    vendorCostAnnual: 18000,
    strategicDifferentiation: 3,
    integrationComplexity: 7,
    techDebtTolerance: 2,
    recommendation: "Buy Off-the-Shelf",
    verdictSummary: "Payment compliance, tax calculation, and multi-currency subscriptions carry extreme risk. Buy Stripe/Paddle to avoid compliance debt.",
    tradeoffAnalysis: [
      "Building in-house introduces high PCI-DSS compliance overhead",
      "Churn prevention features from mature vendors exceed DIY ROI",
      "Stripe fees are lower than maintaining dedicated billing engineers",
    ],
  },
];

export const SAMPLE_REVIEWS: FeedbackReview[] = [
  {
    id: "REV-1",
    text: "App crashes every single time I try to open a PDF larger than 10MB.",
    rating: 1,
    source: "App Store",
    theme: "Memory / Crash",
    severity: "Critical",
  },
  {
    id: "REV-2",
    text: "Please add dark mode! The blinding white screen hurts my eyes in bed.",
    rating: 3,
    source: "Play Store",
    theme: "UI / Aesthetics",
    severity: "Medium",
  },
  {
    id: "REV-3",
    text: "I travel by metro daily. When signal drops between stations, all my draft notes disappear into thin air. Lost 2 hours of work today.",
    rating: 2,
    source: "App Store",
    theme: "Offline Sync Resilience",
    severity: "Critical",
    isQuietInsight: true,
  },
  {
    id: "REV-4",
    text: "Can you change the icon color back to blue? I don't like the new purple.",
    rating: 3,
    source: "Play Store",
    theme: "UI / Aesthetics",
    severity: "Low",
  },
  {
    id: "REV-5",
    text: "Exporting to CSV produces garbled characters for non-English names.",
    rating: 2,
    source: "Zendesk",
    theme: "Export / Data Integrity",
    severity: "High",
  },
  {
    id: "REV-6",
    text: "Sync works great on home Wi-Fi, but when I switch to 5G while walking, it creates duplicate conflicting documents silently.",
    rating: 2,
    source: "NPS Survey",
    theme: "Offline Sync Resilience",
    severity: "Critical",
    isQuietInsight: true,
  },
  {
    id: "REV-7",
    text: "Loving the new search filters! Would be great to save filter presets.",
    rating: 5,
    source: "Play Store",
    theme: "Search & Filters",
    severity: "Low",
  },
  {
    id: "REV-8",
    text: "Battery consumption went from 5% to 35% after the latest v2.4 update.",
    rating: 1,
    source: "App Store",
    theme: "Performance & Battery",
    severity: "High",
  },
];

// ---------------- TRACK 2 DATA ----------------

export const LOYALTY_MECHANICS = {
  traditionalDiscount: {
    name: "Standard Stamp Card (Buy 9 Get 10th Free)",
    flaw: "Optimizes for repetition, not emotional affinity. Customers redeem reward and churn because loyalty was tied to price concession, not brand identity.",
    metricResult: "42% churn immediately following 10th-order reward redemption.",
    customerQuote: "'I only ordered here because I had 8 stamps already. Once I got my free bag, I checked who had the cheaper sale.'",
  },
  behavioralModel: {
    name: "The 'Roaster's Circle' Identity & Endowment Loop",
    psychologicalPrinciples: [
      {
        name: "Endowment Effect & Sunk Craft",
        description: "Users curate their unique 'Palate Profile' (acidity, body, notes). Each order refines their taste vector—giving them perceived ownership over the blend.",
      },
      {
        name: "Variable Reward (Loot Mechanic)",
        description: "Instead of a predictable free cup, every 4th delivery includes an unreleased micro-lot tasting sample with an exclusive invitation to vote on the next roast.",
      },
      {
        name: "Identity Signaling",
        description: "Member status is titled by barista craft ranks ('Guild Cupper', 'Master Roaster'), transforming consumption into status expression.",
      },
    ],
    predictedMetric: "+38% retention past Month 6; 0% price discount needed.",
    customerQuote: "'I helped vote the Ethiopian Honey into next month's line. I feel like this is my personal roastery.'",
  },
};

export const FRICTION_CASE = {
  baselineReturnRate: 31.4,
  projectedReturnRate: 14.2,
  cartDropoffIncrease: 2.8,
  netMarginLift: 18.5,
  frictionPoint: "Post-Cart 'Fit & Fabric Commitment Pause'",
  psychologicalMechanism: "Reflective Delay (Cooling-off Heuristic)",
  description: "Instead of seamless 1-click checkout, the app introduces a deliberate 15-second visual sizing validator: 'Compare this jacket's 42 chest to your favorite Zara coat'. This interrupts emotional impulse and induces deliberate cognitive evaluation.",
};

// ---------------- TRACK 3 DATA ----------------

export const LAB_RESULTS: LabResult[] = [
  {
    id: "LAB-1",
    testName: "Fasting Blood Glucose",
    value: "106 mg/dL",
    referenceRange: "70 – 99 mg/dL",
    status: "Borderline High",
    clinicalContext: "Slightly above normal fasting threshold (100–125 is impaired fasting glucose / pre-diabetes category). Often influenced by acute stress, poor sleep, or late dinner.",
    plainLanguageExplanation: "Your result is 106 mg/dL, which is slightly above the typical standard baseline of 99. In clinical terms, this sits in a mild borderline zone. It does NOT mean you have diabetes, but it serves as an early check-in signal for diet and activity.",
    anxiousToneResponse: "Take a deep breath: this is a very common borderline reading and not an emergency. A single reading can fluctuate based on what you ate yesterday or how you slept. It is a helpful heads-up, not a crisis.",
    dismissiveToneResponse: "While it's only slightly elevated, numbers in this range over time can quietly affect metabolic stamina. Paying attention now with simple lifestyle tweaks prevents bigger complications later.",
    doctorQuestions: [
      "Would you recommend checking an HbA1c test to see my 3-month average?",
      "Could my late-night dinner or morning coffee have nudged this reading?",
    ],
    safetyBoundary: "DISCLAIMER: This analysis is an informational translation tool, not a medical diagnosis. Never start or modify prescription medication without in-person clinical consultation.",
  },
  {
    id: "LAB-2",
    testName: "Serum TSH (Thyroid Stimulating Hormone)",
    value: "4.85 mIU/L",
    referenceRange: "0.40 – 4.50 mIU/L",
    status: "Borderline High",
    clinicalContext: "Mild elevation indicating the pituitary gland is working slightly harder to stimulate thyroid production. Most individuals with TSH between 4.5–7.0 are asymptomatic and require watchful waiting rather than instant thyroxine.",
    plainLanguageExplanation: "Your TSH is 4.85, just a fraction above the 4.5 standard cutoff. Think of TSH like a thermostat: your body is turning the dial up a tiny notch to keep energy levels normal.",
    anxiousToneResponse: "This mild variation is frequently temporary and often resolves on its own on a repeat test in 6–8 weeks. Most doctors will not immediately start medication for a number this close to normal.",
    dismissiveToneResponse: "If you have noticed subtle fatigue or cold intolerance, mention it to your physician, as symptoms combined with this number help clarify whether repeat testing is needed.",
    doctorQuestions: [
      "Should we recheck TSH along with Free T4 in 8 to 12 weeks?",
      "Do my current symptoms align with subclinical thyroid fluctuation?",
    ],
    safetyBoundary: "DISCLAIMER: Laboratory reference ranges vary across testing methodologies. Clinical correlation with physical examination is mandatory.",
  },
  {
    id: "LAB-3",
    testName: "Alanine Aminotransferase (ALT / SGPT)",
    value: "54 U/L",
    referenceRange: "7 – 45 U/L",
    status: "Borderline High",
    clinicalContext: "Mild hepatic enzyme leakage. Extremely common post heavy exercise, mild dehydration, viral illness recovery, or benign fatty liver changes.",
    plainLanguageExplanation: "Your ALT level is 54 U/L, compared to the normal reference ceiling of 45. ALT is an enzyme found inside liver cells that can gently rise from intense workouts, temporary medication, or dietary shifts.",
    anxiousToneResponse: "Mild elevations like 54 are very common and rarely indicate serious liver disease. True acute concerns typically present in hundreds or thousands.",
    dismissiveToneResponse: "It is worth discussing your weekly alcohol intake, supplements, and workout schedule with your doctor to identify any benign triggers.",
    doctorQuestions: [
      "Could recent strenuous workouts or over-the-counter pain relief cause this bump?",
      "Would a fasting ultrasound or repeat panel in 6 weeks be beneficial?",
    ],
    safetyBoundary: "DISCLAIMER: Liver enzymes require holistic clinical review including medical history and medication review by a licensed practitioner.",
  },
];

export const SPECIALIST_REFERRALS: SpecialistReferral[] = [
  {
    id: "REF-801",
    patientInitials: "R. K.",
    referringDept: "Internal Medicine",
    specialistType: "Cardiology (Holter)",
    daysInStage: 9,
    stage: "Contacted",
    riskLevel: "Critical Drop-off",
    stuckReason: "Patient did not answer 2 daytime calls due to work hours. No WhatsApp or online scheduling link sent.",
    recommendedNudge: "Automated WhatsApp 1-tap scheduling link with flexible evening slot selection.",
  },
  {
    id: "REF-802",
    patientInitials: "A. M.",
    referringDept: "General OPD",
    specialistType: "Endocrinology",
    daysInStage: 3,
    stage: "Issued",
    riskLevel: "Normal",
    stuckReason: "Awaiting initial intake review.",
    recommendedNudge: "Standard automated SMS reminder with specialist bio and appointment prep.",
  },
  {
    id: "REF-803",
    patientInitials: "S. N.",
    referringDept: "Orthopedics",
    specialistType: "Physical Therapy",
    daysInStage: 14,
    stage: "Contacted",
    riskLevel: "Critical Drop-off",
    stuckReason: "Out-of-pocket insurance co-pay fear. Patient assumed PT was not covered under corporate plan.",
    recommendedNudge: "Send immediate Insurance Pre-Authorization Clarification note: 'Co-pay is ₹0 under your policy'.",
  },
  {
    id: "REF-804",
    patientInitials: "V. P.",
    referringDept: "Pulmonology",
    specialistType: "Sleep Study Clinic",
    daysInStage: 4,
    stage: "Scheduled",
    riskLevel: "Normal",
    stuckReason: "Appointment confirmed for Thursday.",
    recommendedNudge: "Send pre-test sleep hygiene preparation checklist 24h prior.",
  },
];
