ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_plan       TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_plan IN ('free', 'growth', 'pro'));
