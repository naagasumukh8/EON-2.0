# AGENT.md — UnStuck Med · Single Source of Truth
> Read this first. Update before finishing any task. Last updated: 2026-09-27

---

## 1. Project Identity & Framing
- **Brand**: UnStuck Med
- **Tagline**: "Prescription refills. Unstuck in minutes."
- **Event**: Polymath Innovae × Eonexea AI Hackathon 2026
- **Problem Statement (1–2 sentences)**: When maintenance prescription refills require provider intervention, they stall across phone tag, fax queues, and EHR inboxes for an average of 3.2 days (192 minutes active manual coordination). UnStuck Med provides a unified cross-organizational triage worklist that deterministically classifies the block, enforces strict clinical safety guardrails, and automates low-risk coordination while preserving human clinician authority over all therapeutic decisions.
- **Repository**: `naagasumukh8/EON-2.0` (GitHub) → Vercel production deployment
- **Core Law**: **Depth Over Breadth** — 1 deep, fully functional workflow with visible reasoning beats 5 unfinished screens.

---

## 2. Architecture & Autonomy Engine

```
┌────────────────────────────────────────────────────────────────────────┐
│  PERSISTENT AUTONOMY BANNER (app/components/AutonomyBanner.tsx)        │
│  - Visible on every page (layout.tsx)                                  │
│  - Readable by judges in <2 seconds: Badge + 1-Line Explanation        │
│  - Instant toggle: Draft-Only ↔ Autonomous Mode                        │
│  - Hierarchy: User Setting Overrides Org Default                       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  CENTRAL AUTONOMY CONTEXT & STATE MACHINE (lib/autonomy.tsx)           │
│                                                                        │
│  Modes:                                                                │
│  - DRAFT_ONLY: Every action requires human click:                      │
│    ACTION_DRAFTED ➔ ACTION_CONFIRMED ➔ ACTION_SENT                     │
│  - AUTONOMOUS: Whitelisted low-risk actions auto-skip directly:        │
│    ACTION_DRAFTED ➔ ACTION_CONFIRMED ➔ ACTION_SENT                     │
│                                                                        │
│  Safety Invariant (Hardcoded):                                         │
│  - Therapy-affecting actions (new Rx, dose change, PA justification)   │
│    ALWAYS require human confirmation regardless of active mode.        │
└────────────────────────────────────────────────────────────────────────┘
```

### Whitelist & Safety Rules (`lib/autonomy.tsx`)
1. **Low-Risk Whitelist (Eligible for Auto-Skip in Autonomous Mode)**:
   - `SEND_MISSING_INFO_SMS` ("send missing-info request" via SMS for demographic mismatch)
   - `SEND_PATIENT_STATUS` ("send patient status update" and generic scheduling link)
   - `LOG_INSURANCE_REQUEST` (administrative claim submission log)
   - `SEND_PROVIDER_ALERT` (notification only; provider retains ultimate authority)

2. **Therapy-Affecting Actions (ALWAYS Require Human Confirmation)**:
   - `NEW_RX_REQUEST` ("new Rx", "new eRx renewal request")
   - `DOSAGE_CHANGE` ("dosage change", "dose titration")
   - `PA_JUSTIFICATION` ("prior auth justification", "step therapy appeal")
   - `TRANSFER_RX` ("request transfer" to alternative partner pharmacy)
   - `ESCALATE` (clinical condition escalation to attending physician)

---

## 3. Pages & Density Redesign

| Route | File | Discipline & Density Simplification | Status |
|-------|------|--------------------------------------|--------|
| `/` | `app/page.tsx` | **Antigravity Hero**: Confident dominant typography, near-empty canvas, single quiet cursor-responsive gradient mesh, thin top nav (wordmark + Queue + Classifier + Security + pill CTA). **Opal Scroll Narrative**: 1 step at a time for How It Works. **Single Live Metric**: 192-min manual resolution counter. **Collapsed Workflow**: Expandable cross-org handoff table. | ✅ Production Build Clean |
| `/dashboard` | `app/dashboard/page.tsx` | **Simplified Stat Row**: Reduced to the 2 numbers that matter in a live demo — **Hours Saved This Session** (animated counter) and **Blocked Count** (active bottleneck). Priority-sorted clinical worklist, real state machine execution (`ACTION_DRAFTED` ➔ `ACTION_CONFIRMED` ➔ `ACTION_SENT`), and new **Pharmacy Alternative Suggestion Card**. | ✅ Production Build Clean |
| `/classify` | `app/classify/page.tsx` | **Focused Visual Hierarchy**: Primary emphasis on quick-select sample inputs (messy real-world faxes) and instant triage output with visible reasoning trail. The 5 block types taxonomy is demoted to a secondary collapsed reference accordion to eliminate layout competition. | ✅ Production Build Clean |
| `/security` | `app/security/page.tsx` | Documents 8 security safeguards (Auth+MFA, RLS isolation, PII stripping, append-only audit, RBAC, AES-256/TLS 1.3, notification privacy, autonomy guardrails), explicit HIPAA-aligned caveat, and stated clinical design principle. | ✅ Production Build Clean |
| `/workflow` | `app/workflow/page.tsx` | Detailed provider/pharmacy/PBM actor matrix. Removed from primary top-nav emphasis and integrated as collapsed section reachable from How It Works. | ✅ Production Build Clean |

