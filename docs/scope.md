# FinClarity — Personal Finance Intelligence, Simplified

## Idea
A statement-upload finance app that gives users — from beginners to the financially savvy — a clear, narrative monthly picture of their money: where it went, what changed, and what to watch next. Singapore-first, built for the cross-border reality of modern life.

## Who It's For
**Primary:** Singapore residents who feel their finances are fragmented — accounts across multiple banks, digital wallets, maybe overseas accounts — and currently have no unified view. Tracks across: DBS, OCBC, UOB, Maybank, and other regional banks.

**Audience range:** Deliberately wide — teenagers tracking spending for the first time, young adults building financial habits, working adults managing cross-border income or investments, older users who've never had a simple tool for this. Also serves the underbanked who may have limited formal finance experience.

**The underserved gap:** SGFinDex exists but has incomplete bank participation and doesn't provide meaningful insight. Most users still track via Excel or not at all. This app fills that gap without requiring API integration or regulatory licensing.

## Inspiration & References
- **[Monarch Money](https://www.monarch.com/)** — UX/UI direction. Clean, comprehensive financial command center. Design energy to draw from.
- **[Emma App](https://emma-app.com/)** — Cross-border capability and multi-currency as a first-class feature, not a bolt-on.
- **[Copilot Money](https://www.copilot.money/)** — Breadth of institution coverage; AI categorization model.
- **Duolingo** — Retention and habit loop inspiration. Identity-building ("I'm someone who tracks their money") over pure utility. Streak or monthly check-in mechanic.

**Design direction:** Colorful, warm, and simple — not the corporate grey-and-navy "serious AI app" aesthetic. Nature-influenced, calm, approachable. Clean and functional over flashy. Finance should not feel daunting — the visual language should reflect that.

## Goals
- Make personal finance feel non-intimidating and accessible for everyone, including first-timers
- Give users a unified view of their money across banks, cards, wallets — without requiring live API integration
- Surface meaningful patterns over time (not just monthly snapshots)
- Build a habit — users should want to come back each month
- Fill the SGFinDex gap for Singapore users managing complex, cross-border financial lives
- Establish a foundation that can grow toward investment nudges and net worth tracking

## What "Done" Looks Like
After 3-4 hours of build, the app:
1. **Accepts statement uploads** — PDF bank statements (including password-protected files; user enters their statement password at upload time, password used transiently in memory, never stored)
2. **Extracts and stores structured transaction data** — date, merchant, amount, category (MCC codes where available for credit cards). Raw PDF and password discarded after extraction.
3. **Generates a monthly narrative report** with:
   - Top spending categories this month
   - Month-over-month comparison: what changed and a plain-language explanation of why
   - Watchdog flags: recurring charges that crept up, bills at risk of being missed, debt repayment patterns worth watching
   - Forward-looking nudge: 1-2 non-paternalistic observations for next month
4. **Multi-currency support** — SGD as default; transactions in other currencies converted for summary view, with local currency visible on drill-down
5. **Progress-first framing** — opens with wins and momentum ("you spent less on food," "you have $X more than last month"), not a raw net worth number that could demoralise

**Retention mechanic:** Monthly check-in loop tied to natural finance moments (payday, end of month). Habit-building language — identity ("you're building a clearer picture of your money") over judgment.

## What's Explicitly Cut
| Feature | Rationale |
|---|---|
| Live bank API / Plaid integration | Legal complexity, MAS licensing risk, out of scope for v1 |
| Crypto wallet integration | Data format complexity, out of scope |
| Tangible asset tracking (property) | Hard to capture reliably, different data problem |
| Investment recommendations | Requires regulated financial advice license |
| Brokerage / investment account sync | Phase 2 — net worth at a glance is a v2 feature |
| Promotions / merchant offers | Monetisation layer, not core product |
| Manual transaction input | Diminishes core value; edge case users can contact their bank |
| Saving statement passwords | Not needed — SG bank passwords are NRIC/DOB; device keychain is v2 |
| Social / comparison features | Not in scope |

## Loose Implementation Notes
- **PDF parsing:** Python-based (`pdfplumber` or `pypdf`) — handles password-protected PDFs natively; password passed in memory, discarded immediately
- **Data model:** Store extracted transaction records (date, merchant, amount, category, currency, source account last-4) — never raw documents
- **PII handling:** Parser reads only transaction rows; name, address, full account number never extracted or stored. PDPA-compliant by design (data minimisation, user consent, right to erasure).
- **Currency:** Store original currency + SGD-equivalent at time of upload; summary view shows SGD totals with toggle to local currency
- **Categorisation:** MCC codes for credit card transactions where available; fallback to merchant-name pattern matching
- **Architecture:** Web app (not native mobile) is the right call for a hackathon build — upload flow is natural in a browser
