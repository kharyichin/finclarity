-- FinClarity Database Schema
-- Run this once in the Supabase SQL editor for your project.

-- ============================================================
-- users
-- Mirrors auth.users: id comes from Supabase auth (anonymous or real).
-- A trigger auto-creates this row when Supabase creates any new auth user.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                     text UNIQUE,
  created_at                timestamptz DEFAULT now(),
  has_completed_onboarding  boolean DEFAULT false,
  theme                     text DEFAULT 'light',
  check_in_day              integer CHECK (check_in_day BETWEEN 1 AND 28),
  age_bracket               text,
  gender                    text,
  analytics_consent         boolean DEFAULT false
);

-- Auto-create a public.users row whenever Supabase creates an auth user
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- statements
-- ============================================================
CREATE TABLE IF NOT EXISTS statements (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_hash                 text NOT NULL,
  bank_name                 text,
  bank_country              text DEFAULT 'SG',
  statement_type            text,
  account_last4             text,
  month_year                text,
  period_start              date,
  period_end                date,
  is_complete_month         boolean,
  status                    text DEFAULT 'processing',
  extraction_prompt_version text,
  uploaded_at               timestamptz DEFAULT now(),
  UNIQUE (user_id, file_hash),
  UNIQUE (user_id, bank_name, account_last4, month_year)
);

-- ============================================================
-- transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  statement_id          uuid NOT NULL REFERENCES statements(id) ON DELETE CASCADE,
  date                  date NOT NULL,
  merchant              text NOT NULL,
  amount                numeric(12,2) NOT NULL,
  currency              text NOT NULL,
  sgd_amount            numeric(12,2),
  original_amount       numeric(12,2),
  bank_rate             numeric(10,6),
  bank_rate_sgd         numeric(12,2),
  estimated_rate_sgd    numeric(12,2),
  exchange_rate_source  text,
  claude_category       text,
  user_category         text,
  type                  text,
  transfer_pair_id      uuid,
  account_last4         text,
  bank_name             text,
  month_year            text
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_month
  ON transactions (user_id, month_year);

-- ============================================================
-- monthly_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS monthly_reports (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year          text NOT NULL,
  narrative_text      text,
  summary_cards_json  jsonb,
  observations_json   jsonb,
  nudges_json         jsonb,
  generated_at        timestamptz DEFAULT now(),
  prompt_version      text,
  UNIQUE (user_id, month_year)
);

-- ============================================================
-- check_ins
-- ============================================================
CREATE TABLE IF NOT EXISTS check_ins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_year    text NOT NULL,
  checked_in_at timestamptz DEFAULT now(),
  UNIQUE (user_id, month_year)
);

-- ============================================================
-- exchange_rates
-- ============================================================
CREATE TABLE IF NOT EXISTS exchange_rates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency   text DEFAULT 'SGD',
  rates_json      jsonb,
  updated_at      timestamptz DEFAULT now()
);
