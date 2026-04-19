# FinClarity — Technical Specification

## Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend + Backend | [Next.js 15 (App Router)](https://nextjs.org/docs/app/getting-started) + TypeScript | Single framework, single deployment, single language. API routes handle backend logic. TypeScript catches errors before build. |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/docs/installation/using-vite) | Utility-first, included by default in `create-next-app`. Enables the warm, nature-inspired design from `scope.md` without writing custom CSS files. |
| Database + Auth | [Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) | PostgreSQL database + anonymous auth in one platform. Anonymous users get a real user ID from first visit — upgrades to full account on signup with no data migration needed. Free tier covers hackathon scale. |
| PDF Handling | [pdfjs-dist](https://www.npmjs.com/package/pdfjs-dist) | Mozilla's PDF.js in npm form. Detects password protection, decrypts in memory with user-provided password, extracts text + table content. Runs in Node.js (API route), never in browser — password never touches client. |
| AI — Extraction | [Claude API (claude-haiku-4-5)](https://platform.claude.com/docs/en/build-with-claude/pdf-support) | Lowest-cost tier. Reads raw text extracted from the PDF and returns structured transaction JSON. Handles all SG bank formats without bank-specific parsing rules. |
| AI — Narrative | [Claude API (claude-haiku-4-5)](https://docs.anthropic.com/en/docs/about-claude/models/overview) | Same model for narrative generation, observations, and forward-looking nudges. One model, one API key, predictable cost. |
| Email | [Resend](https://resend.com/docs/introduction) | Free tier: 100 emails/day. Simple REST API. Used for monthly check-in reminders only. |
| Deployment | [Vercel](https://vercel.com/docs/frameworks/nextjs) | Native Next.js hosting. Hobby (free) plan covers the build. Vercel Cron Jobs available on free tier for the daily reminder check. |

---

## Runtime & Deployment

- **Runtime:** Web app (browser). No native mobile in v1 — React knowledge transfers directly to React Native for future mobile.
- **Deployment:** Live URL on Vercel. `vercel deploy` from the project root after linking to a Vercel project.
- **Environment:** Node.js 20+. Requires three environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=        # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # From Supabase project settings
ANTHROPIC_API_KEY=               # From console.anthropic.com
RESEND_API_KEY=                  # From resend.com dashboard
```

- **Database setup:** Run the SQL schema in `supabase/schema.sql` against your Supabase project via the SQL editor. No migrations framework needed for v1.

---

## Architecture Overview

```
Browser (React)
      │
      │  HTTP requests (fetch API)
      ▼
┌─────────────────────────────────────────────┐
│           Next.js 15 on Vercel               │
│                                             │
│  app/  (pages)     app/api/  (API routes)   │
│  ├── /demo         ├── /statements/upload   │
│  ├── /dashboard    ├── /statements/[id]     │
│  ├── /breakdown    ├── /transactions        │
│  ├── /history      ├── /reports             │
│  └── /settings     ├── /exchange-rates      │
│                    ├── /export/csv          │
│                    ├── /export/pdf          │
│                    ├── /user                │
│                    └── /cron/reminders      │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴──────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌──────────────────┐
│  Supabase   │    │   Anthropic API   │
│  PostgreSQL │    │  claude-haiku-4-5 │
│  + Auth     │    │                  │
└─────────────┘    └──────────────────┘
                          │
                   ┌──────┴──────┐
                   │   Resend    │
                   │  (email)    │
                   └─────────────┘
```

**How frontend and backend communicate:**
The browser sends HTTP requests to Next.js API routes (`app/api/`). These routes run on Vercel's servers — not in the browser. They talk to Supabase and the Claude API, then return JSON to the browser. The browser never holds an Anthropic API key.

---

## Frontend

### Layout & Navigation
Implements `prd.md > Navigation & Settings`.

`components/layout/Sidebar.tsx` — collapsible sidebar. Contains:
- Dashboard link
- Upload New Statement (CTA)
- Upload History link
- Settings link

Sidebar state (open/closed) stored in React `useState`. Does not re-render the main content area on toggle — uses CSS transform for animation.

`app/layout.tsx` — wraps all pages. Renders `Sidebar` and `TopBar`. Applies global font and Tailwind base styles. Initialises Supabase anonymous auth on first visit via `middleware.ts`.

`components/layout/TopBar.tsx` — displays streak counter (fetched from Supabase), user auth status.

### Demo Dashboard
Implements `prd.md > First-Run Experience`.

`app/demo/page.tsx` — static page. No database calls. Uses hardcoded sample transactions (realistic Singapore data — food, transport, utilities, dining). Clearly labelled "Demo — not your real finances" banner.

`components/ui/Tooltip.tsx` — layered over 3 key sections (narrative, summary cards, upload CTA). Shown only when `users.has_completed_onboarding = false`. Dismissed on click or on first real upload.

Upload CTA button at bottom links to `/dashboard` and triggers the upload flow.

### Dashboard (Real Data)
Implements `prd.md > Dashboard & Monthly Report`.

`app/dashboard/page.tsx` — fetches current month's `monthly_reports` row on load. Renders four stacked sections:

1. **NarrativeSummary** — 2–3 sentences from `monthly_reports.narrative_text`. Two states: if no uploads yet, shows prompt to upload first statement. If bad month, narrative acknowledges truth first then pivots to actionable.

2. **SummaryCards** — 4 cards from `monthly_reports.summary_cards_json`: Total Spent, Total Saved, Biggest Spending Category, One Forward-Looking Watchout.

3. **ObservationsPanel** — collapsible. Retrospective flags from `monthly_reports.observations_json`. Warm conversational language ("Heads up — your streaming subscription went up by $2").

4. **NudgesSection** — forward-looking. 1–2 items from `monthly_reports.nudges_json`. Non-paternalistic, predictive ("Your phone bill usually hits around the 15th").

If user has only one month of data: `ObservationsPanel` is hidden, `SummaryCards` MoM comparison field shows "Upload a past statement to unlock comparisons."

Month selector at top of dashboard (defaults to current month, allows switching to prior months).

### Upload Flow
Implements `prd.md > Statement Upload & Processing`.

`app/dashboard/page.tsx` includes the upload CTA. Upload flow is a modal or drawer, not a separate page — keeps context.

`components/upload/UploadZone.tsx` — drag-and-drop zone + file picker button. Accepts PDF only. On file select, sends to `POST /api/statements/upload`.

`components/upload/PasswordPrompt.tsx` — appears inline if API responds with `needs_password`. User enters password in the same flow. Password sent to `POST /api/statements/upload` as `multipart/form-data` with statement ID. Never stored in browser state after submission.

`components/upload/ProcessingState.tsx` — animated indicator while processing. Polls `GET /api/statements/[id]` every 2 seconds. Shows `statement.status`: processing → extracted → complete | failed.

`components/upload/SuccessState.tsx` — plays on `status: complete`. Small celebratory animation. Confirms "Statement processed — password discarded." Triggers account creation prompt if user is still anonymous.

`components/upload/ErrorState.tsx` — friendly message for: wrong password, unreadable PDF, Claude timeout. Suggests what to try next.

### Detailed Spending Breakdown
Implements `prd.md > Detailed Spending Breakdown`.

`app/breakdown/page.tsx` — fetches transactions via `GET /api/transactions?month=2026-04`. All filtering and grouping happens in the component, not the database, for the current month. For cross-month queries, filters are passed as query params to the API.

`components/breakdown/BreakdownTabs.tsx` — tab switcher. Four views:

`components/breakdown/CategoryView.tsx` — transactions grouped by `user_category ?? claude_category`. Sorted by total spend descending.

`components/breakdown/AccountView.tsx` — transactions grouped by `account_last4 + bank_name`.

`components/breakdown/TypeView.tsx` — transactions grouped by `type`: income / expenses / transfers. Internal transfers excluded from expense totals, surfaced separately.

`components/breakdown/TimeView.tsx` — transactions grouped by calendar week (Monday–Sunday). Incomplete weeks at month start/end shown as-is with actual days covered ("Apr 1–6").

`components/transactions/TransactionRow.tsx` — single transaction display. Foreign currency shows: `17 SGD · 50 MYR`. If `exchange_rate_source = "bank"`: shows "Bank rate applied." If `"estimated"`: shows "Estimated — converted at rate as of [date]. Source: open exchange rates."

### Retention
Implements `prd.md > Retention & Habit Loop`.

`components/retention/StreakCounter.tsx` — reads `check_ins` table for current user, calculates consecutive months, displays "3 months in a row."

`components/retention/CheckInAnimation.tsx` — triggered when user uploads a statement for a new month. Small animation + "3 months in a row — your picture is getting clearer." Surfaces what unlocked (e.g. "You can now see 3-month trends").

### Settings
Implements `prd.md > Navigation & Settings`.

`app/settings/page.tsx` — sections:
- Account details (email, change password via Supabase auth)
- Notification preferences (check-in reminder day selector: 1st–28th of month)
- Theme (light / dark — updates `users.theme`, applies Tailwind dark mode class to root)
- Optional profile (age bracket, gender, analytics consent — clearly framed as optional, for future benchmarking)
- Privacy & security statement (what data is stored, what is never stored)
- Version number (hardcoded constant)
- Export: CSV button → `GET /api/export/csv`, PDF button → `GET /api/export/pdf`
- **Delete account** — prominent red button, confirmation dialog ("This permanently deletes all your transactions, statements, reports, and account. This cannot be undone."), triggers full cascade delete.

### Upload History
Implements `prd.md > Navigation & Settings` (Upload History page).

`app/history/page.tsx` — list of all statements uploaded by this user. Each row shows: bank name, account last-4, period covered (e.g. "Mar 1–31 2026"), statement type (credit card / bank account), upload date, status.

---

## Backend (API Routes)

### Statement Upload
`app/api/statements/upload/route.ts` — `POST`

Implements `prd.md > Statement Upload & Processing`.

Flow:
1. Receive `multipart/form-data`: `file` (PDF bytes) and optionally `password` + `statement_id` (for password retry).
2. Compute SHA-256 hash of file bytes. Check `statements` table for existing row with same `file_hash` for this user → if found, return `{duplicate: true}`.
3. Check `statements` table for existing row with same `bank_name + account_last4 + month_year` → if found, return `{period_duplicate: true, existing_id}`.
4. Insert `statements` row with `status: "processing"`. Return `{statement_id}` immediately.
5. Run extraction pipeline (steps 6–10) asynchronously. Frontend polls for status.
6. Call `lib/pdf/parse.ts` to extract text. If password-protected and no password provided → update statement `status: "needs_password"`, return.
7. If password provided → decrypt and extract text. Password not stored anywhere after this step.
8. Call `lib/claude/extract.ts` → structured transactions JSON.
9. Call `lib/utils/transfers.ts` → detect and flag internal transfers.
10. Call `lib/claude/narrative.ts` → narrative, observations, nudges (passes prior month summary if available).
11. Insert transactions into `transactions` table. Insert report into `monthly_reports`. Update statement `status: "complete"`.

`app/api/statements/[id]/route.ts` — `GET`

Returns `{status, bank_name, month_year}` for polling. Called every 2 seconds by `ProcessingState.tsx`.

### Transactions
`app/api/transactions/route.ts` — `GET`

Query params: `month`, `category`, `type`, `account_last4`. All params optional. Translates to Supabase query:

```
supabase
  .from("transactions")
  .select("*")
  .eq("user_id", user.id)
  .eq("month_year", month)          // if provided
  .eq("user_category", category)    // if provided
  .eq("type", type)                 // if provided
  .eq("account_last4", account)     // if provided
  .order("date", { ascending: false })
```

Returns array of transaction objects.

### Reports
`app/api/reports/route.ts` — `GET`

Query params: `month`. Returns `monthly_reports` row for this user and month. If no row exists (no uploads for that month), returns `{empty: true}`.

### Exchange Rates
`app/api/exchange-rates/route.ts` — `GET`

Checks `exchange_rates` table for rates updated within the last 7 days. If fresh, returns cached rates. If stale or missing, fetches from [Open Exchange Rates](https://openexchangerates.org/api/latest.json) (free tier, no key required for latest rates), stores in `exchange_rates` table with `updated_at`, returns fresh rates.

### Export
`app/api/export/csv/route.ts` — `GET`

Fetches all transactions for the user. Formats as CSV: `date,merchant,amount,currency,sgd_amount,category,account,type`. Streams response with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="finclarity-export.csv"`.

`app/api/export/pdf/route.ts` — `GET`

Uses `@react-pdf/renderer` to generate a formatted PDF of the monthly report. Includes: narrative, summary cards, top categories, observations. Streams as `application/pdf`. Note: this is the most complex export — if time-constrained during build, CSV export ships first.

### User
`app/user/route.ts` — `GET` / `PATCH`

`GET`: returns user profile (email, age_bracket, gender, analytics_consent, theme, check_in_day, has_completed_onboarding).

`PATCH`: updates user profile fields. Called from settings page.

### Cron — Email Reminders
`app/api/cron/reminders/route.ts` — `GET`

Configured as a Vercel Cron Job in `vercel.json` to run daily at 09:00 SGT (01:00 UTC).

```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "0 1 * * *"
  }]
}
```

On each run:
1. Query `users` where `check_in_day = today's day of month` AND `email IS NOT NULL`.
2. For each matched user, send reminder email via Resend API.
3. Email subject: "Time to check in on your finances, [first name]"
4. Email body: link to dashboard, current streak, encouragement.

---

## Core Library (`lib/`)

### PDF Parsing
`lib/pdf/parse.ts`

Uses `pdfjs-dist` (Node.js build). Exports:

```typescript
parsePDF(fileBytes: Buffer, password?: string): Promise<{
  text: string,
  needsPassword: boolean,
  pageCount: number,
  dateRange: { start: Date, end: Date } | null
}>
```

- Attempts to load PDF. If `PasswordException` thrown and no password provided → returns `{needsPassword: true}`.
- If password provided → passes to `pdfjs` loader.
- Extracts text from all pages, preserves table structure as whitespace-delimited rows.
- Attempts to detect date range from header/footer text (regex: `DD/MM/YYYY` or `Month YYYY` patterns). Returns `null` if not found.
- Never logs or stores `password` parameter.

Docs: [pdfjs-dist on npm](https://www.npmjs.com/package/pdfjs-dist)

### Claude — Transaction Extraction
`lib/claude/extract.ts`

Uses `claude-haiku-4-5`. Exports:

```typescript
extractTransactions(rawText: string): Promise<{
  transactions: Transaction[],
  bankName: string,
  statementType: "credit_card" | "bank_account",
  accountLast4: string,
  dateRange: { start: string, end: string },
  detectedCurrency: string
}>
```

Prompt (abbreviated):

```
You are a financial data extraction assistant.

Given the raw text of a Singapore bank statement, extract all transactions.

Return a JSON object with:
- bankName: detected bank name (e.g. "DBS", "OCBC", "Maybank")
- statementType: "credit_card" or "bank_account"
- accountLast4: last 4 digits of account or card number
- dateRange: { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
- transactions: array of:
  {
    date: "YYYY-MM-DD",
    merchant: string,
    amount: number,
    currency: string,         // e.g. "SGD", "MYR", "USD"
    originalAmount: number,   // same as amount if currency is SGD
    bankRate: number | null,  // bank's applied exchange rate, if stated
    bankRateSGD: number | null, // exact SGD charged, if stated
    category: string,         // your best guess at category
    type: "income" | "expense" | "transfer",
    accountLast4: string
  }

IMPORTANT:
- Extract transaction rows ONLY.
- Do NOT extract: account holder name, full account number, address, NRIC, date of birth, phone number.
- If a field is not present in the statement, return null for that field.
- Return valid JSON only. No explanation text.
```

Docs: [Anthropic Messages API](https://docs.anthropic.com/en/api/messages)

### Claude — Narrative & Observations
`lib/claude/narrative.ts`

Uses `claude-haiku-4-5`. Exports:

```typescript
generateReport(params: {
  currentMonth: TransactionSummary,
  priorMonth: TransactionSummary | null,
  last3Months: TransactionSummary[] | null
}): Promise<{
  narrative: string,
  summaryCards: SummaryCards,
  observations: Observation[],
  nudges: Nudge[]
}>
```

Prompt principles (abbreviated):
- Lead with wins and momentum. If month was difficult, acknowledge truth first, then pivot to actionable.
- Warm, conversational language — like a friend, not a system.
- Observations: look for recurring charges that appeared, disappeared, or changed amount across months.
- Nudges: predict next month based on recurring patterns.
- Non-paternalistic. Observations, not instructions.
- Return valid JSON matching the `monthly_reports` schema.

### Internal Transfer Detection
`lib/utils/transfers.ts`

Called after extraction, before narrative generation.

```typescript
detectTransfers(transactions: Transaction[]): Transaction[]
```

Logic:
1. Group transactions by `type: "transfer"` or where merchant name matches common transfer keywords ("FAST Transfer", "PayNow", "GIRO", "Own Account").
2. For each candidate debit in account A, look for a matching credit in account B within ±3 days and ±2% amount.
3. If match found: set `type: "internal_transfer"` on both records, set `transferPairId` linking them.
4. Internal transfers excluded from spending totals in all views. Surfaced separately under "Savings & Transfers."

### Exchange Rates
`lib/exchange-rates/fetch.ts`

```typescript
getExchangeRates(): Promise<Record<string, number>>
// e.g. { MYR: 3.12, USD: 0.74, ... } relative to SGD base
```

Checks Supabase `exchange_rates` table. If `updated_at` is within 7 days, returns cached. Otherwise fetches from Open Exchange Rates free endpoint, converts to SGD base, stores with `updated_at = now()`.

### Currency Formatting
`lib/utils/currency.ts`

```typescript
formatTransaction(tx: Transaction): {
  primaryDisplay: string,   // "17.00 SGD"
  secondaryDisplay: string | null, // "50.00 MYR" (if foreign)
  rateAttribution: string | null   // "Bank rate applied" | "Estimated — converted at rate as of Apr 14 2026"
}
```

### Date Utilities
`lib/utils/dates.ts`

```typescript
isCompleteMonth(dateRange: { start: Date, end: Date }): boolean
// Returns true if range spans ≥28 days within a single calendar month

getCalendarWeeks(month: string): Week[]
// Returns Mon–Sun week boundaries for the month
// Incomplete weeks at start/end show actual days covered

checkPeriodDuplicate(existing: Statement[], incoming: { bankName, accountLast4, monthYear }): boolean
```

### Streak Calculation
`lib/utils/streak.ts`

```typescript
calculateStreak(checkIns: CheckIn[]): number
// Counts consecutive months working backwards from most recent check-in
// A "check-in" = uploading a statement for that month
// Streak resets if a month is skipped. No decay mechanics.
```

---

## Data Model

### `users`
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
email                   text UNIQUE          -- null for anonymous users
created_at              timestamptz DEFAULT now()
has_completed_onboarding boolean DEFAULT false
theme                   text DEFAULT 'light' -- 'light' | 'dark'
check_in_day            integer              -- 1–28, user's preferred reminder day
age_bracket             text                 -- '18-24' | '25-34' | '35-44' | '45-54' | '55+' | null
gender                  text                 -- 'female' | 'male' | 'non-binary' | 'prefer_not_to_say' | null
analytics_consent       boolean DEFAULT false
```

### `statements`
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid REFERENCES users(id) ON DELETE CASCADE
file_hash               text NOT NULL        -- SHA-256 of PDF bytes; unique per user for duplicate detection
bank_name               text                 -- 'DBS' | 'OCBC' | 'UOB' | 'Maybank' etc.
bank_country            text DEFAULT 'SG'
statement_type          text                 -- 'credit_card' | 'bank_account'
account_last4           text                 -- last 4 digits
month_year              text                 -- 'YYYY-MM' e.g. '2026-04'
period_start            date
period_end              date
is_complete_month       boolean              -- true if period spans ≥28 days in one calendar month
status                  text DEFAULT 'processing' -- 'processing' | 'needs_password' | 'extracted' | 'complete' | 'failed'
extraction_prompt_version text               -- version tag for the Claude extraction prompt used
uploaded_at             timestamptz DEFAULT now()
```

### `transactions`
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid REFERENCES users(id) ON DELETE CASCADE
statement_id            uuid REFERENCES statements(id) ON DELETE CASCADE
date                    date NOT NULL
merchant                text NOT NULL
amount                  numeric(12,2) NOT NULL
currency                text NOT NULL        -- ISO 4217: 'SGD' | 'MYR' | 'USD' etc.
sgd_amount              numeric(12,2)        -- authoritative SGD amount for summaries
original_amount         numeric(12,2)        -- amount in original currency
bank_rate               numeric(10,6)        -- bank's applied rate, null if not stated
bank_rate_sgd           numeric(12,2)        -- exact SGD charged by bank, null if not stated
estimated_rate_sgd      numeric(12,2)        -- our weekly rate conversion, null if SGD
exchange_rate_source    text                 -- 'bank' | 'estimated' | null (if SGD)
claude_category         text                 -- Claude's best guess
user_category           text                 -- user's override, null if not corrected
type                    text                 -- 'income' | 'expense' | 'transfer' | 'internal_transfer'
transfer_pair_id        uuid                 -- links matched transfer pairs
account_last4           text
bank_name               text
month_year              text                 -- 'YYYY-MM' for fast filtering
```

### `monthly_reports`
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid REFERENCES users(id) ON DELETE CASCADE
month_year              text NOT NULL        -- 'YYYY-MM'
narrative_text          text                 -- Claude-written 2-3 sentence summary
summary_cards_json      jsonb                -- {spent, saved, top_category, watchout}
observations_json       jsonb                -- [{type, message, merchant, amount_change}]
nudges_json             jsonb                -- [{message, pattern, predicted_date}]
generated_at            timestamptz DEFAULT now()
prompt_version          text                 -- version of narrative prompt used
UNIQUE(user_id, month_year)
```

### `check_ins`
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid REFERENCES users(id) ON DELETE CASCADE
month_year              text NOT NULL        -- 'YYYY-MM'
checked_in_at           timestamptz DEFAULT now()
UNIQUE(user_id, month_year)
```

### `exchange_rates`
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
base_currency           text DEFAULT 'SGD'
rates_json              jsonb                -- {MYR: 3.12, USD: 0.74, ...}
updated_at              timestamptz DEFAULT now()
```

---

## File Structure

```
finclarity/
├── app/                                   # Next.js App Router
│   ├── layout.tsx                         # Root layout: sidebar, fonts, Tailwind dark mode
│   ├── page.tsx                           # Entry: redirects to /demo (new) or /dashboard (returning)
│   ├── demo/
│   │   └── page.tsx                       # Demo dashboard — hardcoded sample data, no auth required
│   ├── dashboard/
│   │   └── page.tsx                       # Real dashboard — requires anonymous or signed-in session
│   ├── breakdown/
│   │   └── page.tsx                       # Detailed spending — 4 views
│   ├── history/
│   │   └── page.tsx                       # Upload history list
│   ├── settings/
│   │   └── page.tsx                       # Settings: account, preferences, export, delete
│   └── api/
│       ├── statements/
│       │   ├── upload/
│       │   │   └── route.ts               # POST: receive PDF, run extraction pipeline
│       │   └── [id]/
│       │       └── route.ts               # GET: return statement status for polling
│       ├── transactions/
│       │   └── route.ts                   # GET: fetch with optional filter query params
│       ├── reports/
│       │   └── route.ts                   # GET: fetch monthly_reports row
│       ├── exchange-rates/
│       │   └── route.ts                   # GET: return cached rates, refresh if stale
│       ├── export/
│       │   ├── csv/
│       │   │   └── route.ts               # GET: stream transactions as CSV
│       │   └── pdf/
│       │       └── route.ts               # GET: generate and stream PDF report
│       ├── user/
│       │   └── route.ts                   # GET/PATCH: read and update user profile
│       └── cron/
│           └── reminders/
│               └── route.ts               # GET: daily cron — send check-in reminder emails
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                    # Collapsible nav: Dashboard, Upload, History, Settings
│   │   └── TopBar.tsx                     # Streak counter, user status
│   ├── dashboard/
│   │   ├── NarrativeSummary.tsx           # Claude-written 2-3 sentence summary
│   │   ├── SummaryCards.tsx               # 4 cards: Spent, Saved, Top Category, Watchout
│   │   ├── ObservationsPanel.tsx          # Collapsible retrospective flags
│   │   └── NudgesSection.tsx              # Forward-looking nudges section
│   ├── upload/
│   │   ├── UploadZone.tsx                 # Drag-and-drop PDF picker
│   │   ├── PasswordPrompt.tsx             # Inline password entry for protected PDFs
│   │   ├── ProcessingState.tsx            # Animated loading + polling
│   │   ├── SuccessState.tsx               # Celebration animation + password discarded msg
│   │   └── ErrorState.tsx                 # Friendly error messages with next steps
│   ├── breakdown/
│   │   ├── BreakdownTabs.tsx              # Tab switcher for 4 views
│   │   ├── CategoryView.tsx               # Grouped by category, sorted by spend
│   │   ├── AccountView.tsx                # Grouped by bank + account last-4
│   │   ├── TypeView.tsx                   # Income / expenses / transfers
│   │   └── TimeView.tsx                   # Calendar week grouping (Mon–Sun)
│   ├── transactions/
│   │   └── TransactionRow.tsx             # Single transaction: amount, currency, rate attribution
│   ├── retention/
│   │   ├── StreakCounter.tsx              # "3 months in a row"
│   │   └── CheckInAnimation.tsx           # Post check-in celebration + what unlocked
│   └── ui/
│       ├── Card.tsx                       # Generic card container
│       ├── CollapsiblePanel.tsx           # Expand/collapse wrapper
│       ├── Tooltip.tsx                    # First-run overlay tooltips
│       ├── MonthSelector.tsx              # Month picker for dashboard
│       └── ConfirmDialog.tsx              # Used for delete account confirmation
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # Browser-side Supabase client (singleton)
│   │   └── server.ts                      # Server-side Supabase client (for API routes)
│   ├── claude/
│   │   ├── extract.ts                     # Extraction prompt + haiku call → Transaction[]
│   │   └── narrative.ts                   # Narrative prompt + haiku call → monthly_reports shape
│   ├── pdf/
│   │   └── parse.ts                       # pdfjs-dist: password detection, text extraction
│   ├── exchange-rates/
│   │   └── fetch.ts                       # Fetch open rates, cache in Supabase, return SGD-based map
│   └── utils/
│       ├── transfers.ts                   # Internal transfer detection + pair matching
│       ├── currency.ts                    # Format SGD · MYR display, pick bank vs estimated rate
│       ├── dates.ts                       # Calendar weeks, statement completeness, period duplicate check
│       └── streak.ts                      # Calculate consecutive months from check_ins log
│
├── types/
│   └── index.ts                           # TypeScript: User, Statement, Transaction, MonthlyReport, CheckIn
│
├── supabase/
│   └── schema.sql                         # Full database schema — run once in Supabase SQL editor
│
├── middleware.ts                          # Supabase auth: create anonymous session on first visit, protect routes
├── vercel.json                            # Cron job config for /api/cron/reminders
├── .env.local                             # API keys (never committed)
├── .env.example                           # Template for required env vars
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── docs/                                  # Hackathon artifacts
    ├── learner-profile.md
    ├── scope.md
    ├── prd.md
    ├── spec.md                            # ← this file
    └── checklist.md                       # generated by /checklist
```

---

## Key Technical Decisions

**1. Claude reads PDFs via text extraction, not the Files API**
Decision: Use `pdfjs-dist` to extract text from PDFs, then send text to Claude — not the raw PDF binary.
Why: The Files API doesn't support password-protected PDFs. `pdfjs-dist` handles decryption in memory and extracts structured text. Claude then reads clean text, which is sufficient for transaction extraction from SG bank statements.
Tradeoff: Lose Claude's visual layout understanding. Acceptable because bank statement transactions are line-by-line text — layout matters less than for visually complex documents.

**2. One Claude model (claude-haiku-4-5) for everything**
Decision: Use `claude-haiku-4-5` for both extraction and narrative generation.
Why: Lowest cost tier. Jade's instruction was explicit. For a hackathon, quality difference vs. Sonnet is acceptable.
Tradeoff: Narrative language will be functional but less warm and nuanced than Sonnet. If narrative quality becomes a concern post-hackathon, swap `model` in `lib/claude/narrative.ts` — one line change.

**3. Anonymous auth from first visit**
Decision: Supabase creates an anonymous user session on first page load, before any interaction.
Why: All user data (transactions, reports) links to a `user_id` from the start. No data migration needed when user signs up — Supabase upgrades the anonymous session to a real account, same ID.
Tradeoff: Anonymous sessions accumulate in the database. Add a cleanup job in v2 to delete anonymous users with no uploads after 30 days.

**4. Frontend-first filtering with queryable API**
Decision: For the current month's transactions, filtering and grouping happens in React components. The API layer is designed with query params so database-side filtering can be added later without touching the frontend.
Why: At hackathon scale (hundreds of transactions), JavaScript filtering is fast. Premature database optimisation would add complexity.
Tradeoff: If a user accumulates many months of data and switches to cross-month views, performance may degrade. Mitigated by the query param API design — move filtering to Supabase queries later without changing the component layer.

---

## Dependencies & External Services

| Service | Purpose | Pricing | Docs |
|---|---|---|---|
| [Supabase](https://supabase.com) | Database + auth | Free: 500MB DB, 50K users. Projects pause after 7 days inactivity on free plan. | [Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) |
| [Vercel](https://vercel.com) | Hosting + cron jobs | Free (Hobby). Non-commercial use. | [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs) |
| [Anthropic API](https://console.anthropic.com) | Transaction extraction + narrative | Pay per token. `claude-haiku-4-5` is lowest tier. Set a monthly spend limit in console. | [Messages API](https://docs.anthropic.com/en/api/messages) |
| [Resend](https://resend.com) | Email reminders | Free: 100 emails/day, 3,000/month. | [API Docs](https://resend.com/docs/api-reference/emails/send-email) |
| [Open Exchange Rates](https://openexchangerates.org) | Weekly exchange rates | Free tier available (no API key required for latest rates endpoint). | [API](https://openexchangerates.org/api/latest.json) |
| pdfjs-dist | PDF parsing | Free, open source (Apache 2.0). | [npm](https://www.npmjs.com/package/pdfjs-dist) |
| @react-pdf/renderer | PDF export generation | Free, open source. | [Docs](https://react-pdf.org) |

**Environment variables required:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
RESEND_API_KEY
```

---

## Open Issues

**1. Password-protected PDF decryption accuracy**
`pdfjs-dist` handles most encrypted PDFs, but some SG bank statement encryption schemes may not be supported. Risk: user enters correct password but extraction fails. Mitigation: clear error message with suggestion to try downloading an unprotected copy from the bank's app. Test against real DBS, OCBC, UOB statements before the build is called done.

**2. PDF export complexity**
`@react-pdf/renderer` requires building a React component tree that renders to PDF — this is more work than CSV export. If time-constrained during `/build`, ship CSV export first and defer PDF to post-hackathon. Acceptance criterion in `prd.md` includes both — flag this trade-off in the submission notes if necessary.

**3. Recurring charge detection across months**
The narrative prompt asks Claude to identify recurring charges by passing 3 months of transaction summaries. This works well for obvious patterns (same merchant, similar amount, similar date). Edge case: first-time users with only one month of data see no recurring charge detection — handled by showing observations only when ≥2 months are available.

**4. Anonymous session cleanup**
Supabase anonymous users accumulate over time. Users who land, never upload, never sign up create orphan rows. No cleanup mechanism exists in v1. Add a Supabase Edge Function or pg_cron job in v2 to delete anonymous users with `has_completed_onboarding = false` and no associated statements after 30 days.

**5. Exchange rate disclaimer copy**
Open question from `prd.md` resolved: show "Estimated — converted at rate as of [date]" on all non-bank-rate transactions. Add a one-line note on the breakdown page: "Conversions are estimates. Your bank may have applied a different rate. Where your statement states the exact SGD amount charged, that figure is used instead."
