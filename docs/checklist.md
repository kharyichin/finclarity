# FinClarity — Build Checklist

## Build Preferences

- **Build mode:** Step-by-step
- **Comprehension checks:** Yes — after each item, a short question to confirm the piece makes sense before moving on
- **Git:** Commit after each item with message: `Complete step N: [title]`
- **Verification:** Yes — run the app after each item and confirm what you see before moving to the next
- **Check-in cadence:** Balanced — PM-relevant explanations of what was just built and how it connects, without going deep into code detail

---

## Checklist

- [x] **1. Database schema**
  Spec ref: `spec.md > Data Model`
  What to build: Write the full SQL schema for all 6 tables (`users`, `statements`, `transactions`, `monthly_reports`, `check_ins`, `exchange_rates`) in `supabase/schema.sql`. Run it against your Supabase project via the SQL editor. Include all columns, types, constraints, foreign keys, cascade deletes, and unique indexes as specified.
  Acceptance: All 6 tables exist in Supabase with the correct columns. Foreign key relationships are in place. Cascade deletes are configured so deleting a user removes all their data.
  Verify: Open Supabase → Table Editor and confirm all 6 tables appear with the right columns. Click into `transactions` and confirm `user_id` has a foreign key link to `users`.

- [x] **2. Project setup**
  Spec ref: `spec.md > Stack`, `spec.md > Runtime & Deployment`, `spec.md > File Structure`
  What to build: Scaffold the Next.js 15 project with TypeScript and Tailwind CSS v4 using `create-next-app`. Install dependencies: `pdfjs-dist`, `@anthropic-ai/sdk`, `@supabase/supabase-js`, `@supabase/ssr`, `resend`. Create `types/index.ts` with TypeScript types for User, Statement, Transaction, MonthlyReport, CheckIn. Create `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (API routes). Create `.env.local` with the four required environment variables and `.env.example` as a safe template. Set up `middleware.ts` to create an anonymous Supabase session on first visit. Create the full folder structure from `spec.md > File Structure` — empty files are fine at this stage.
  Acceptance: `npm run dev` starts without errors. Visiting `localhost:3000` loads a page (even if blank). Supabase environment variables are connected — no console errors about missing keys.
  Verify: Run `npm run dev` and open `localhost:3000`. Open the browser console — confirm no red errors. Open Supabase → Authentication → Users and confirm an anonymous user appears after the first page load.

- [x] **3. GitHub repository**
  Spec ref: N/A — required for Devpost submission
  What to build: Initialise a git repository in the project folder (`git init`). Create a `.gitignore` that excludes `.env.local`, `node_modules/`, and `.next/`. Create a new GitHub repository named `finclarity` (public). Add it as the remote origin. Make the first commit with all current files. Push to GitHub.
  Acceptance: GitHub repository exists at `github.com/[your-username]/finclarity`. The project files are visible. `.env.local` is NOT in the repository.
  Verify: Open your GitHub repo in the browser. Confirm the file structure matches your local project. Confirm `.env.local` does not appear in the file list.

- [ ] **4. PDF upload pipeline**
  Spec ref: `spec.md > Backend (API Routes) > Statement Upload`, `spec.md > Core Library > PDF Parsing`, `spec.md > Frontend > Upload Flow`
  What to build: Build `lib/pdf/parse.ts` — pdfjs-dist password detection and text extraction. Build `app/api/statements/upload/route.ts` — the full 10-step async pipeline: receive file, SHA-256 duplicate check, period duplicate check, insert `statements` row, extract PDF text, detect password protection, pass text to Claude, detect internal transfers, generate narrative, insert transactions and report. Build `app/api/statements/[id]/route.ts` — status polling endpoint. Build the upload UI: `components/upload/UploadZone.tsx`, `PasswordPrompt.tsx`, `ProcessingState.tsx` (polls every 2 seconds), `SuccessState.tsx`, `ErrorState.tsx`. Wire the upload modal into `app/dashboard/page.tsx`.
  Acceptance: User can drag-and-drop or select a PDF. If password-protected, password prompt appears inline. Animated loading state shows during processing. On success, celebration animation confirms "Statement processed — password discarded." Transactions appear in the `transactions` table in Supabase. A `monthly_reports` row is created.
  Verify: Upload a real bank statement PDF. Open Supabase → Table Editor → `transactions` and confirm rows were inserted with correct date, merchant, amount, currency. Open `monthly_reports` and confirm a row exists with `narrative_text` populated.

- [ ] **5. Claude extraction and narrative**
  Spec ref: `spec.md > Core Library > Claude — Transaction Extraction`, `spec.md > Core Library > Claude — Narrative & Observations`
  What to build: Build `lib/claude/extract.ts` — the extraction prompt with explicit PII exclusion instructions, the `claude-haiku-4-5` API call, and the response parser that returns structured `Transaction[]`. Build `lib/claude/narrative.ts` — the narrative prompt that accepts current month summary + optional prior month data, calls `claude-haiku-4-5`, and returns narrative text, summary cards JSON, observations JSON, and nudges JSON. Build `lib/utils/transfers.ts` — internal transfer detection (match debit/credit pairs across accounts within ±3 days, ±2% amount). Wire both Claude calls into the upload pipeline from Step 4.
  Acceptance: After upload, `transactions` rows have realistic `claude_category` values (not all "Uncategorised"). `monthly_reports.narrative_text` is a readable 2–3 sentence summary that leads with wins. `observations_json` and `nudges_json` are populated (may be empty arrays for first upload with no prior month).
  Verify: Read the narrative text in Supabase — does it sound like a human wrote it? Does it correctly identify the top spending category? Check that no PII (name, address, NRIC) appears anywhere in the `transactions` table.

- [ ] **6. Dashboard**
  Spec ref: `spec.md > Frontend > Dashboard (Real Data)`
  What to build: Build `app/dashboard/page.tsx` — fetches the current month's `monthly_reports` row on load. Render four sections: `NarrativeSummary.tsx` (2–3 sentence summary, two states: no data vs real data), `SummaryCards.tsx` (4 cards: Total Spent, Total Saved, Biggest Spending Category, One Forward-Looking Watchout), `ObservationsPanel.tsx` (collapsible, retrospective flags in warm conversational language), `NudgesSection.tsx` (1–2 forward-looking nudges). Add `MonthSelector.tsx` at the top. Handle the single-month state: hide observations panel, show "Upload a past statement to unlock comparisons" in the MoM card. Build `components/layout/Sidebar.tsx` (collapsible nav) and `components/layout/TopBar.tsx` (streak counter placeholder). Apply Tailwind styling — warm, nature-inspired, not corporate grey.
  Acceptance: Dashboard loads with real data from the uploaded statement. Narrative summary is visible. All 4 summary cards show correct figures. Observations panel is collapsible. Sidebar opens and closes without disrupting the content area. Design feels warm and approachable, not like a banking app.
  Verify: Run `npm run dev`, open `localhost:3000/dashboard`. Confirm the narrative matches what Claude generated. Click each card — figures match what's in the `transactions` table. Toggle the observations panel open and closed.

- [ ] **7. Demo and first-run experience**
  Spec ref: `spec.md > Frontend > Demo Dashboard`
  What to build: Build `app/demo/page.tsx` — static page with hardcoded Singapore sample transactions (food, transport, utilities, dining, entertainment). Render the same dashboard layout with fake but realistic figures. Add a clearly visible "Demo — not your real finances" banner. Add 3 `Tooltip.tsx` overlays over: the narrative section, the summary cards, and the upload CTA. Tooltip dismisses on click. Build the entry point: `app/page.tsx` — redirect new visitors (no uploads yet) to `/demo`, returning users (has uploads) to `/dashboard`. After first real upload success, show account creation prompt: "Save your progress" framing, not a signup gate.
  Acceptance: New visitor lands on `/demo` and sees a realistic dashboard with demo data and visible "Demo" label. Tooltips appear over 3 key sections and dismiss on click. After successful upload, prompt to create an account appears with "save your progress" framing.
  Verify: Open an incognito browser window, visit `localhost:3000`. Confirm you land on the demo page. Confirm the demo label is visible. Click each tooltip to dismiss. Then upload a statement — confirm the account creation prompt appears on success.

- [ ] **8. Detailed spending breakdown**
  Spec ref: `spec.md > Frontend > Detailed Spending Breakdown`, `spec.md > Backend (API Routes) > Transactions`
  What to build: Build `app/api/transactions/route.ts` — accepts query params (`month`, `category`, `type`, `account_last4`), translates to Supabase query, returns transactions array. Build `app/breakdown/page.tsx` — fetches transactions via the API. Build `components/breakdown/BreakdownTabs.tsx` with four views: `CategoryView.tsx` (grouped by category, sorted by spend descending), `AccountView.tsx` (grouped by bank + account last-4), `TypeView.tsx` (income / expenses / transfers — internal transfers excluded from expense totals), `TimeView.tsx` (calendar week grouping Mon–Sun; incomplete weeks show actual days). Build `components/transactions/TransactionRow.tsx` — foreign currency display: "17 SGD · 50 MYR"; rate attribution: "Bank rate applied" or "Estimated — converted at rate as of [date]". Build `lib/utils/currency.ts` and `lib/utils/dates.ts`.
  Acceptance: All 4 tabs render correctly. Switching tabs shows the same transactions regrouped — no data disappears. Foreign currency transactions show both SGD and original currency. Internal transfers do not appear in expense totals. Calendar weeks run Monday–Sunday; partial weeks at month edges show actual date range.
  Verify: Open `/breakdown`. Click through all 4 tabs. Find a foreign currency transaction — confirm both currencies are displayed. Confirm the time view week boundaries are correct (Monday start).

- [ ] **9. Retention, settings, and upload history**
  Spec ref: `spec.md > Frontend > Retention`, `spec.md > Frontend > Settings`, `spec.md > Frontend > Upload History`, `spec.md > Backend (API Routes) > Cron — Email Reminders`
  What to build: Build `lib/utils/streak.ts` — calculates consecutive months from `check_ins` table. Build `components/retention/StreakCounter.tsx` and `CheckInAnimation.tsx` — post check-in celebration with what unlocked. Build `app/settings/page.tsx` — account details, check-in reminder day selector (1st–28th), theme toggle (light/dark), optional demographic profile fields, privacy statement, version number, CSV export button (`GET /api/export/csv`), delete account button with confirmation dialog and cascade delete. Build `app/history/page.tsx` — list of uploaded statements with bank name, account last-4, period covered, status. Build `app/api/export/csv/route.ts`. Create `vercel.json` with cron job config for `/api/cron/reminders` (daily 01:00 UTC). Build `app/api/cron/reminders/route.ts` — queries users by check-in day, sends reminder email via Resend.
  Acceptance: Streak counter displays correctly in TopBar after first upload. Check-in animation fires after uploading for a new month. Settings page saves theme preference (page reloads in dark/light mode). Delete account removes all data and redirects to demo. Upload history lists all statements. CSV export downloads a valid file.
  Verify: Upload a second statement for a different month — confirm streak counter increments. Toggle theme in settings — confirm it persists on page refresh. Click delete account (use a test account), confirm all Supabase rows are removed. Download CSV export — open in a spreadsheet app and confirm transactions appear correctly.

- [ ] **10. Deploy to Vercel**
  Spec ref: `spec.md > Runtime & Deployment`
  What to build: Create a Vercel account (if not already set up) and link to your GitHub repository. Add all four environment variables in Vercel project settings (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`). Deploy via Vercel dashboard or `vercel deploy` CLI. Confirm `vercel.json` cron job config is present. Test the full upload flow on the live URL — not just localhost.
  Acceptance: App is live at a `vercel.app` URL. The full upload flow works on the deployed URL (not just localhost). Cron job appears in Vercel dashboard under the project's Cron Jobs tab.
  Verify: Visit your `vercel.app` URL in a fresh browser (not logged into anything). Complete the full flow: land on demo → upload a real statement → see the dashboard → check the breakdown views. Share the URL with someone else and confirm it loads for them.

- [ ] **11. Submit to Devpost**
  Spec ref: `prd.md > What We're Building`
  What to build: Go to devpost.com and create your submission. Project name: FinClarity. Tagline: "Your money is somewhere. FinClarity shows you where — one statement upload, one clear monthly picture." Write the project description using `docs/scope.md` and `docs/prd.md` as source — explain the problem, what you built, and what you learned. Add "Built with" tags: Next.js, TypeScript, Tailwind CSS, Supabase, Claude API, Vercel, Resend. Take screenshots of: the demo dashboard, the upload flow in action, the real dashboard with narrative summary, the breakdown tabs, and the streak/check-in moment. Upload screenshots to the gallery. Link your GitHub repository. Link your live Vercel URL. Submit.
  Acceptance: Submission is live on Devpost with project name, tagline, description, built-with tags, screenshots of all key screens, GitHub repo link, and live app link. The "wow moments" (upload → narrative transformation, streak mechanic) are visible in the screenshots.
  Verify: Open your Devpost submission page as a stranger would. Read the description — does it make sense without any prior context? Do the screenshots show the most compelling parts of the app? Is the live link working?
