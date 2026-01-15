-- Add lemon_customer_id to subscriptions table for customer portal access
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS lemon_customer_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_customer_id
ON subscriptions(lemon_customer_id);