---

## 4. New Feature — Pharmacy-Alternative Suggestion

### Problem Scoped
When the refill bottleneck is pharmacy-side inventory exhaustion (out of stock, distributor delay, regional backlog), rather than provider renewal or prior authorization:

### Feature Implementation (`app/dashboard/page.tsx`)
- Surfaces an AI-drafted suggestion card when `blockType === "PHARMACY_STOCK"` (e.g. `RF-009` Amoxicillin 500mg out of stock).
- **Mandatory Simulated Data Tag**: Displays a prominent `[SIMULATED DATA]` badge.
- Displays 2 verified in-network partner pharmacies with simulated on-hand units and distance:
  1. CarePoint Pharmacy (0.8 mi · 140 units on hand · Same-day delivery)
  2. Metro Health Pharmacy (1.4 mi · 90 units on hand · Pickup available)
- **Human-in-the-Loop Constraint**: Draft recommendation only — never an auto-transfer. A human clinician or patient must explicitly click **"Request Transfer"** to trigger state transition: `ACTION_DRAFTED ➔ ACTION_CONFIRMED (TRANSFER_REQUESTED)` logged in the immutable audit trail.
- **Provider Continuity Guardrail**: Explicit copy stating *"We deliberately do not suggest alternate providers — clinical continuity stays with the assigned provider"* prominently featured in the UI and documentation.

---

## 5. Design System Tokens (Canonical)

### Color Palette
- **Ink Palette**:
  - `--ink-900: #0D1117` (Deep obsidian black — primary text, high-contrast headings)
  - `--ink-800: #161B22` (Card headers, dark accents)
  - `--ink-600: #4B5563` (Secondary body copy)
  - `--ink-400: #6B7280` (Muted labels, metadata, monospace tokens)
  - `--ink-100: #F3F4F6` (Border dividers, neutral badges)
  - `--ink-50:  #FAFAFA` (Page canvas background)
- **Clinical Accent**:
  - `--accent-600: #2563EB` (Primary actionable blue)
  - `--accent-100: #DBEAFE` (Subtle active states)
  - `--accent-50:  #EFF6FF` (Autonomous mode surfaces)
- **Semantic State Colors**:
  - **Warn / Blocked**: `#92400E` (text), `#FDE68A` (border), `#FFFBEB` (surface) — used for Draft-Only mode and stalled refills.
  - **Success / Resolved**: `#15803D` (text), `#BBF7D0` (border), `#F0FDF4` (surface) — used for session savings and completed refills.
  - **Simulated Stock / Amber**: `#78350F` (text), `#FCD34D` (border), `#FEF3C7` (surface) — used for Pharmacy Alternative card with `[SIMULATED DATA]`.

### Typography
- **Headings & Display**: Google Sans style geometric sans — `Sora` (weights 700, 800) for large, confident headlines with generous vertical spacing.
- **Body & UI**: `Inter` (weights 400, 500, 600) for high legibility across table cells and reasoning cards.
- **Data & Codes**: `JetBrains Mono` for IDs, confidence percentages, tokens, and audit timestamps.

---

## 6. Verification Checklist
- [x] Autonomy toggle wired to real shared context (`lib/autonomy.tsx` + `app/layout.tsx`)
- [x] Org-level default and User-level override logic implemented
- [x] State machine transitions (`ACTION_DRAFTED` ➔ `ACTION_CONFIRMED` ➔ `ACTION_SENT`) enforced in queue
- [x] Whitelisted low-risk actions auto-execute in Autonomous mode
- [x] Therapy-affecting actions strictly protected by human safety guardrail
- [x] Persistent 2-second readable banner rendered on all pages
- [x] Antigravity-discipline hero section with cursor-responsive gradient mesh
- [x] Opal-discipline step-by-step scroll narrative for How It Works
- [x] Dashboard stat row simplified to 2 critical numbers (hours saved + blocked count)
- [x] Classify page layout tightened with collapsible 5 block types taxonomy
- [x] Pharmacy-alternative suggestion card implemented with `[SIMULATED DATA]` tag
- [x] "We deliberately do not suggest alternate providers" stated as core design principle
- [x] Top-nav simplified across all pages (Workflow demoted to collapsed section)
- [x] TypeScript validation clean (`npx tsc --noEmit` exits 0)
- [x] Next.js production build verified clean (`npm run build` exits 0, all 10 pages generated)
