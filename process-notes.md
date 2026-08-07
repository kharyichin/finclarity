# Process Notes

## /onboard

**Technical experience:** Beginner. Python for data analysis only — no web, app, or framework experience. First-time AI coding tool user.

**Learning goals:** Understand the full product shipping lifecycle (build → iterate → ship). Wants to get hands dirty in a safe space. Motivated by a career transition into product management at fintech/tech.

**Creative sensibility:** Nature-forward, calm aesthetic (Kevin Kern, plant care, outdoors). Multilingual curiosity — Chinese language and culture. Functional design sensibility influenced by Chinese apps and Planta. Clean and warm over flashy.

**Prior SDD experience:** University ideation hackathon. Naturally plans for complex/new tasks in daily life but doesn't follow a formal process. Intuitive planner, not a trained one.

**Notable context:** Strong product marketing background — thinks about users and messaging naturally. This is a deliberate career pivot; the hackathon is as much about credentialing as it is about learning. High motivation, practical mindset.

**Energy/engagement:** Warm, direct, grounded. Gave thoughtful answers. Ready to get started.

## /scope

**How the idea evolved:** Started as a broad "financial super app" vision (live bank integrations, crypto, brokerage, cross-border, investment advice). Through conversation, Jade made a sharp pivot to statement-upload as the v1 mechanism — avoids legal/API complexity entirely, validates the insight engine first. Smart product instinct.

**Key decisions and pushback responded to:**
- Pivoted from live API to statement upload when legal/compliance complexity was surfaced — Jade initiated this herself
- Chose SGD-first with international users in scope, not global-first
- Cut property/tangible assets herself ("pretty hard to capture")
- Correctly identified investment recommendations as a legal line to avoid ("LAW")
- Agreed to cut manual input as a fallback — recognised it diminishes the core value

**References that resonated:**
- Monarch Money: UX/UI direction — she explicitly said "I envision my product to look like this"
- Emma: cross-border multi-currency as a first-class feature
- Duolingo: retention mechanic inspiration — streak, identity-building, habit loop

**Design direction surfaced:** Colorful, warm, simple — explicitly NOT the "serious AI app" aesthetic. Finance should not feel daunting. Nature-influenced, calm.

**Deepening rounds:** 0 formal deepening rounds offered — the mandatory questions organically generated very rich material. Jade drove the conversation into architecture, privacy, PDPA, PDF password handling, PII extraction, and retention psychology unprompted. Conversation ran deep without needing additional prompting rounds.

**Active shaping:** Jade drove direction throughout. Notable moments of her steering: initiated the scope pivot to statement upload; flagged investment advice as a legal issue before being asked; correctly identified manual input as scope creep; surfaced the PDF password problem herself; asked about data legitimacy and PII redaction unprompted. High agency, strong product instincts.

## /prd

**Session status:** In progress — paused mid-conversation. Resume with `/prd` to continue.

**Decisions locked so far:**

**First-run experience:**
- Sample dashboard with fake data so new users see the full experience immediately
- 2-3 guided tooltips layered on top explaining key sections
- Clear nudge/call to action to upload first statement

**Account creation flow:**
- Account creation prompted *after* first upload success, framed as "save your progress"
- Not required upfront — user sees value first, then commits

