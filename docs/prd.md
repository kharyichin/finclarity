# FinClarity — Product Requirements

## Problem Statement

Singapore residents managing money across multiple banks, digital wallets, and currencies have no unified, accessible view of their finances — existing tools either require live API integration (with legal and regulatory complexity) or provide raw data with no meaningful insight. Most people still track via spreadsheets or not at all. FinClarity fills this gap by letting users upload their existing bank statements to get a clear, narrative monthly picture of where their money went, what changed, and what to watch next — no integration required, no financial advice given.

---

## User Stories

### Epic: First-Run Experience

- As a first-time visitor, I want to immediately see what the app does before committing to anything, so that I understand the value before signing up.
  - [ ] App opens to a sample dashboard populated with realistic fake data
  - [ ] 2–3 guided tooltips are layered over key dashboard sections explaining what each area shows
  - [ ] A prominent CTA on the dashboard encourages uploading a first real statement
  - [ ] The sample data is clearly labelled as demo data — not the user's real finances

- As a new user who just successfully uploaded my first statement, I want to be prompted to save my progress, so that I don't lose my data.
  - [ ] Account creation is prompted after first successful upload, not before
  - [ ] The prompt is framed as "save your progress," not a signup gate
  - [ ] User can continue without creating an account (session-based), but is reminded their data won't persist

---

### Epic: Statement Upload & Processing

- As a user, I want to upload my bank statement and have it processed automatically, so that I don't have to manually enter any transactions.
  - [ ] User can upload a PDF bank statement from the dashboard or sidebar
  - [ ] App attempts to open the PDF immediately; password prompt only appears if the file is password-protected
  - [ ] User enters their statement password inline; password is used transiently in memory only and never stored
  - [ ] An animated loading state is shown while the PDF is being processed (similar to a thinking indicator)
  - [ ] On success, a small celebratory animation confirms the statement was processed and the password discarded
  - [ ] On failure (unreadable file, wrong password), a clear, friendly error message explains what went wrong and what to try next

- As a user with multiple bank accounts, I want to upload statements from different banks for the same month, so that I get a unified view of all my money.
  - [ ] Multiple statements for the same month can be uploaded and stitched into a single unified view
  - [ ] Internal transfers are auto-detected by matching amounts across accounts within a short time window
  - [ ] Detected internal transfers are excluded from spending totals and surfaced separately under "Savings & Transfers"
  - [ ] If uploaded statements have mismatched date ranges, the app trims analysis to the overlapping window and flags what was excluded: "Analysis covers [date range]. Transactions outside this window were not included."

- As a user uploading a statement mid-month, I want the app to handle incomplete data gracefully, so that I'm not misled by partial analysis.
  - [ ] Watchdog retrospective analysis (missing recurring charges) only runs on complete month statements
  - [ ] The app detects statement completeness before running retrospective flags
  - [ ] If a statement is incomplete, the app shows observations only for the period covered with a clear date range label

---

### Epic: Dashboard & Monthly Report

- As a user who has uploaded at least one statement, I want to see a clear summary of my month at a glance, so that I understand my finances without digging.
  - [ ] Dashboard opens with a narrative summary: a few data-driven sentences leading with wins and momentum (e.g. "You spent less on food this month")
  - [ ] When a month was genuinely difficult, the narrative acknowledges the truth first, then pivots to what's actionable — no false positivity, no judgment
  - [ ] 4 summary cards below the narrative: Total Spent, Total Saved, Biggest Spending Category, One Forward-Looking Watchout
  - [ ] A collapsible panel below the cards surfaces Monthly Observations (retrospective flags)
  - [ ] A separate "What to Watch For Next Month" section shows forward-looking nudges based on detected patterns

- As a user with only one month of data, I want the app to still be useful, so that I don't feel like I uploaded for nothing.
  - [ ] App shows plain-language spending observations for the single month ("You spent most on food and transport")
  - [ ] Month-over-month comparison section is replaced with a prompt: "Upload a past statement to unlock comparisons"
  - [ ] No empty states or broken UI elements appear where comparison data would normally show

