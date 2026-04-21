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

### Step 1: Database schema
- **What was built:** `supabase/schema.sql` with all 6 tables (`users`, `statements`, `transactions`, `monthly_reports`, `check_ins`, `exchange_rates`). Includes foreign keys, cascade deletes, unique constraints, and a trigger to auto-create a `public.users` row when Supabase creates any auth user.
- **Schema correction mid-step:** Initial draft was missing the `auth.users` linkage (needed for anonymous auth to work) and the period duplicate constraint on `statements`. Both were caught before verification and fixed.
- **Verification:** Jade confirmed all 6 tables appeared in Supabase Table Editor. RLS left off intentionally — acceptable for hackathon.
- **Issues:** Jade initially pasted the file path into the SQL editor instead of the file contents — resolved with guidance. No SQL errors on run.
