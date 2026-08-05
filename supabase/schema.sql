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
  analytics_consent         boolean DEFAULT false,
  monthly_budget            numeric(12,2),
  category_budgets          jsonb DEFAULT '{}'::jsonb
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

-- ============================================================
-- Row Level Security
-- The app has no service-role key anywhere (see lib/supabase/server.ts and
-- lib/supabase/client.ts) — every request authenticates as the calling
-- user's own session via the public anon key. RLS is the ONLY thing
-- enforcing that a user can only read/write their own rows. Re-run this
-- section any time this schema is applied to a new project — a project
-- with RLS enabled by default but no policies denies ALL access, including
-- a user's own legitimate self-access; a project with RLS off entirely
-- exposes every user's data to anyone holding the public anon key.
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_delete_own" ON public.users;
CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE USING (auth.uid() = id);

DROP POLICY IF EXISTS "statements_all_own" ON public.statements;
CREATE POLICY "statements_all_own" ON public.statements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_all_own" ON public.transactions;
CREATE POLICY "transactions_all_own" ON public.transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "monthly_reports_all_own" ON public.monthly_reports;
CREATE POLICY "monthly_reports_all_own" ON public.monthly_reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "check_ins_all_own" ON public.check_ins;
CREATE POLICY "check_ins_all_own" ON public.check_ins
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Shared reference data, not user-scoped — readable by any signed-in
-- session (including anonymous), not writable by any client role. Nothing
-- in the app currently writes to this table.
DROP POLICY IF EXISTS "exchange_rates_read_all" ON public.exchange_rates;
CREATE POLICY "exchange_rates_read_all" ON public.exchange_rates
  FOR SELECT USING (auth.role() = 'authenticated');