- As a user with multiple months of data, I want to see how my spending changed over time, so that I can spot patterns and trends.
  - [ ] Month-over-month comparison shows what changed and includes a plain-language explanation of why
  - [ ] Forward-looking nudges are informed by multi-month patterns, not just the current month

---

### Epic: Detailed Spending Breakdown

- As a user, I want to explore my transactions in different ways, so that I can understand my money from multiple angles.
  - [ ] Four views available: By Category, By Account, By Transaction Type (income / expenses / transfers), By Time
  - [ ] Time view uses calendar weeks (Monday–Sunday); incomplete weeks at start or end of month display as-is with actual days covered
  - [ ] Each view is accessible via tabs or toggles within the detailed spending section
  - [ ] Transactions in foreign currencies show both the SGD equivalent and the original foreign currency amount inline (e.g. "17 SGD · 50 MYR")
  - [ ] A note on all converted transactions states: "Converted at exchange rate as of [date]. Source: Google Finance (updated weekly)."
  - [ ] Transaction type correctly classifies income, expenses, and transfers — internal transfers excluded from spending totals

---

### Epic: Monthly Observations & Forward-Looking Nudges

- As a user, I want to be alerted to unusual patterns in my spending, so that I don't miss things that matter.
  - [ ] Monthly Observations (retrospective) appear in the collapsible panel on the dashboard and inline within the relevant spending section
  - [ ] Observations include: recurring charges that increased, charges that appeared or disappeared vs. prior months
  - [ ] Recurring charge detection uses both merchant name pattern-matching and similar amount/date proximity
  - [ ] Language is warm and conversational — like a friend giving a nudge, not a system issuing an alert (e.g. "Heads up — your streaming subscription went up by $2 this month")

- As a user, I want to see what to watch for next month, so that I can stay ahead of my finances.
  - [ ] "What to Watch For Next Month" section shows 1–2 forward-looking nudges based on detected recurring patterns
  - [ ] Nudges are predictive, not retrospective: "Based on your history, your phone bill usually hits around the 15th"
  - [ ] Language is non-paternalistic — observations, not instructions

---

### Epic: Multi-Currency Support

- As a user who spends in multiple currencies, I want to see all my spending in SGD, so that I can compare across accounts and categories.
  - [ ] SGD is the default display currency for all summaries, cards, and totals
  - [ ] All foreign currency transactions show SGD equivalent + original currency amount inline
  - [ ] A note on converted transactions clearly states this is a conversion estimate, not the actual SGD charge
  - [ ] Exchange rates sourced from Google Finance, updated weekly, with "as of [date]" displayed on converted transactions
  - [ ] Original currency always remains visible — never hidden behind the conversion

---

### Epic: Retention & Habit Loop

- As a returning user, I want to be reminded to check in each month, so that I build a consistent tracking habit.
  - [ ] User can select their preferred monthly check-in day (e.g. "remind me on the 1st of every month")
  - [ ] Reminder is sent on the selected day
  - [ ] Check-in reminders are monthly — not weekly or daily, which would show too little change and feel like nagging

- As a user who checks in consistently, I want to feel my habit being acknowledged, so that I stay motivated to continue.
  - [ ] A streak counter displays how many consecutive months the user has checked in
  - [ ] Streak is based purely on check-in behaviour — not on spending amount or savings level
  - [ ] On completing a monthly check-in, a small animation + message acknowledges the effort: e.g. "3 months in a row — your picture is getting clearer"
  - [ ] Message also surfaces what unlocked with this check-in (e.g. "You can now see 3-month spending trends")
  - [ ] Streaks reset if a month is missed; no decay mechanic or penalty language

---

### Epic: Navigation & Settings

- As a user, I want to move easily between sections of the app, so that I can find what I need without hunting.
  - [ ] Collapsible sidebar contains: Dashboard, Upload History, Settings, and Upload New Statement
  - [ ] Upload New Statement also appears as a prominent CTA on the dashboard
  - [ ] Sidebar is easily togglable (open/close) without disrupting the current view

- As a user, I want to manage my account and preferences, so that the app works the way I want it to.
  - [ ] Settings page includes: Account details, Notification preferences (check-in reminder day), Theme, Privacy & Security statement, Version number, Export function
  - [ ] Export function offers CSV (transaction data) and PDF (monthly report)
  - [ ] Upload History page shows all previously uploaded statements with date, account, and period covered

