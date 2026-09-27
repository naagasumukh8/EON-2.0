# AGENT.md — UnStuck Med · Single Source of Truth
> Read this first. Update before finishing any task. Last updated: 2026-09-27

---

## 1. Project Identity
- **Brand**: UnStuck Med
- **Tagline**: "Prescription refills. Unstuck in minutes."
- **Repo**: naagasumukh8/EON-2.0 (GitHub) → auto-deploys to Vercel
- **Stack**: Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase (Postgres + Auth)
- **Runtime**: Node 24, npm

---

## 2. Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (Next.js App Router — all pages are "use client") │
│                                                           │
│  /           Landing page (marketing + live stats)        │
│  /dashboard  Shared refill queue + autonomy toggle        │
│  /classify   AI block classifier (offline-safe)           │
│  /workflow   Interactive workflow diagram (2-path)        │
│  /security   Security & Trust statement                   │
│                                                           │
│  lib/supabase.ts    → Supabase client (browser + server)  │
│  app/api/health     → Supabase connectivity probe         │
│  app/api/action     → Autonomy engine: executes or drafts │
└─────────────────────────────────────────────────────────┘
         ↕ REST (Supabase PostgREST) + Realtime WS
┌─────────────────────────────────────────────────────────┐
│  SUPABASE (Postgres)                                      │
│  organizations, refill_requests, refill_events,           │
│  profiles (users+roles), autonomy_settings               │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Data Model

### `organizations`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | Practice or pharmacy name |
| org_type | enum | 'practice' \| 'pharmacy' |
| autonomy_mode | enum | 'DRAFT_ONLY' \| 'AUTONOMOUS' |
| created_at | timestamptz | |

### `profiles` (extends auth.users)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK FK auth.users | |
| org_id | uuid FK organizations | |
| role | enum | 'staff' \| 'provider' \| 'pharmacist' \| 'admin' |
| autonomy_override | enum | NULL \| 'DRAFT_ONLY' \| 'AUTONOMOUS' |

### `refill_requests`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| org_id | uuid FK | RLS scoped |
| patient_token | text | One-way hash of patient ID — no PII stored |
| med_name | text | Medication name (not PHI but de-identified in classifier) |
| med_class | enum | 'chronic_high_risk' \| 'chronic_standard' \| 'acute' |
| block_type | enum | See state machine |
| status | enum | See state machine |
| priority_score | int | 0–100, computed by classifier |
| priority_reason | text | Human-readable "why prioritized" |
| assigned_actor | enum | 'provider' \| 'staff' \| 'pharmacy' \| 'patient' \| 'insurance' |
| next_action | text | Classifier recommended action |
| days_stuck | int | Computed |
| created_at | timestamptz | |
| resolved_at | timestamptz | Nullable |
| minutes_saved | int | Set on RESOLVED, based on 192min avg |

### `refill_events` (insert-only audit log)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| refill_id | uuid FK | |
| org_id | uuid FK | RLS scoped |
| event_type | text | 'CLASSIFIED' \| 'ACTION_DRAFTED' \| 'ACTION_CONFIRMED' \| 'PII_STRIPPED' \| 'RESOLVED' etc |
| actor_id | uuid | User who triggered |
| payload | jsonb | De-identified only |
| autonomy_mode | text | Mode active at time of event |
| created_at | timestamptz | Insert-only enforced by RLS |

### `autonomy_settings` (org-level)
| Column | Type | Notes |
|--------|------|-------|
| org_id | uuid PK FK | |
| mode | enum | 'DRAFT_ONLY' \| 'AUTONOMOUS' |
| auto_allowed_actions | text[] | e.g. ['SEND_MISSING_INFO_SMS', 'SEND_PROVIDER_ALERT'] |
| updated_at | timestamptz | |
| updated_by | uuid FK profiles | |

---

## 4. State Machine

```
SUBMITTED
    ↓ (AI Classifier runs, PII stripped before model call)
CLASSIFYING
    ↓
CLASSIFIED  ← block_type assigned, priority_score set
    ↓
ACTION_DRAFTED  ← next_action generated
    ↓ (DRAFT_ONLY: human confirms)  (AUTONOMOUS: auto-executes if whitelisted)
ACTION_CONFIRMED
    ↓
IN_PROGRESS  ← assigned actor notified
    ↓
RESOLVED  ← minutes_saved logged, counter incremented

Side transitions:
  Any state → ESCALATED (if priority_score > 85 and stuck > 24h)
  CLASSIFIED → VISIT_REQUIRED (if block_type = VISIT)
```

### Block Types
| Type | Meaning | Default Actor |
|------|---------|---------------|
| NO_REFILLS | Rx expired, new eRx needed | provider |
| INSURANCE | PA / step therapy / denial | staff |
| VISIT | Provider requires appointment | patient |
| MISSING_INFO | Incomplete data | staff |
| CONDITION | Clinical review needed | provider |

