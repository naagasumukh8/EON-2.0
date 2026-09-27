# 🏥 Closing the Prescription Refill Gap — Problem Brief

> **Hackathon**: Polymath Innovae × Eonexea AI  
> **Track**: Product + Intelligence + Market  
> **Time Window**: 24 hours  
> **B2B Customers**: Pharmacies + Physician Practice Staff  

---

## 🎯 The Real Bottleneck (Not Just "Digitizing the Process")

A refill stalls the **moment provider intervention is required**. The existing tools (EHRs, pharmacy systems, fax, phone) don't talk to each other — so no single actor has complete visibility into *why* the refill is stuck and *what must happen next*.

The patient just sees: **"I still don't have my medication."**

---

## 🔴 The 6 Failure Modes That Cause a Stall

| # | Trigger | Who Gets Stuck |
|---|---------|---------------|
| 1 | No refills remain on the prescription | Pharmacy → Provider |
| 2 | New Rx or explicit provider approval required | Provider → Practice Staff |
| 3 | Patient needs another visit before refill | Provider → Patient |
| 4 | Information missing or unclear | Any party → Any party |
| 5 | Provider must review patient condition first | Provider (internal) |
| 6 | Insurance / PBM / admin requirements blocking | Insurance → Pharmacy → Provider |

---

## 🔁 The Broken Hand-Off Chain

```
Patient → Pharmacy → Provider → Practice Staff → Patient → Provider → Pharmacy
```

Each arrow = a **different channel** (portal, fax, phone, EHR message, voicemail).  
Each arrow = **lost context** about why it's stuck and what's needed.  
Each arrow = **time delay** during which the patient is without medication.

---

## 👥 Who Has the Problem (Buying Personas)

### Primary Buyer: Physician Practice / Group
- **Medical Assistants & Front Desk Staff** — drowning in refill phone calls & fax queues
- **Practice Manager** — accountable for throughput, patient satisfaction scores, staff burnout
- **Physician** — interrupted mid-care for refills that don't need clinical judgment

### Co-Buyer / Integration Partner: Pharmacy (Chain or Independent)
- **Pharmacist** — stuck waiting for fax/phone approval; can't fill; patient is at the counter
- **Pharmacy Tech** — manually tracking status across multiple providers
- **Pharmacy Director** — script fill rate, abandoned prescriptions, staff overhead

### End-Beneficiary (Not the Buyer): Patient
- Chronic-condition patients: diabetes, hypertension, mental health, thyroid, asthma
- Most likely to feel the friction repeatedly — every 30/90 days

---

## 📐 The System State Machine (What Intelligence Must Track)

```
SUBMITTED → PENDING_REVIEW → [BLOCKED: reason] → ACTION_REQUIRED → IN_PROGRESS → RESOLVED → FILLED
                                      ↕
                              ESCALATED_TO_HUMAN
```

For each state, the system must answer:
1. **What's happening now?**
2. **What's missing?**
3. **What's blocking progress?**
4. **Who or what can resolve it?**
5. **What should happen next?**
6. **Did it actually happen?**
7. **What's the new state?**

---

## ⚖️ Where AI Helps vs. Where Humans Must Decide

| AI Can Do | Human Must Decide |
|-----------|------------------|
| Classify the block reason from fax/message text | Whether to approve a refill |
| Route to the right staff member | Whether a visit is needed |
| Draft the pre-auth request | Clinical judgment on condition change |
| Predict refill gaps before they happen | DEA-controlled substance approvals |
| Summarize patient history for provider review | Insurance appeal decisions |
| Generate patient status SMS | Overriding a safety flag |
| Flag incomplete/contradictory data | |

---

## 🏗️ Architecture Must-Haves (Judging Criteria Coverage)

- **Frontend**: Staff-facing refill queue dashboard (pharmacy + practice views)
- **Backend**: State-machine engine tracking each refill's current block + next action
- **APIs**: EHR webhook integration, pharmacy system (NCPDP), fax-to-structured-data, insurance/PBM
- **AI Layer**: Block-reason classifier, action recommender, patient communication generator
- **Security**: HIPAA-compliant, role-based access, audit trail on every state transition
- **Observability**: Why is this refill stuck? How long has it been in each state? Who last touched it?
- **Reliability**: Offline-capable queue; no refill lost if an API dependency fails

---

## 💰 The Metric That Matters

> **Primary KPI**: Time-to-Fill (TTF) when provider intervention is required  
> Baseline: 3–7 days average  
> Target: < 24 hours for 80% of non-visit-required refills  

**Secondary KPIs:**
- Staff minutes spent per refill (reduce from ~18 min to < 3 min)
- Abandoned prescription rate (patient gives up)
- Provider interruption rate (mid-schedule refill calls)
- Patient CSAT on medication continuity

---

## 🚫 Deliberately OUT OF SCOPE (for 24h build)

- Patient-facing mobile app
- Full EHR integration (use mock/webhook simulation)
- Controlled substance (DEA Schedule II) workflows
- Insurance pre-auth automation (flag it, don't automate it)
- Multi-location pharmacy chain management
- Billing / reimbursement workflows

---

## 🗺️ Go-To-Market: Chosen Segment

**Target**: Independent physician practices (3–15 providers) + independent pharmacies  
**Why**: Highest pain, lowest existing tooling, fastest sales cycle, references that scale up

**Funnel Signals to Watch**:
- Practice manager Googling "reduce refill phone calls"
- Pharmacist complaints about fax delays on chronic-med patients
- EHR marketplace listing views → demo requests

---

## ⚠️ Scope Creep Watchdog (Active)

This file is the **single source of truth** for what we're building.  
The AI agent will flag any drift from the above using the DIVERSION ALERT protocol.

**Core Slice**: Staff-facing refill queue with AI block-reason classifier + next-action router  
**Everything else**: OUT OF SCOPE until the core slice is demo-ready.

---

*Last updated: 2026-09-27 | Status: Problem locked, awaiting solution proposal*
