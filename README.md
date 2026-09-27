# UnStuck Med — Autonomous & Human-in-the-Loop Prescription Refill Triage Platform

> **Polymath Innovae × Eonexea AI Hackathon**  
> **Target Metric**: 192 minutes saved per stalled refill · 45% deflection of manual clinic/pharmacy phone tag.  
> **Core Law**: Depth over breadth — deterministic rules, visible reasoning, and enforced human clinician sign-off.

---

## ⚡ Quick Links
- **Worklist Command Center**: [`/dashboard`](/dashboard)
- **Deterministic AI Classifier**: [`/classify`](/classify)
- **Workflow & Triage Rules Matrix**: [`/workflow`](/workflow)
- **GTM & Commercial Funnel**: [`/gtm`](/gtm)
- **Security & HIPAA Governance**: [`/security`](/security)
- **Full Implementation Report**: [`WHAT_IS_DONE.md`](./WHAT_IS_DONE.md)

---

## 🏥 The Problem: The $2.1B Refill Coordination Stall

When a prescription refill stalls between a pharmacy, a physician's clinic, and an insurance PBM:
- Patients wait **3 to 5 business days** without critical maintenance medication.
- Clinic staff spend **192 minutes** per refill on manual faxes, voicemails, and EHR chart lookups.
- Generic LLM wrappers fail because they hallucinate dosages or auto-dispatch therapy changes without clinical oversight.

**UnStuck Med** replaces this broken loop with:
1. **Deterministic Rule Engine**: Hard boundaries on therapy-affecting drugs, controlled substances (C-II), and prior authorizations.
2. **Shared Cross-Org Worklist**: Unified triage queue with real-time clinical priority scoring (0–100).
3. **Enforced Human-in-the-Loop Sign-Off**: Draft-Only protocol where credentialed clinicians must sign and approve before any eRx renewal or transfer is dispatched.
4. **Partner Pharmacy Stock Resolver**: Surfaces nearby in-network pharmacies with verified stock during wholesaler outages.

---

## 🚀 Key Features

### 1. Dual Autonomy Modes (`DRAFT_ONLY` vs `AUTONOMOUS`)
- **Draft-Only Mode**: Every AI recommendation requires a human clinician review & sign-off modal before dispatching.
- **Autonomous Mode**: Whitelisted low-risk administrative tasks (DOB demographic typo correction, formulary checks) auto-execute; **therapy-affecting changes remain strictly locked behind human approval**.

### 2. Clinical Sign-Off Modal
- Displays full clinical context: patient token, medication, adherence history, and stall reason.
- Evaluates EHR adherence checks and C-II controlled substance exclusion.
- Logs credentialed attending signer (`Dr. Sarah Chen, PharmD`, Lic #CA-89211) and clinical audit justification note directly into the immutable audit trail.

### 3. Deliberate Self-Aware Failure Boundary
- Located at [`/classify`](/classify).
- When presented with ambiguous, contradictory patient notes, the classifier **deliberately refuses to guess or hallucinate**, routing the case to a senior triage clinician.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 App Router (React 18, TypeScript)
- **Styling**: Tailwind CSS + Custom Design System
- **Icons**: Lucide React
- **Runtime**: Serverless / Vercel Edge Ready (with offline mock fallback state)
- **Security**: Zero-PII synthetic tokenization (`pt-7a3f`), Row-Level Security isolation, immutable audit trail.

---

## 🏃 Local Setup & Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser
http://localhost:3000

# 4. Verify production build
npm run build
```

---

## 📄 License
Polymath Innovae × Eonexea AI Hackathon. All rights reserved.