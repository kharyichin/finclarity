export interface User {
  id: string
  email: string | null
  created_at: string
  has_completed_onboarding: boolean
  theme: 'light' | 'dark'
  check_in_day: number | null
  age_bracket: '18-24' | '25-34' | '35-44' | '45-54' | '55+' | null
  gender: 'female' | 'male' | 'non-binary' | 'prefer_not_to_say' | null
  analytics_consent: boolean
}

export interface Statement {
  id: string
  user_id: string
  file_hash: string
  bank_name: string | null
  bank_country: string
  statement_type: 'credit_card' | 'bank_account' | null
  account_last4: string | null
  month_year: string | null
  period_start: string | null
  period_end: string | null
  is_complete_month: boolean | null
  status: 'processing' | 'needs_password' | 'extracted' | 'complete' | 'failed'
  extraction_prompt_version: string | null
  uploaded_at: string
}

export interface Transaction {
  id: string
  user_id: string
  statement_id: string
  date: string
  merchant: string
  amount: number
  currency: string
  sgd_amount: number | null
  original_amount: number | null
  bank_rate: number | null
  bank_rate_sgd: number | null
  estimated_rate_sgd: number | null
  exchange_rate_source: 'bank' | 'estimated' | null
  claude_category: string | null
  user_category: string | null
  type: 'income' | 'expense' | 'transfer' | 'internal_transfer'
  transfer_pair_id: string | null
  account_last4: string | null
  bank_name: string | null
  month_year: string | null
}

export interface MonthlyReport {
  id: string
  user_id: string
  month_year: string
  narrative_text: string | null
  summary_cards_json: SummaryCards | null
  observations_json: Observation[] | null
  nudges_json: Nudge[] | null
  generated_at: string
  prompt_version: string | null
}

export interface SummaryCards {
  spent: number
  saved: number
  top_category: string
  watchout: string
}

export interface Observation {
  type: string
  message: string
  merchant: string | null
  amount_change: number | null
}

export interface Nudge {
  message: string
  pattern: string | null
  predicted_date: string | null
}

export interface CheckIn {
  id: string
  user_id: string
  month_year: string
  checked_in_at: string
}

export interface ExchangeRates {
  id: string
  base_currency: string
  rates_json: Record<string, number>
  updated_at: string
}

export interface TransactionSummary {
  month_year: string
  total_spent: number
  total_saved: number
  top_category: string
  transactions: Transaction[]
}