---

## What We're Building

Everything below must be complete and verifiable at the end of 3–4 hours:

1. **Statement upload flow** — PDF upload (including password-protected files), animated processing state, success/error states, password discarded after extraction
2. **Transaction extraction** — date, merchant, amount, category, currency, source account last-4 stored; raw PDF and password never persisted
3. **Unified multi-account view** — multiple statements per month stitched together; internal transfers auto-detected and excluded from spending totals; date range mismatch flagged
4. **Dashboard** — narrative summary (data-driven, 2 states: demo and real), 4 summary cards, collapsible observations panel, forward-looking nudges section
5. **Detailed spending breakdown** — 4 views (by category, account, transaction type, weekly time); incomplete calendar weeks handled gracefully
6. **Multi-currency display** — SGD default, original currency shown inline, exchange rate attribution (Google Finance, weekly, as-of date)
7. **Monthly Observations** — retrospective flags on complete statements only; recurring charge detection via merchant + amount/date pattern matching; warm conversational language
8. **Forward-looking nudges** — 1–2 predictive observations for next month based on detected recurring patterns
9. **Retention mechanic** — monthly streak counter (habit-based, not wealth-based), user-selected reminder day, post-check-in celebration animation + message
10. **Navigation** — collapsible sidebar (Dashboard, Upload History, Settings, Upload CTA), dashboard upload CTA
11. **Settings page** — account details, notification preferences, theme, privacy statement, version number, CSV + PDF export
12. **Upload History page** — list of uploaded statements with date, account, period covered
13. **First-run experience** — sample dashboard with fake data, 2–3 tooltips, clear demo labelling, post-upload account creation prompt

---

## What We'd Add With More Time

- **Merchant drill-down** — tap a category to see individual merchants; tap a merchant to see all transactions from them across months
- **Wrapped-style PNG export** — a shareable, visually designed summary card (Spotify Wrapped aesthetic) showing the user's financial year in review
- **Email / push notification reminders** — time-sensitive watchdog alerts (e.g. loan payment reminders); push notifications when app goes native mobile
- **Social benchmarking** — anonymous comparison to users in similar demographics ("people like you spent X on food")
- **Investment & brokerage account sync** — net worth at a glance; Phase 2 once core insight engine is proven
- **Device keychain for statement passwords** — optional password save for repeat uploaders
- **In-app streak badges** — milestone celebrations at 3, 6, 12 months of consecutive check-ins

---

## Non-Goals

1. **Live bank API / Plaid integration** — legal complexity, MAS licensing risk; statement upload is the v1 mechanism
2. **Investment recommendations** — requires a regulated financial advice licence under MAS rules
3. **Manual transaction input** — diminishes the core value of automated extraction; edge case users can contact their bank
4. **Crypto wallet or tangible asset tracking** — data format complexity and different data problem; out of scope
5. **Social / comparison features** — not core to v1; benchmarking is a v2 feature once user base exists
6. **Storing statement passwords** — SG bank statement passwords are typically NRIC/DOB; storing them would be a security and PDPA risk

---

## Open Questions

- **Exchange rate precision** — Google Finance rates are indicative, not interbank. Should the app include a disclaimer that converted amounts may differ from what the user's bank charged? *(Needs answering before /spec — affects copy and data model)*
- **Statement completeness detection** — How does the app determine a statement is "complete" (covers a full month)? By date range in the PDF header, by number of days covered, or by asking the user to confirm? *(Needs answering before /spec)*
- **Categorisation fallback accuracy** — MCC codes are available for credit card transactions; debit and bank transfers rely on merchant name pattern matching. What's the acceptable accuracy threshold before a transaction gets labelled "Uncategorised"? *(Can wait until /build)*
- **Claude API model selection** — Which Claude model tier powers the narrative generation and watchdog reasoning? Tradeoff between cost-per-analysis and output quality. *(Addressed in /spec)*
- **Anonymous vs. authenticated sessions** — If a user skips account creation, how long does their session data persist? Browser session only, or longer? *(Needs answering before /spec)*
