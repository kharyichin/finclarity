# FinClarity — Post-MVP Checklist (v1.1)

MVP steps 1–18 are complete (`docs/checklist.md`). This list is the soft-launch sprint.

## Sprint rules

- **Cadence:** 1 focused week × 2 (Week 1 then Week 2)
- **Credit rule:** Prefer thin PRs. If a single agent task looks like it will burn **>1k credits**, stop, leave files as-is, hand that slice to local Claude terminal, then continue the next item here.
- **Git:** Feature branch + PR. Do not push straight to `main`.
- **UX taste:** Apple product-page clarity × Google simplicity. Calm stone/sage. No purple gradients, no “AI-powered” hype copy.
- **Live URLs:** https://getfinclarity.vercel.app/ · `/demo` · `/dashboard`

## Bank coverage order (do not skip tiers)

| Tier | Institutions | When |
|------|----------------|------|
| **T1** | DBS, OCBC, UOB | Week 1 |
| **T2** | Standard Chartered, HSBC, Maybank, CIMB | Week 2 |
| **T3** | Trust Bank, GXS | Later |
| **T4** | YouTrip, Revolut | Later |
| **T5** | SG brokers | Later |
| **T6** | Foreign banks | Last |

Fixture notes (redacted patterns only): `docs/fixtures/t1-statement-patterns.md`

---

## Week 1 — First impression + T1 trust

### Landing (L)

- [x] **L1. Marketing landing page**
  - Build a real intro page (not the demo dashboard).
  - Sections: hero, how it works (3 steps), what you get, works-with (tiered banks), privacy, final CTA.
  - Visual language: lots of whitespace, short copy, product-feeling — not generic AI SaaS.

- [x] **L2. Root routing**
  - Guests hitting `/` see the landing.
  - Signed-in users with completed statements still go to `/dashboard`.
  - Optional: signed-in with no statements → landing or demo (pick one; default landing with CTA).

- [x] **L3. Landing CTAs**
  - Primary: **Try the demo** → `/demo`
  - Secondary: **Sign in** → `/login`
  - Optional tertiary: jump straight into upload (can open demo + upload modal later)

### UX polish (U)

- [x] **U1. Demo entry polish**
  - Clear “this is sample data” without noisy ticker spam.
  - Tooltips: quieter (fewer steps or dismiss-friendlier).
  - Keep path to upload obvious.

- [x] **U2. Chrome consistency (light pass only)**
  - Spacing, type, primary buttons on demo + dashboard shell.
  - No full redesign / no new design system.

### Product reliability (P)

- [ ] **P1. T1 extraction pass (DBS / OCBC / UOB)**
  - Priority: OCBC merchant cleanup (codes like `-2794`, `WWW.TADA.G*`, multi-card consolidated statements).
  - Card product names: `90N` / `90°N`, `Infinity Cashback`, etc.
  - Foreign currency + CCY conversion fee lines.
  - Bump `EXTRACT_PROMPT_VERSION` when prompt changes.
  - **Credit note:** If prompt iteration + live API loops exceed ~1k credits, hand P1 to local Claude terminal; leave partial files committed.

- [x] **P2. T1 fixture documentation**
  - Keep redacted pattern notes in `docs/fixtures/` (no real PDFs, no PII in git).
  - List expected merchants/categories for the known OCBC Apr-26 style statement.

- [x] **P3. Upload error states**
  - Calm copy for: bad/non-PDF, wrong password, timeout, extraction failure.
  - No stack traces in UI.

### Week 1 definition of done

- [x] `/` is a marketing landing with CTA to `/demo`
- [x] Demo feels calmer and still converts to upload
- [ ] OCBC-style consolidated CC text extracts cleaner merchants than before (spot-check)
- [x] Error paths don’t feel broken

---

## Week 2 — Feel finished for soft users

- [x] **P4. T2 prompt extensions** — StanChart, HSBC, Maybank, CIMB
- [x] **P5. Low-confidence / Other review** — minimal UI to fix bad categories
- [x] **P6. Narrative prompt pass** — less mechanical, more “what changed”
  - 2026-08-05: prompt wording itself was fine, but the narrative was fed a hardcoded empty transaction list (`app/api/statements/upload/route.ts`) and so always claimed 100% of spend was in one category — fixed alongside `docs/checklist.md` item 5. Prompt quality now matches the intent of this item.
- [x] **U3. Dashboard top visual** — simple chart beside narrative
- [x] **U4. Landing mobile + bank row polish**
- [x] **P7. FX disclaimer one-liner** (copy already decided in spec)
- [ ] **D1. Resend domain + reminder email smoke test** (only if using check-ins)
  - 2026-08-05: `finclarity.app` DNS is not accessible to us (Cloudflare-managed, no DNS login) — cannot add Resend's SPF/DKIM records to verify the domain. Temporarily switched `from` in `app/api/cron/reminders/route.ts` to Resend's sandbox sender (`onboarding@resend.dev`), which only delivers to the Resend account's own verified email — real user reminders will not go out until domain access is sorted and this is re-verified.

### Week 2 stretch (only if ahead)

- [ ] T3 Trust / GXS
- [ ] T4 YouTrip / Revolut multi-currency labels

---

## Explicitly out (do not pull into v1.1)

- Live bank API / Plaid / SGFinDex
- Investment advice, social benchmarking, Wrapped PNG
- Full streak badge system, storing statement passwords
- Manual transaction entry
- Full app redesign

---

## Suggested PR slices (credit-efficient)

1. `docs/checklist-post-mvp.md` + fixture notes  
2. **L1–L3** landing + routing only  
3. **U1–U2** demo/chrome only  
4. **P3** error copy only  
5. **P1–P2** extraction (or hand to local Claude if expensive)

---

## Progress log

| Date | Item | PR / notes |
|------|------|------------|
| 2026-07-21 | L1–L3 landing + P2 fixtures + U1 demo polish | PR #1 |
| 2026-07-21 | P3 calm upload errors | PR #1 |

| 2026-07-22 | PR #1 merged to main | 88cea1d |
| 2026-07-22 | Week 2: U2, U3, U4, P6, P7 | PR #2 |
| 2026-07-22 | PR #2 merged | b8af3f09 |
| 2026-07-22 | P5 category review UI | PR #3 |