### Autonomy Whitelist (AUTONOMOUS mode only)
Actions that CAN auto-execute without human confirmation:
- `SEND_MISSING_INFO_SMS` — patient contact only, no therapy change
- `SEND_PROVIDER_ALERT` — notification only, provider still decides
- `LOG_INSURANCE_REQUEST` — admin action, no clinical impact

Actions that ALWAYS require human confirmation:
- Anything that changes therapy (new Rx, dose change)
- Anything that communicates diagnosis or medication to patient
- `ESCALATE` actions

---

## 5. Pages

| Route | File | Purpose | Primary Demo? |
|-------|------|---------|---------------|
| `/` | app/page.tsx | Landing — value prop, live savings counter, CTA | Yes (open) |
| `/dashboard` | app/dashboard/page.tsx | Shared refill queue + autonomy toggle | **Primary demo** |
| `/classify` | app/classify/page.tsx | AI block classifier + risk scoring | **Primary demo** |
| `/workflow` | app/workflow/page.tsx | Interactive workflow diagram | Supporting |
| `/security` | app/security/page.tsx | Security & Trust statement | Supporting |

---

## 6. Design Tokens (Canonical)

### Colors
```css
--ink-900:    #0D1117   /* primary anchor, near-black */
--ink-800:    #161B22   /* dark surface */
--ink-700:    #21262D   /* elevated surface */
--ink-600:    #30363D   /* border/divider */
--ink-400:    #6E7681   /* muted text */
--ink-200:    #C9D1D9   /* subtle text */
--ink-100:    #F0F2F4   /* light surface */
--ink-50:     #F8F9FA   /* page bg */

--accent-700: #1E40AF   /* deep accent */
--accent-600: #2563EB   /* core accent blue */
--accent-500: #3B82F6   /* hover state */
--accent-100: #DBEAFE   /* accent surface */
--accent-50:  #EFF6FF   /* accent pale */

--amber-700:  #92400E   /* blocked — dark text */
--amber-600:  #B45309   /* blocked — standard text */
--amber-200:  #FDE68A   /* blocked — border */
--amber-50:   #FFFBEB   /* blocked — surface */

--sage-700:   #166534   /* resolved — dark text */
--sage-600:   #15803D   /* resolved — standard text */
--sage-200:   #BBF7D0   /* resolved — border */
--sage-50:    #F0FDF4   /* resolved — surface */

--red-600:    #DC2626   /* error/high priority */
--red-50:     #FEF2F2   /* error surface */
```

### Typography
```
Display/Headings: Sora (weights 600, 700, 800) — editorial, high contrast
Body/Data/UI:     Inter (weights 400, 500, 600) — legible at small sizes
Mono:             JetBrains Mono — for IDs, codes, timestamps
```

### Type Scale (5 sizes max)
```
text-xs:   12px / 1.5   — meta, labels, timestamps
text-sm:   14px / 1.5   — body, table cells
text-base: 16px / 1.6   — standard body
text-xl:   20px / 1.3   — section headers
text-4xl:  36px / 1.1   — page titles
text-6xl:  60px / 1.0   — hero display
```

### Spacing
Standard 8px grid. Key values: 4, 8, 12, 16, 24, 32, 48, 64, 96px

### Borders & Radius
- Border: 1px solid var(--ink-600) on dark, 1px solid #E5E7EB on light
- Radius: 6px cards, 4px inputs, 2px badges

---

## 7. Security Implementation

| Measure | Status | Notes |
|---------|--------|-------|
| Supabase Auth + MFA | Configured | TOTP-capable via Supabase Auth |
| Session expiry | 1 hour idle, 24h absolute | Configured in Supabase dashboard |
| Row-Level Security | RLS on all patient/refill tables | org_id = auth.jwt() claim |
| PII stripping before LLM | Implemented | Only med_class, block_type, days_stuck sent |
| Audit log (insert-only) | refill_events | RLS: no UPDATE or DELETE |
| Role-based UI | 4 roles | staff/provider/pharmacist/admin |
| Patient notifications | Generic text only | No med name, no diagnosis |
| Encryption | At rest (AES-256) + in transit (TLS 1.3) | Supabase managed |

---

## 8. Key Constants
```ts
AVG_MANUAL_MINUTES = 192  // 3.2 hours — labeled as estimate, from industry data
PRIORITY_THRESHOLD_HIGH = 75
PRIORITY_THRESHOLD_ESCALATE = 85
AUTONOMY_WHITELISTED_ACTIONS = ['SEND_MISSING_INFO_SMS', 'SEND_PROVIDER_ALERT', 'LOG_INSURANCE_REQUEST']
```

---

## 9. Next Steps
- [x] AGENT.md created
- [x] Design system defined (tokens, fonts, grid)
- [ ] Vercel login + production deploy
- [ ] Supabase RLS policies written and applied
- [ ] Real Supabase Auth flow (currently mock)
- [ ] WebSocket real-time queue updates
- [ ] E2E test: full refill from SUBMITTED → RESOLVED in both autonomy modes
