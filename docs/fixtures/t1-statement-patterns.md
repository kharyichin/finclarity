# T1 statement patterns (redacted)

**Do not commit real PDFs or PII.** Patterns below are derived from redacted local samples for prompt/fixture work.

## Sample A — OCBC consolidated credit card (Apr 2026 cycle)

| Field | Pattern |
|-------|---------|
| Bank | `OCBC Bank` / Oversea-Chinese Banking Corporation Limited |
| Statement type | Credit card, **multi-card consolidated** |
| Header dates | `STATEMENT DATE` + `PAYMENT DUE DATE` (e.g. 18-04-2026 / 11-05-2026) |
| Card blocks | Separate sections per product, e.g. `OCBC 90.N VISA CARD`, `OCBC INFINITY CASHBACK` |
| Card number line | Name + spaced groups `4831 -3901 -0007 -5359` → use **last 4 only** |
| Column header | `TRANSACTION DATE DESCRIPTION AMOUNT (SGD)` |
| Date format | `DD/MM` on txn lines (year from statement cycle) |
| Merchant noise | Leading internal codes glued to amount/merchant, e.g. `11.98-9215 SHOPEE…`, `12.80-2794 SMP **AMACHA…` |
| Truncation | Merchant names cut mid-word: `THE CARVING BOARD P`, `ORIENTAL KOPI - WES` |
| Digital wallets | `GRAB* A-96NXROQWWN 5`, `WWW .TADA.G* N019 D2E` (spaces inside domain) |
| Transit (Infinity) | `BUS/MRT 816774567 SINGAPORE SGP` |
| FX block | Line 1: SGD amount + merchant; Line 2: `FOREIGN CURRENCY USD 7.45` (+ phone/country) |
| FX fee | `0.21CCY CONVERSION FEE` / `FOR: 20.98 SGD` — fee rows, not merchants |
| Payments | `PAYMENT - VISA DIRECT`, `PAYMENT - MONEY SEND` → type **transfer**, not income |
| Reversals | Amounts in parentheses e.g. `(96.63TRIP.COM…)` → refund/reversal |
| Totals | `SUBTOTAL` / `TOTAL` / `LAST MONTH 'S BALANCE` / `TOTAL AMOUNT DUE` — **not** transactions |
| Cashback | `CASH REBATE` → income / Cashback |
| Card name map | `90.N` / `90°N` → `90N`; `INFINITY CASHBACK` → `Infinity Cashback` |

### Merchant cleanup rules (OCBC)

1. Strip leading `amount-code` glue: prefer merchant text after the 3–4 digit code.  
2. Normalize `WWW .TADA.G*` → `Tada` (or keep readable brand).  
3. Normalize `GRAB* …` → `Grab`.  
4. `BUS/MRT …` → merchant `Bus/MRT`, category Transport.  
5. Ignore pure fee lines (`CCY CONVERSION FEE`) or categorize as Fees/Other expense.  
6. Do not treat `LAST MONTH'S BALANCE`, `SUBTOTAL`, `TOTAL` as txns.

### Expected category hints (from sample merchants)

| Cleaned merchant | Category |
|------------------|----------|
| Shopee | Shopping |
| Spotify | Entertainment |
| Trip.com / Klook | Travel |
| Grab / Tada | Transport |
| NTUC Fairprice / 7-Eleven | Groceries / Shopping |
| Bus/MRT | Transport |
| LinkedIn / Claude.ai | Subscriptions → Other or Utilities (product choice) |
| Restaurants / cafes | Food & Dining |

## Sample B — Standard Chartered savings e-statement (Apr 2026)

| Field | Pattern |
|-------|---------|
| Bank | `Standard Chartered Bank (Singapore) Limited` |
| Statement type | Bank account / savings |
| Tier | **T2** (Week 2) — keep for later prompt work |
| Noise | Long T&Cs, abbreviation guides, tax invoice boilerplate |

Extraction should prefer the transaction table region and skip terms pages.

## T1 still needed from user (local only)

- [ ] DBS credit and/or savings (redacted PDF, not committed)
- [ ] UOB credit and/or savings
- [ ] Second OCBC month (optional, for MoM / dedupe tests)

## How to use in P1

1. Paste redacted text into extraction eval (local).  
2. Adjust `lib/claude/extract.ts` prompt + any post-processors.  
3. Bump `PROMPT_VERSION`.  
4. Spot-check: multi-card OCBC returns two `accountLast4` groups and sane merchants.