**Upload & processing:**
- Animated loading state during PDF processing (similar to Claude's thinking indicator)
- For password-protected PDFs: attempt to open first → instant detection → prompt for password only when needed
- Success state: cute animation confirming statement processed and password discarded

**Single-month data (no prior months to compare):**
- Show plain-language spending observations ("you spent most on food and transport")
- Prompt user to upload a past statement to unlock comparisons
- No month-over-month comparison until second month is uploaded

**Multi-account uploads:**
- Supported — users can upload multiple statements for the same month
- App stitches them into a unified view
- Internal transfers auto-detected by matching amounts across accounts within a short time window, excluded from spending totals, surfaced under "Savings & Transfers" category

**Dashboard layout:**
- Top: 4 summary cards — total spent, total saved, biggest spending category, one forward-looking watchout
- Below cards: collapsible panel for watchdog flags (warm, non-threatening design language matching the rest of the app)
- Detailed spending section below that

**Detailed spending breakdown — 4 views (v1):**
- By category
- By account
- By transaction type (income / expenses / transfers)
- By time (weekly view within the month)
- Merchant drill-down → v2

**Watchdog flags:**
- Appear in two places: highlighted inline in the detailed section + surfaced in collapsible panel at top
- Design language: warm and non-threatening, consistent with rest of app

**Parked for v2:**
- Social/benchmarking ("compare to people like them")
- Email alerts and push notifications for time-sensitive flags (e.g. loan payment reminders)
- Push notifications when becoming a native app

**Session completed.**

**Additional decisions locked (second session):**

**Multi-currency display:**
- SGD equivalent shown as primary; original foreign currency shown inline on same line (e.g. "17 SGD · 50 MYR")
- Note on converted transactions: "not charged in SGD, converted for comparison"
- Exchange rates from Google Finance, updated weekly, "as of [date]" displayed

**Narrative report text:**
- Two states: demo placeholder message (sample dashboard) and data-driven narrative (real data)
- Claude API generates real narrative fresh from actual patterns — not a template
- When month is bad: acknowledge truth first, then pivot to actionable improvement

**Retention mechanic:**
- Monthly streak counter — habit-based, not wealth-based (streak = showing up, not spending amount)
- User selects their preferred check-in day
- Post-check-in: small animation + message acknowledging effort + what just unlocked
- Deliberately monthly (not daily/weekly) — Jade correctly identified over-checking as demoralising when little changes
- Rejected XP/levels tied to money — values decision: don't signal that more money = higher status

**Watchdog flags → renamed/split:**
- Retrospective flags (missing/changed recurring charges) only run on complete month statements
- Forward-looking nudges ("your phone bill usually hits around the 15th") in separate section
- Jade correctly identified "watchdog" as a misnomer — retrospective analysis isn't proactive prevention
- Language: warm and conversational ("like a friend giving a nudge"), not corporate alerts

**Statement completeness:**
- App must detect complete vs. incomplete statements before running retrospective analysis
- Multi-account date range mismatch: trim to overlapping window, flag excluded range clearly

**Navigation:**
- Collapsible sidebar: Dashboard, Upload History, Settings, Upload New Statement
- Upload CTA also lives on dashboard — dual placement for new vs. returning users

**Settings page:**
- Account details, notification preferences, theme, privacy & security statement, version number, export (CSV + PDF)
- Wrapped-style PNG export → parked to v2 (Jade's call — agreed it was too build-heavy for v1)

**Deepening rounds:** 1 formal deepening round chosen. Key surfaced items: honest/constructive framing for bad months; date range mismatch handling; recurring charge detection logic (merchant + amount/date); calendar week definition (Mon–Sun, incomplete weeks shown as-is); watchdog language philosophy.

**Active shaping:** Jade continued to drive throughout. Notable moments: rejected XP/levels on values grounds (wealth ≠ status); correctly identified "watchdog" as semantically wrong; raised the statement completeness question herself; asked about Claude API availability for end users unprompted. High product instincts — thinking like a PM, not just a builder.

## /spec

**Stack decided:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 → Vercel. Supabase for database + anonymous auth. Claude API (claude-haiku-4-5) for extraction and narrative. pdfjs-dist for PDF parsing. Resend for email reminders.

**Key decisions:**
- Python backend considered and rejected — Jade open to learning something new, and Next.js means one language across the whole app. PDF parsing via pdfjs-dist + Claude text extraction sidesteps the Python advantage.
- claude-haiku-4-5 for everything — Jade's explicit instruction to use the lowest cost tier.
- Anonymous auth from first visit — Supabase upgrades to real account on signup, no data migration needed.
- Frontend-first filtering with queryable API layer for longevity.

**What Jade was confident about:** Stack direction once the tradeoffs were explained. Product decisions throughout (duplicate detection, delete account, bank rate superseding online rate). The Claude-reads-everything approach for statement type detection.

**What Jade was uncertain about or asked to clarify:** Whether Python was truly necessary (resolved by Claude text extraction approach). What Supabase is (explained via analogy). Pricing for Vercel/Supabase (confirmed free tier covers the build). How frontend and backend communicate (explained via HTTP request model).

**Longevity questions Jade raised (strong PM instinct):**
- Bank exchange rate in statement superseding online rate → resolved in data model (bank_rate, bank_rate_sgd, exchange_rate_source fields)
- Scalability of frontend filtering → resolved with queryable API layer
- User profiles for demographic analytics → resolved with opt-in age_bracket, gender, analytics_consent + k-anonymity principle
- Privacy / PII in PDFs → resolved with explicit Claude extraction prompt excluding all PII
- Cross-user learning → explained prompt improvement vs aggregate analytics vs model fine-tuning distinction
- Duplicate upload detection → two-layer approach: SHA-256 hash + period duplicate check

**PRD gaps surfaced in architecture review:**
- Internal transfer detection had no home → added lib/utils/transfers.ts
- Month-over-month comparison not wired → narrative call now passes prior month data
- Export routes missing → added app/api/export/csv and /pdf
- Email reminder mechanism → Vercel Cron Job + Resend
- Theme setting → added to users table + settings page
- First-run tooltip trigger → added has_completed_onboarding to users table
- Delete account cascade → added prominently to settings page

**Deepening rounds:** 0 formal deepening rounds offered — Jade drove the conversation deep herself through strong product and longevity questions. Every major architectural decision was interrogated rather than accepted. Multiple PRD gaps caught through her questions (delete account, duplicate uploads, bank exchange rates, demographic analytics, statement type detection). High-agency, thorough session.

**Active shaping:** Jade challenged the Python recommendation directly and drove the stack decision herself. Raised the bank statement split (credit card vs bank account) as a fundamental product question. Pushed on longevity for every architectural layer. Asked about user profiling and privacy without prompting — thinking at the product-system level, not just the feature level.

## /checklist

**Sequencing decisions:** Jade immediately identified the database as the right starting point ("the system behind all of these first — the database"). Correct instinct — confirmed and used as the sequencing anchor. Dependency chain: DB schema → project setup → GitHub → PDF upload pipeline → Claude extraction → dashboard → demo/first-run → breakdown views → retention/settings → deploy → Devpost.

**Methodology preferences:**
- Build mode: Step-by-step
- Comprehension checks: Yes
- Verification: Yes (per-item)
- Git: Commit after each item
- Check-in cadence: Balanced — PM-relevant explanations without going deep into code

**Items and estimated build time:** 11 items. Steps 4–5 (upload pipeline + Claude) are the heaviest, roughly 45–60 min combined. Steps 1–3 (DB, setup, GitHub) are 20–30 min. Steps 6–9 are 20–30 min each. Steps 10–11 are 15–20 min each. Estimated total: 4–5 hours.

**What Jade was confident about:** Sequencing instinct (database first, without prompting). Build mode choice — explicitly said "the way I learn the most."

**What Jade needed guidance on:** How Git and GitHub work — explained simply using local/remote mental model. Will be walked through hands-on in Step 3.

**Submission planning:** Jade articulated two wow moments unprompted — the upload → narrative transformation, and the streak/habit mechanic. Strong PM framing: the app isn't just a one-time tool, it's a behaviour-change product. Tagline drafted: "Your money is somewhere. FinClarity shows you where — one statement upload, one clear monthly picture." GitHub account already exists.

**Deepening rounds:** 0 formal deepening rounds — checklist built from spec directly; no gaps surfaced requiring additional rounds.

**Active shaping:** Jade led on sequencing (database first), build mode (learning-first), and submission story (both wow moments articulated without prompting). Framed the product's value in human terms — "10 dollars here, 50 dollars there" — showing strong user empathy instinct. Asked about GitHub from scratch, showing self-awareness about knowledge gaps rather than assuming.

## /build

### Step 7: Demo and first-run experience
- **What was built:** `components/ui/Tooltip.tsx` — dismissable overlay component wrapping any section. `app/demo/page.tsx` — static demo dashboard with hardcoded Singapore April 2026 data (narrative, 4 summary cards, 2 nudges). Demo banner clearly labelled "Demo — not your real finances." 3 Tooltip overlays on narrative, summary cards, and upload CTA. Upload CTA links to `/dashboard`. `app/page.tsx` replaced — server component checks if user has any complete statements; redirects returning users to `/dashboard`, new visitors to `/demo`.
- **Issues encountered:** None — clean build first try.
- **Verification:** Jade confirmed demo looks good. Iterated on tooltip design (covered → below section → above section with colour options) and banner (warning amber → scrolling ticker). Final: blue numbered tooltip pills above each highlighted section, stone ticker at top.
- **Active engagement:** Drove multiple rounds of visual polish — clear sense of what felt right. "okay this is great for v1" confirmed satisfaction.

### Step 3: GitHub repository
- **What was built:** GitHub repo `finclarity` created at github.com/kharyichin/finclarity (public). gh CLI installed via brew and used for auth (`gh auth setup-git` resolved HTTPS credential issue). Remote origin set, pushed all existing commits.
- **Issues encountered:** HTTPS push failed initially — `gh auth setup-git` needed to wire the gh CLI as git's credential helper. Resolved without friction.
- **Verification:** Jade confirmed file structure visible on GitHub and .env.local absent from the repo.
- **Comprehension check:** Asked why .env.local must be excluded. Answered correctly: it contains API keys that would be exposed on a public repo.

### Step 2: Project setup
- **What was built:** Next.js 16 (latest, scaffolded via create-next-app) with TypeScript and Tailwind CSS v4. Installed pdfjs-dist, @anthropic-ai/sdk, @supabase/supabase-js, @supabase/ssr, resend. Created types/index.ts, lib/supabase/client.ts and server.ts, .env.local, .env.example, proxy.ts (anonymous auth), vercel.json, and full placeholder folder structure.
- **Issues encountered:** (1) Node.js not installed — resolved with brew install node. (2) create-next-app conflicted with existing docs/ and supabase/ folders — scaffolded into /tmp then rsync'd over. (3) Next.js 16 renamed middleware.ts to proxy.ts with a different export name — renamed and fixed. (4) Anonymous users hidden behind email tab in Supabase Auth dashboard — not missing, just filtered.
- **Verification:** Dev server ran at localhost:3000 with no console errors. Anonymous user created and confirmed in Supabase Authentication → Users (under email tab).
- **Comprehension check:** Asked what proxy.ts does on first visit. Jade answered B (creates silent anonymous session so data has a user ID from the first visit). Correct.

### Step 4: PDF upload pipeline
- **What was built:** `lib/pdf/parse.ts` (pdfjs-dist legacy build, text extraction + date range detection + password exception handling). `app/api/statements/upload/route.ts` — full 10-step async pipeline using `after()` from next/server, SHA-256 duplicate check, calls Claude stubs and transfer detection stubs. `app/api/statements/[id]/route.ts` — status polling endpoint. All 5 upload UI components: UploadZone (drag-and-drop), PasswordPrompt, ProcessingState (polls every 2 seconds), SuccessState, ErrorState. `app/dashboard/page.tsx` wired up with modal and full upload flow state machine. Claude extract/narrative and transfer detection are functional stubs returning empty data — real implementations in step 5.
- **Issues encountered:** (1) pdfjs-dist v5 is ESM-only — using `serverExternalPackages` failed; switched to legacy build (`pdfjs-dist/legacy/build/pdf.mjs`) as recommended by pdfjs for Node.js. (2) `DOMMatrix is not defined` error with the standard pdfjs build — resolved by legacy build. (3) All placeholder pages from step 2 were empty files failing TypeScript — added minimal stubs.
- **Verification:** Jade confirmed dashboard loads at localhost:3000, green upload button visible, modal opens with drag-and-drop zone. Noted modal is small — flagged for v2 polish, not blocking.
- **Comprehension check:** Asked where PDF processing happens. Answered correctly: on the server (Next.js API route). Unprompted observation: the privacy guarantee (PDF never stored) is worth highlighting in the Devpost write-up. Strong PM instinct.

### Step 5: Claude extraction and narrative
- **What was built:** `lib/claude/extract.ts` — real Claude haiku-4-5 extraction prompt with PII exclusion, JSON parsing, and fallback handling. `lib/claude/narrative.ts` — narrative prompt generating narrative text, summary cards, observations, and nudges. `lib/utils/transfers.ts` — internal transfer detection by amount/date proximity matching.
- **Issues encountered:** (1) SHA-256 duplicate detection blocked re-uploads during debugging — required clearing statements table repeatedly. (2) `after()` in Next.js 16 silently swallowed pipeline errors in dev mode — switched to synchronous pipeline execution to surface errors. (3) Stale `ysk-ant-api03-` API key (paste typo with leading `y`). (4) New Anthropic account had no credits despite key being valid — required $5 top-up. (5) `max_tokens: 4096` too low for full statement — increased to 8096 to prevent truncated JSON. (6) `crypto.randomUUID()` missing import in transfers.ts — fixed with `import { randomUUID } from 'crypto'`.
- **Verification:** Upload succeeded. "Password discarded" success animation shown. Transactions table populated with real rows. Narrative generated: "You brought in SGD 9,580.10 this month... running about SGD 1,560 in the red." Real Claude output, not stub text.
- **Learner observation:** Noted narrative has room to improve — acknowledged, flagged for /iterate. Observed "Other" as dominant category — likely OCBC merchant code formatting.
- **Active engagement:** Asked about free workaround (Gemini), deferred to keep on spec. Asked about token costs — explained clearly. Strong practical instincts throughout debugging session.

### Step 6: Dashboard
- **What was built:** Full dashboard with real data fetching from `/api/reports`. `NarrativeSummary`, `SummaryCards`, `ObservationsPanel`, `NudgesSection` all wired to live Supabase data. `Sidebar` with emoji nav icons and collapse/expand. `TopBar` with upload button top-right. `MonthSelector` for navigating between months. `CollapsiblePanel` and `MonthSelector` UI primitives. Dashboard auto-refreshes after upload via `onSuccess` callback.
- **Learner verification:** Dashboard loaded with real data. Summary cards visible. Sidebar collapses/expands correctly. Upload button visible top-right.
- **Issues flagged by learner:** Narrative text not making sense; summary card figures inaccurate. Root cause: Claude prompt quality from Step 5 (OCBC merchant code formatting). Flagged for `/iterate`.
- **Comprehension check:** Asked what triggers the dashboard refresh after upload. Answered correctly: the `onSuccess` callback calls `fetchReport`.

### Step 8: Detailed spending breakdown
- **What was built:** `app/api/transactions/route.ts` (filtered Supabase query). `app/breakdown/page.tsx` with full upload modal wired in. `components/breakdown/BreakdownTabs.tsx` with 4 tabs. `CategoryView.tsx` — expense-only, stacked colour bar chart with click-to-scroll anchors, category icons. `AccountView.tsx` — account spending chart, card nickname editor (React context, persists to localStorage, reflected in all TransactionRow instances). `TypeView.tsx` — income/expenses/transfers with totals. `TimeView.tsx` — weekly bar chart, scroll anchors. `components/transactions/TransactionRow.tsx` — foreign currency display, category icon pill, nickname-aware card label. `lib/utils/currency.ts`, `lib/utils/dates.ts`, `lib/utils/categories.ts`, `lib/utils/cardNicknames.ts`, `components/providers/CardNicknamesProvider.tsx`.
- **Issues encountered:** (1) Foreign currency display — OCBC shows "FOREIGN CURRENCY SEK/USD [amount]" on a separate line; Claude extraction prompt required multiple iterations to capture all currency codes. (2) Card name extraction — dedicated `cardName` field added to extraction JSON; still unreliable for some statements, nickname editor added as user-controlled fallback. (3) Credit card bill payments classified as "income" — fixed in extraction prompt (now "transfer"). (4) Reversals (Trip.com) inflating savings total — classified as "Refund & Reversal" category, excluded from `total_saved` calculation. (5) Non-statement PDF silently succeeding — fixed: pipeline fails with clear message if 0 transactions extracted.
- **Learner observations:** Drove multiple product-quality rounds: spotted wrong income classification, flagged reversal accounting issue, asked for pie charts, week bar chart, month picker dropdown, card nicknames, upload button on empty states, scroll anchors. Strong product instinct — thinking about edge cases and UX unprompted.
- **Active engagement:** Very high. Jade caught 6+ issues herself and directed every UI improvement. Iterated specifically on: category chart, account chart, week date labels, foreign currency display, tab naming (By Time → By Date), spending total accuracy.

### Step 10: Deploy to Vercel
- **What was built:** Vercel project linked (`kharyichins-projects/my-hackathon-project`). All 4 env vars added via Vercel dashboard (Supabase URL, Supabase anon key, Anthropic API key, Resend API key). Outstanding step 9 polish commits pushed to GitHub. Redeployed successfully — build passed TypeScript and all 20 routes deployed. Cron job (`/api/cron/reminders`, daily 01:00 UTC) registered in Vercel. Live at `https://my-hackathon-project-mu.vercel.app`.
- **Issues encountered:** First deployment failed (build error) because env vars were not set on Vercel. Resolved by adding all 4 env vars and redeploying. Jade also didn't initially have the Resend API key — she found it in her Resend dashboard.
- **Verification:** Jade confirmed full upload flow works on the live URL.
- **Issue flagged by learner:** No login module for users who have already created an account — they can upload and sign up but can't log back in. Flagged for /iterate.
- **Comprehension check:** Asked what happens to anonymous user data if they skip "save your progress" and close the browser. Answered "Data is lost" — corrected: data persists in Supabase under the anonymous user ID via session cookie; "save your progress" is a conversion nudge, not a genuine data-loss warning.

### Step 11: Submit to Devpost
- **What was built:** Devpost submission for FinClarity. Project description drafted from docs/scope.md and docs/prd.md — covers problem, what was built, and what was learned. Built-with tags: Next.js, TypeScript, Tailwind CSS, Supabase, Claude API, Vercel, Resend. Screenshots guidance provided for 5 key screens: demo dashboard, upload flow, real dashboard, breakdown tabs, streak counter. GitHub and Vercel URLs linked.
- **Comprehension check:** Asked why the password-discard detail was called out in the description. Answered correctly: it's a key trust signal — a differentiating privacy guarantee for users uploading sensitive financial documents.
- **Active engagement:** Submission completed independently without friction.

### Step 1: Database schema
- **What was built:** `supabase/schema.sql` with all 6 tables (`users`, `statements`, `transactions`, `monthly_reports`, `check_ins`, `exchange_rates`). Includes foreign keys, cascade deletes, unique constraints, and a trigger to auto-create a `public.users` row when Supabase creates any auth user.
- **Schema correction mid-step:** Initial draft was missing the `auth.users` linkage (needed for anonymous auth to work) and the period duplicate constraint on `statements`. Both were caught before verification and fixed.
- **Verification:** Jade confirmed all 6 tables appeared in Supabase Table Editor. RLS left off intentionally — acceptable for hackathon.
- **Issues:** Jade initially pasted the file path into the SQL editor instead of the file contents — resolved with guidance. No SQL errors on run.

### Step 12: Anonymous upload — process in memory, never save to DB
- **What was built:** `app/api/statements/upload/route.ts` — added anonymous branch: detects `user.is_anonymous`, runs new `runAnonymousPipeline()` function (same steps as authenticated pipeline — PDF parse, Claude extract, transfer detection, narrative) but returns all data inline in the API response instead of inserting any DB rows. `components/upload/UploadZone.tsx` — handles `{ anonymous: true }` response: stores full result in `sessionStorage` under `finclarity_pending_upload`, calls `onAnonymousSuccess()`. `components/upload/PasswordPrompt.tsx` — made `statementId` optional, handles anonymous password retry and anonymous response. `app/dashboard/page.tsx` — auth check on mount (Supabase `getUser()`), `loadAnonymousData()` reads from sessionStorage if anonymous, `needs_password_anonymous` flow stage added, amber banner for anonymous users ("This data is only saved in this browser tab. Create an account to keep it.").
- **Issues encountered:** None — clean build first try, TypeScript passed with zero errors.
- **Design decision:** Anonymous users see the "Uploading..." spinner for the full pipeline duration (30-60s), whereas authenticated users get the animated `ProcessingState` cycling through messages. This is a minor UX difference; the spec didn't specify an animated state for anonymous uploads and adding it would require significant plumbing. Acceptable for this step.

## /iterate

**Session start:** All 14 checklist items complete. Iteration 1 (steps 12–14) also complete. Full end-to-end flow verified: demo → anonymous upload → save progress → sign out → sign back in → data persists.

**Iteration 2 scope:**
- User chose Dashboard & UX improvements
- Animated stat strip (spend vs save, savings rate %)
- Conditional insight tiles (top spending card — only shows with 2+ accounts)
- Monthly budget tracker (set once, track against spend each month)
- Wider upload modal
- Savings goals deferred to Phase 2 alongside account management
- 4 checklist items added (15–18)

**Remaining PRD backlog items:**
- OCBC merchant extraction quality / narrative quality (flagged at steps 5, 6, 8)
- Dashboard visual accompaniment (text-only narrative section)
- Upload modal size polish
- Resend domain verification for email reminders
- Larger features (merchant drill-down, wrapped export, streak badges) — Phase 2

### Step 14: Login page for returning users
- **What was built:** `app/login/page.tsx` — warm sign-in form with email + password, calls `supabase.auth.signInWithPassword()`, redirects to `/dashboard` on success, shows friendly inline error on failure. `app/demo/page.tsx` — "Sign in" link added to the heading row (top-right of main content area, next to the April 2026 label). `components/layout/Sidebar.tsx` — now checks auth state on mount; anonymous users see "Sign in" (→ /login) and "Create account" (calls onUpload) at the bottom; authenticated users see a "Sign out" button that calls `auth.signOut()` and redirects to `/demo`.
- **Issues encountered:** None — clean build.

### Step 13: Account creation — save sessionStorage data to DB
- **What was built:** `app/api/statements/save/route.ts` — POST route that accepts the full anonymous upload payload (report + rawTransactions + meta) and saves to `statements`, `transactions`, `monthly_reports`, and `check_ins`. `app/api/statements/upload/route.ts` — anonymous pipeline now includes `rawTransactions` and `meta` (bankName, cardName, accountLast4, statementType, dateRange, monthYear, isConsolidated) in its response so the save route has everything needed to reconstruct DB rows. `components/upload/SuccessState.tsx` — now has two rendering modes: authenticated users see the original "View your dashboard" flow; anonymous users see an amber "Save your progress" banner + email/password form + "Continue without saving" option. On save: calls `supabase.auth.updateUser({ email, password })` to convert the anonymous session, then POSTs sessionStorage data to `/api/statements/save`, clears sessionStorage, navigates to `/dashboard` via full page reload. `app/dashboard/page.tsx` and `app/demo/page.tsx` — both now pass `isAnonymous` to `SuccessState`.
- **Issues encountered:** None — TypeScript passed clean.

## /iterate

**Session start:** All 11 original checklist items confirmed complete. App live at `https://my-hackathon-project-mu.vercel.app`.

**Items flagged during the build for /iterate:**
- Narrative quality (OCBC merchant code formatting causing "Other" to dominate category data)
- Summary card figures inaccurate (related to same extraction quality issue)
- No login module for returning users — users who've created an account can't log back in

**Quick review pass observations (pre-learner input):**
- Login gap is a real usability hole — any user who created an account and returns to the live URL has no path back to their data
- Narrative/extraction quality is the core "wow moment" of the app — if it's weak, the submission suffers
- Both issues are solvable, and the infrastructure for both is already there (Supabase auth is wired, Claude extraction prompt is already structured)

**Scoping decisions:**
- Data persistence: chose Option B (never save anonymous user data to DB; process in memory, save only on account creation). Reason: stronger privacy story, aligns "save your progress" with reality. Jade was deliberate about this after understanding the tradeoff.
- Brokerage/crypto: brokerage is v2 (already in PRD), crypto is a Non-Goal (confirmed). Not in this iteration.
- Resend, dashboard UX, OCBC extraction deferred — prioritised data + login first.
- PRD updated with full Iteration Backlog section consolidating all v2 and build-flagged items.

**Iteration 1 checklist items created:** 3
- Item 12: Anonymous upload returns data in memory, never saves to DB
- Item 13: Account creation converts anonymous session + saves sessionStorage data to DB
- Item 14: Login page for returning users + sign-in link on demo/sidebar

### Step 16: Conditional insight tiles
- **What was built:** `components/dashboard/InsightTiles.tsx` — groups expense transactions by card (account_last4 + bank_name), finds the top spender, and renders a compact "Top card" tile only when 2+ distinct cards exist. For anonymous users, reads from `sessionStorage['finclarity_pending_upload'].rawTransactions`; for authenticated users, fetches from `GET /api/transactions?month=...`. Uses `getCardLabel` from `lib/utils/cardNicknames.ts` so user-set nicknames are respected. Wired between `SummaryCards` and `ObservationsPanel` in `app/dashboard/page.tsx`. No tile row shown on demo page (no account breakdown in demo data).
- **Issues encountered:** None — TypeScript passed clean, no issues.

### Step 17: Monthly budget tracker (revised after initial build)
- **Initial build:** Single `BudgetBar` component at bottom of dashboard with one overall budget amount.
- **Revised after learner feedback:** Replaced with per-category budgets on a dedicated `/budget` page. `BudgetBar` redesigned as a compact top-of-dashboard status widget showing total spend vs total budgeted, linking to `/budget` for editing. Sidebar now has a "Budget" nav item. `category_budgets jsonb` column added to users table (PATCH /api/user now accepts it). Number inputs on budget page use `inputMode="numeric"` with no spinners, placeholder of 1,000.
- **Sidebar fix:** "Create account" button was calling `onUpload` (which opens upload zone — not useful if anonymous user already has pending data). Fixed by adding `onCreateAccount` prop to Sidebar; dashboard passes a smart callback that opens the save-progress form if sessionStorage has pending data, otherwise opens the upload flow.
- **SQL needed:** `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS category_budgets jsonb DEFAULT '{}'::jsonb;`

### Step 15: Animated spend vs save stat strip
- Built `components/dashboard/SpendSaveStrip.tsx` — full-width animated bar, amber for spent, green for saved, on a stone-100 track. Savings rate % shown below. Handles credit-card-only case (no savings: full amber bar, "— saved" label). Animation triggered by `useEffect` + `requestAnimationFrame` so it fires reliably on mount.
- Wired between `NarrativeSummary` and `SummaryCards` in both `app/dashboard/page.tsx` and `app/demo/page.tsx`.

## Session: 2026-08-05 — Bug audit, RLS fix, production deploy

**Trigger:** PDF parsing appeared broken. Root cause was not PDF code at all — the original Supabase project (`djoulapjhrkzmixqtjfj`) had been deleted (DNS no longer resolves), so anonymous auth was failing on every request. Migrated to a new Supabase project (ref `aqdpkgwfyunnokybhtcn`), updated `.env.local`. Confirmed the 6 tables + `monthly_budget`/`category_budgets` columns already existed live on the new project.

**Checklist cleanup:** Reconciled `docs/checklist.md` and `docs/checklist-post-mvp.md` against actual app behaviour — item 19 (landing page) was done but implemented differently than spec'd (wired into root `/` instead of a separate `/welcome` route); item 7's root-redirect acceptance criteria is now stale as a result.

**Full audit (background agent) of every `[x]` checklist item found 7 real bugs:**
1. Narrative always attributed 100% of spend to one category — `transactions: []` was hardcoded in `app/api/statements/upload/route.ts` at both call sites feeding the report generator. **Fixed and verified live.**
2. Anonymous dashboard/breakdown showed a false empty state right after upload — displayed month defaulted to calendar last-month instead of the upload's actual month. **Fixed and verified live.**
3. `new Date(tx.date)` parses date-only strings as UTC, silently dropping transactions at week boundaries in the Time tab and showing dates one day early in negative-UTC-offset zones. Added `parseLocalDate()` to `lib/utils/dates.ts`, applied everywhere. **Fixed and verified live.**
4. Account creation (`supabase.auth.updateUser`) fails — confirmed via network inspection the client sends the correct email; Supabase's own auth server rejects it, then rate-limits. Root cause: **no custom SMTP configured** on the new Supabase project (using its low-cap default shared email service). Not a code bug — needs Supabase dashboard → Auth → SMTP Settings configured with a real provider (Resend account already exists for this). **Still unresolved as of this session.**
5. CSV export route existed but had no UI link anywhere — restored as "Download all as CSV" in Settings. **Fixed.**
6. Demo page leaked a "Set a budget →" link (via `SpendSaveStrip`, a separate code path from `BudgetBar`) into a real, disconnected budget page. **Fixed.**
7. `supabase/schema.sql` didn't match live schema (`monthly_budget`, `category_budgets` were added by hand, never committed). **Fixed** — schema.sql now matches live.

**Critical security finding (before deploying):** the new Supabase project had RLS **enabled with zero policies** on every table — not a data leak (cross-user access was correctly blocked), but a full functional block: even a user's own self-access (read/insert/update their own `users` row) was denied by default. This would have broken the `users` upsert fallback in `/api/statements/upload` and `/api/user`, and the entire delete-account flow, for any real (non-anonymous) user. Wrote the missing self-access-only RLS policies (`auth.uid() = user_id` pattern) into `supabase/schema.sql`, had the user run them via the Supabase SQL editor, then verified with a two-independent-anonymous-session cross-access test via curl: self-access works, cross-user read/update/delete all correctly blocked (0 rows affected), impersonation attempts hard-blocked with 403.

**Deploy:** Vercel CLI was outdated (52.0.0) and had a bug preventing non-interactive `env add` — upgraded to 58.5.1, which fixed it. Discovered that removing an env var for one environment (`preview`) removed it from all three (Prod/Preview/Dev shared one record) — re-added Supabase env vars to all three explicitly. Deployed preview first, verified full pipeline end-to-end (upload → parse → extract → narrative) against the live URL, then promoted to production: **https://my-hackathon-project-mu.vercel.app**. No custom domain attached to the account.

**Still open:**
- ~~D1 / bug #4 root cause — Supabase custom SMTP not configured.~~ **Resolved 2026-08-06** — see session below.
- Item 9 sub-items (streak counter, theme persistence, delete-account) — SMTP blocker cleared 2026-08-06, but still not independently re-verified.
- Item 16 (insight tiles) not independently re-verified — needs a two-different-card test fixture.
- P1 — extraction quality only tested against a synthetic statement this session; still needs a spot-check against a real OCBC/DBS/UOB statement.
- TypeScript: no errors.

**Correction (2026-08-05, later session):** the "Devpost submission not started" note above was wrong — checklist item 11 was already complete (see earlier in this file) and Jade confirmed she submitted it a while ago. Only open question: whether the listing's live URL/description need a refresh to reflect this session's fixes and the Sentry addition below — not yet decided.

## Session: 2026-08-05 (cont'd) — Sentry error monitoring

**Trigger:** Continuing the open item from the bug-audit session above — no error monitoring configured on the Vercel project.

**Billing question raised:** user asked whether Sentry's install would need a payment method despite being "free" — correct instinct. Confirmed via Vercel's billing-plans API schema: individual marketplace plans carry a `paymentMethodRequired` flag independent of cost, so a $0 plan can still require a card on file (fraud/verification, not usage billing). Sentry's plans: `am3_f` Developer ($0.00/mo — chosen), `am3_team` ($29/mo), `am3_business` ($89/mo). User also asked whether being "hammered" could trigger a surprise bill — confirmed the free Developer tier has no overage billing; it drops/rate-limits events past the ~5k/mo quota instead of charging. Noted `vercel integration resource create-threshold` as an available hard spend-cap mechanism if ever needed.

**Install friction (two rounds):**
1. `vercel integration add sentry --no-claim --plan am3_f` required accepting Sentry's marketplace terms in browser first — the CLI-generated `accept-terms` link 404'd with "Missing billingPlanId for installation-only plan integration" (looks like a Vercel dashboard bug on that deep link). Worked around by having the user install directly from `vercel.com/marketplace/sentry` and picking the Developer plan there. `vercel integration accept-terms sentry` also confirmed to categorically require an interactive human terminal — cannot be scripted.
2. After terms acceptance, `vercel integration add` succeeded once given the required Sentry metadata flags (`-m name=finclarity -m region=us -m platform=javascript-nextjs`). Resource `sentry-teal-brush` provisioned and connected to the project; `vercel env pull` added `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, etc. to `.env.local` (already gitignored).

**SDK wiring — done manually, not via wizard:** `npx @sentry/wizard@latest` needs a real browser OAuth login and has no way to complete unattended — it timed out waiting for login when run as a background task, and a `--non-interactive` retry crashed on `ERR_TTY_INIT_FAILED` (no TTY available in the tool sandbox). Checked `node_modules/next/dist/docs` per AGENTS.md instructions and confirmed Next.js 16's current App Router convention (`instrumentation.ts` + `instrumentation-client.ts`, not the older `sentry.client.config.ts` pattern) before hand-writing the files: `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `app/global-error.tsx`, and `next.config.ts` wrapped with `withSentryConfig`. Installed `@sentry/nextjs@10.69.0`.

**Verification:** `npx tsc --noEmit` clean. Dev server restarted clean, no Sentry init errors. Added a throwaway `app/api/sentry-test/route.ts` that threw an error, hit it once, confirmed a clean 500 + correct stack trace locally, then deleted the route. Couldn't confirm ingestion via the Sentry API directly — the Vercel-provisioned `SENTRY_AUTH_TOKEN` is scoped for CI source-map uploads only, not issue reads (403 on `/api/0/projects/.../issues/`). User checked the Sentry dashboard directly (via Vercel SSO — `vercel integration open sentry`, no separate Sentry login exists) and confirmed the test error landed correctly, unhandled, tagged with the right route.

**Committed and pushed:** `97b195b` — Sentry config files, `next.config.ts`, `package.json`/`package-lock.json`, and a `.gitignore` hardening (`.env*`) that `vercel env pull` added automatically. Deliberately left the unrelated pre-existing `.claude/settings.local.json` and this file's earlier uncommitted edits out of that commit. Scanned all new files for hardcoded secrets before staging — clean, everything reads from `process.env`.

**Still open:** whether to refresh the Devpost listing for the fixes/Sentry addition (see correction note above) — undecided.

## Session: 2026-08-06 — Supabase custom SMTP (resolves D1 / bug #4)

**Scope check:** Jade clarified the hackathon submission is done and this is now an ongoing personal project — shifts the bar from "good enough for a demo" to "actually correct for real users" on decisions like email verification going forward.

**Domain decision:** confirmed via `check_domain_availability_and_price` that `finclarity.app`, `.com`, and `.io` are all already registered by someone else — not just "no DNS access," genuinely not ownable as-is. `finclarityapp.com` and `tryfinclarity.com` are both available ($11.25/yr via Vercel). Presented the buy-a-real-domain option given the project's new ongoing status; Jade chose to defer and fix SMTP now with Resend's unverified sandbox sender instead. Revisit domain purchase when ready — it's the actual fix for emailing arbitrary real users, not just the account owner.

**Resend recipient restriction:** confirmed (via docs + community reports, not fully documented behavior) that without a verified sending domain, Resend only delivers to the email address registered on the Resend account itself — not arbitrary recipients. Jade changed her Resend account email to `appfinclarity@gmail.com`; verified via a direct `POST /emails` API call (using the account's own `RESEND_API_KEY`) that delivery to that address now works — Jade confirmed receipt.

**SMTP configured:** Jade set up Supabase custom SMTP herself in the dashboard (Authentication → SMTP Settings) — no CLI/Management API token was available to do this programmatically. Settings: host `smtp.resend.com`, port `465`, user `resend`, password = Resend API key, sender `onboarding@resend.dev`.

**Verification — done via direct API call, not the UI:** rather than running the full PDF-upload pipeline just to reach the "Save your progress" screen (costly and slow for what's really an SMTP test), replicated the exact failing code path directly: `POST {supabase_url}/auth/v1/signup` with an empty body to create an anonymous session (mirrors `signInAnonymously()`), then `PUT {supabase_url}/auth/v1/user` with `{email, password}` using that session's access token (mirrors `updateUser()`, the call item 13/D1 was blocked on). Response showed no `429`/invalid-email rejection and a populated `email_change_sent_at`. Jade confirmed the confirmation email was received at `appfinclarity@gmail.com`, sent 2026-08-06 18:36:49 UTC. This confirms the underlying bug is fixed; a full UI click-through of the actual "Save your progress" form is still worth doing as a follow-up, along with the item 9 sub-items it was blocking.

**Note:** a browser-automation approach to this verification was attempted first and the tool call was rejected by the user — pivoted to the curl/REST approach instead, which turned out to be a more direct test of the actual bug anyway (no PDF/Claude cost, no browser dependency).

**Updated:** `docs/checklist.md` items 9 and 13 with resolution notes. `.env.local` `RESEND_API_KEY` unchanged; no secrets were pasted into chat (partial key prefix confirmed by matching against `.env.local` server-side rather than echoing the full value).

**Still open:** item 9 sub-items (streak counter, theme persistence, delete-account) and item 13's full UI flow not yet re-verified end-to-end (only the underlying API call was tested); item 16 (insight tiles) still needs a two-card fixture; P1 extraction spot-check against a real bank statement; Devpost listing refresh (undecided); domain purchase deferred — real end-user email delivery still blocked until a domain is verified.

## Session: 2026-08-06 (cont'd) — Scope reshuffle: Paper theme, merchant grouping, and a live-integration research thread

**Trigger:** Jade brought a bundle of new requests: (1) a Kindle-style black-and-white theme + merchant consolidation on transaction lists — concrete, buildable; (2) a much bigger set of exploratory questions about automating transaction capture (Apple Wallet, Android, Plaid-style aggregators, expanding into a "super app" beyond bank/credit-card statements).

**Scope-reversal flag raised:** the original `/scope` session deliberately pivoted away from live bank/card integrations specifically to avoid legal/API complexity, choosing statement-upload to validate the insight engine first (see `/scope` notes above). Points 2–5 of this request reopen exactly that complexity. Flagged this to Jade rather than silently building toward it — recommended a dedicated `/scope` or `/prd` pass on "live transaction capture + reconciliation" before any implementation, since it touches compliance, security surface, and ongoing data-sync infra. Not started; only the concrete item (theme + merchant grouping) was built this session.

**Apple Wallet automation — corrected a false premise before it shaped a design:** there is no public Apple API for third-party apps to read Apple Pay/Wallet transaction data. What's actually possible is a manually-triggered Shortcut (tap to log a note after a purchase) — not automation, just a fast manual-capture UX, which collapses into Jade's own point 4 ("manual tagging layer"). Retailer Wallet passes are only readable if explicitly shared per-file; no bulk read API exists either.

**Android/Samsung parity:** more technically feasible than iOS — `NotificationListenerService` legitimately allows reading other apps' notification content with user permission (how Tasker/MacroDroid-style bank-SMS automations work today). Still fragile (breaks on notification format changes) but a real path, unlike iOS.

**Mobile app necessity:** concluded not necessary — neither platform gives real automated capture, so a native app's main value would be push notifications, camera receipt capture, and biometric login. A Shortcut/Tasker automation just needs an API endpoint to POST to, which a web app can already provide.

**Plaid-alternatives research (background agent, Singapore bank coverage):** Finverse (Singapore-based, explicit DBS/OCBC coverage, self-serve-sounding pricing) is the most realistic option for a solo project. Salt Edge is a plausible second (21 SG institutions listed, public dev sandbox). SGFinDex is the most complete (DBS/OCBC/UOB/SC/HSBC/Citibank/Maybank + CPF/IRAS/HDB via one SingPass consent) but almost certainly requires a formal institutional partnership, not self-serve signup. None confirmed a genuinely free indefinite tier from search alone — would need direct signup to verify. Purely research — nothing provisioned or built.

**Built this session — Paper theme + merchant consolidation:** see `docs/checklist.md` items 22–23 for full implementation detail. Notable moments:
- User initially asked for the theme as either "full app-wide" or "dashboard+breakdown only" (the two options I offered); the actual answer — "add as an additional theme" — meant a third Settings toggle alongside Light/Dark, not a page-scoped restyle. Good reminder to read reformulated answers carefully rather than mapping them onto the offered options.
- For merchant grouping, Jade asked me to just pick — went with grouped-by-default-with-per-merchant-expand over a page-wide list/grouped mode toggle, reasoning: matches the existing `CategoryView` pattern, one mental model instead of a mode switch, less state.
- Found two components (`SummaryCards.tsx`, `NarrativeSummary.tsx`) using hardcoded inline hex colours instead of Tailwind classes — the app's existing dark-theme technique (override specific Tailwind utility classes via a `.dark` ancestor class) can't reach inline styles at all. Refactored those two files to reference new CSS custom properties instead, which is now the pattern to follow if a third theme-dependent color is ever needed on an inline-styled element.
- Hit a stale Turbopack CSS cache during verification (new `.paper` rules weren't in the served bundle at all) — required `.next` wipe + restart, not a code bug.
- Found and fixed a **pre-existing** hydration warning on `<html className>` in `app/layout.tsx` (missing `suppressHydrationWarning`) — was already latent for the Dark theme, just hadn't been noticed until actively testing theme switching.
- A browser-automation call was rejected mid-session during earlier SMTP testing; for this UI work switched back to browser tools since curl can't verify visual/design changes — worked fine this time. Confirms the earlier rejection was context-specific (that particular testing approach), not a standing "no browser" preference.
- Verified merchant grouping without spending Claude API credits or needing a real PDF: seeded `sessionStorage`'s anonymous-upload payload directly with fixture JSON matching the shape `app/breakdown/page.tsx` expects, then loaded the page normally. Reusable technique for testing anonymous-flow UI going forward.

**Still open:** the live-integration research (Apple Wallet reconciliation, Plaid-alternative selection, Android parity, "super app" scope) awaits a dedicated `/scope` session — not scheduled yet.
