# AGENTS.md — 60-Minute Hackathon Autonomous Protocol
**Event**: Polymath Innovae × Eonexea AI Hackathon  
**Target Date**: September 28, 2026  
**Build Time Window**: Strictly 60 Minutes  
**Presentation Time**: 5 Minutes (2 min problem framing + 3 min live demo)  

---

## 🚨 THE CORE LAW: DEPTH OVER BREADTH

> **"Depth on one narrow slice beats breadth across the whole problem — judges reward a sharp, working piece over an ambitious but unfinished system."**  
> *(Source: Official Hackathon Judging Rubric)*

### ⚠️ THE ANTI-DIVERSION WATCHDOG PROTOCOL
Whenever a task is proposed or executed during the 60-minute window, the AI Agent must actively monitor for scope creep or feature sprawl. 

**If the session begins to drift toward:**
1. Building secondary tabs, extraneous settings, or multiple half-baked screens
2. Attempting database migrations (Supabase, Postgres, MongoDB) when sample/mock state is sufficient
3. Spending time on complex authentication, account management, or third-party OAuth
4. Perfecting minor cosmetic styling at the expense of core decision logic and reasoning

**The Agent MUST immediately output this warning:**
```
══════════════════════════════════════════════════════════════════════════
⚠️ [DIVERSION ALERT] SCOPE CREEP DETECTED
We are drifting away from our single core slice.
Current Clock: [MM:SS remaining]
Rule: 1 deep, fully functional workflow with visible reasoning beats 5 unfinished screens.
Action: Terminating tangential work. Refocusing on the primary interactive slice now.
══════════════════════════════════════════════════════════════════════════
```

---

## ⏱️ THE 60-MINUTE SPRINT PLAYBOOK

```
[00:00 - 07:00]  STAGE 1: Framing & Single-Slice Lock
[07:00 - 35:00]  STAGE 2: Deep Core Workflow Execution
[35:00 - 45:00]  STAGE 3: Deliberate Limitation & Rubric Armor
[45:00 - 55:00]  STAGE 4: Live Demo Verification & 5-Min Pitch Rehearsal
[55:00 - 60:00]  STAGE 5: Vercel Push & Demo Lock
```

### Stage 1: Framing & Single-Slice Lock (Min 0–7)
1. Read the newly given problem statement.
2. Formulate the **Business Situation in 1–2 sentences** (why it matters before showing tech).
3. Select **ONE narrow slice** (e.g. 1 triage decision layer, 1 tradeoff slider set, or 1 friction moment).
4. Declare all other aspects *OUT OF SCOPE*.
5. Name the **Core Principle / Scoring Logic** (e.g., *Reflective Delay Heuristic*, *Weighted Opportunity Cost*, *Valence vs Liability Matrix*).

### Stage 2: Deep Core Workflow Execution (Min 7–35)
1. Build the end-to-end interactive mechanism for that exact slice.
2. Provide **3–5 authentic, messy, realistic sample inputs** (e.g. real-looking angry tweets, contradictory user feedback, or borderline lab numbers).
3. Display the **visible reasoning trail** (the inspectable "WHY" column/card behind every AI output).
4. Connect to either the **15-API Registry** or zero-latency offline mock models.

### Stage 3: Deliberate Limitation & Rubric Armor (Min 35–45)
1. Formulate at least **ONE deliberate edge-case failure** where the prototype does not work or misclassifies (e.g. multi-intent reversals, extreme outliers).
   > *Rubric Insight: "Self-awareness about limits reads as maturity, not weakness."*
2. Quantify the exact **target business metric** the solution is designed to move (e.g. *+18.5% net margin expansion*, *45% ticket volume deflection*, *38% 6-month retention*).

### Stage 4: Live Demo Verification & Pitch Rehearsal (Min 45–55)
1. Verify live interactivity locally on `localhost:3000`.
2. Rehearse the **5-Minute Pitch Script**:
   - **Minute 0:00 – 2:00 (Framing)**: Open with the business situation and the real bottleneck.
   - **Minute 2:00 – 4:00 (Live Demo)**: Type 2–3 sample inputs live in front of the judges, narrating the visible reasoning out loud.
   - **Minute 4:00 – 4:30 (Self-Awareness)**: Point out the deliberate boundary failure and why it happens.
   - **Minute 4:30 – 5:00 (The Metric & Ask)**: Close on the exact metric moved and validation proof.

### Stage 5: Vercel Push & Demo Lock (Min 55–60)
1. Run `npm run build` to verify clean bundle.
2. `git add . && git commit -m "hackathon: final verified prototype" && git push origin main`.
3. Verify live Vercel deployment URL.
4. Keep `localhost:3000` open as immediate zero-latency backup.

---

## 🧠 SYSTEM PATTERNS APPLIED

### 1. GSD (Get Shit Done) Pattern
- **Spec-driven execution**: Never code without a 5-line specification artifact.
- **State on disk**: Progress and state tracked in `task_list.md` and `lib/sample-data.ts`.
- **Zero context rot**: Focused turns with explicit task verification.

### 2. Ralph Loop Pattern
- Iterative execution loop:
  `Read Spec → Implement 1 Task → Build / Validate → Commit → Next`.
- Prevents runaway hallucinations by checking compiler output on each milestone.

### 3. CodeRabbit Verification Pattern
- Automated self-review checklist before closing each task:
  - [ ] Does this run with zero console errors?
  - [ ] Does it work completely offline if venue Wi-Fi fails?
  - [ ] Is the reasoning trail visible to judges?
  - [ ] Is the deliberate limitation prominently documented?
  - [ ] Are 3-5 messy sample inputs ready for live typing?

---

## 📋 PRE-WIRED ARCHITECTURE REFERENCE
- **Design System**: Vercel Solid Pitch-Black (`#000000`, 1px `#222` borders, monospace tags, radial glows).
- **Interactive Framework**: Next.js 14 App Router (React, Tailwind CSS, Lucide icons).
- **API Registry**: `lib/api-registry.ts` (15 pre-wired typed slots with dual Mock/Live toggle).
- **Presentation HUD**: `components/PitchDrawer.tsx` (5-minute countdown + rubric cheat sheet).
- **Sample Data Bank**: `lib/sample-data.ts` (authentic real-world datasets across all 3 tracks).
