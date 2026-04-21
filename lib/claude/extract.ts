import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedTransaction } from '@/types'

const client = new Anthropic()

export interface ExtractResult {
  transactions: ExtractedTransaction[]
  bankName: string
  statementType: 'credit_card' | 'bank_account'
  accountLast4: string
  dateRange: { start: string; end: string }
  detectedCurrency: string
}

const PROMPT_VERSION = '1.0'
export { PROMPT_VERSION as EXTRACT_PROMPT_VERSION }

export async function extractTransactions(rawText: string): Promise<ExtractResult> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 8096,
    messages: [
      {
        role: 'user',
        content: `You are a financial data extraction assistant.

Given the raw text of a Singapore bank statement, extract all transactions and return a JSON object.

IMPORTANT — DO NOT extract or include anywhere in your response:
- Account holder name
- Full account or card number (last 4 digits only is fine)
- Home or mailing address
- NRIC or passport number
- Date of birth
- Phone number or email address

Return ONLY a valid JSON object with this exact structure:
{
  "bankName": "string — detected bank name e.g. DBS, OCBC, UOB, Maybank, CIMB, Standard Chartered",
  "statementType": "credit_card" or "bank_account",
  "accountLast4": "string — last 4 digits of the account or card number",
  "dateRange": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "detectedCurrency": "SGD",
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "merchant": "string — merchant or counterparty name, cleaned up",
      "amount": number — positive value always,
      "currency": "SGD, MYR, USD etc — ISO 4217",
      "originalAmount": number — same as amount if currency is SGD,
      "bankRate": number or null — bank's applied exchange rate if stated in statement,
      "bankRateSGD": number or null — exact SGD amount charged by bank if stated,
      "category": "string — your best category: Food & Dining, Transport, Shopping, Utilities, Entertainment, Health, Travel, Income, Transfer, or Other",
      "type": "income", "expense", or "transfer",
      "accountLast4": "string — last 4 digits this transaction belongs to"
    }
  ]
}

Rules:
- Extract ALL transaction rows. Do not summarise or skip any.
- For type: credit card purchases = "expense". Payments/credits = "income". PayNow/FAST/GIRO between own accounts = "transfer".
- If a field is not present in the statement, use null.
- FOREIGN CURRENCY: OCBC and other Singapore banks show foreign transactions with the SGD charge on the transaction line, followed by a line "FOREIGN CURRENCY [CODE] [AMOUNT]" — where [CODE] is ANY ISO 4217 currency code (USD, SEK, EUR, GBP, MYR, AUD, JPY, HKD, CNY, DKK, NOK, CHF, etc.). When you see this pattern for ANY currency code, set currency to that code, originalAmount to that foreign value, and amount to the SGD charge on the transaction line above. Do not limit this only to USD — apply it to every currency code you encounter. Other banks may show it inline (e.g. "SEK 89.00 / 11.20 SGD"). Never default to SGD when a foreign currency line is present.
- Return valid JSON only. No explanation, no markdown, no code fences.

Statement text:
${rawText}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude extraction')
  }

  let parsed: {
    bankName?: string
    statementType?: string
    accountLast4?: string
    dateRange?: { start: string; end: string }
    detectedCurrency?: string
    transactions?: Array<{
      date: string
      merchant: string
      amount: number
      currency: string
      originalAmount: number
      bankRate: number | null
      bankRateSGD: number | null
      category: string
      type: string
      accountLast4: string
    }>
  }

  try {
    // Strip markdown code fences if Claude wraps the JSON
    const text = content.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    parsed = JSON.parse(text)
  } catch {
    throw new Error(`Claude returned invalid JSON: ${content.text.substring(0, 200)}`)
  }

  const now = new Date()
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const transactions: ExtractedTransaction[] = (parsed.transactions ?? []).map((tx) => ({
    date: tx.date,
    merchant: tx.merchant,
    amount: Math.abs(tx.amount),
    currency: tx.currency || 'SGD',
    originalAmount: Math.abs(tx.originalAmount ?? tx.amount),
    bankRate: tx.bankRate ?? null,
    bankRateSGD: tx.bankRateSGD ?? null,
    category: tx.category || 'Other',
    type: (['income', 'expense', 'transfer'].includes(tx.type) ? tx.type : 'expense') as ExtractedTransaction['type'],
    accountLast4: tx.accountLast4 || parsed.accountLast4 || '0000',
  }))

  return {
    transactions,
    bankName: parsed.bankName || 'Unknown Bank',
    statementType: parsed.statementType === 'credit_card' ? 'credit_card' : 'bank_account',
    accountLast4: parsed.accountLast4 || '0000',
    dateRange: {
      start: parsed.dateRange?.start || defaultStart,
      end: parsed.dateRange?.end || defaultEnd,
    },
    detectedCurrency: parsed.detectedCurrency || 'SGD',
  }
}
