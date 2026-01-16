-- User credits table - tracks remaining and total used credits
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credits_remaining INT NOT NULL DEFAULT 0,
  credits_used_total INT NOT NULL DEFAULT 0,
  last_refill_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Credit transactions table - logs all credit changes
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL, -- positive = add, negative = use
  type TEXT NOT NULL, -- 'subscription_refill', 'purchase', 'generation', 'bonus', 'refund'
  metadata JSONB DEFAULT '{}', -- { quality: 'premium', carousel_id: '...', project_id: '...' }
  balance_after INT NOT NULL, -- credits_remaining after this transaction
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- Row Level Security
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- User credits policies
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow insert for new users (typically done via trigger or server-side)
CREATE POLICY "Users can create own credits record"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Transactions are created server-side only (no direct user insert)
-- We'll use service role for inserts

-- Apply updated_at trigger to user_credits
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to initialize credits for new users
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits_remaining, credits_used_total)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create credits record when user is created
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_credits();

-- Function to safely deduct credits (returns true if successful)
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INT,
  p_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INT;
  v_new_balance INT;
BEGIN
  -- Get current balance with row lock
  SELECT credits_remaining INTO v_current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user has enough credits
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Update credits
  UPDATE user_credits
  SET
    credits_remaining = v_new_balance,
    credits_used_total = credits_used_total + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, type, metadata, balance_after)
  VALUES (p_user_id, -p_amount, p_type, p_metadata, v_new_balance);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INT,
  p_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS INT AS $$
DECLARE
  v_new_balance INT;
BEGIN
  -- Update credits and get new balance
  UPDATE user_credits
  SET
    credits_remaining = credits_remaining + p_amount,
    last_refill_at = CASE WHEN p_type = 'subscription_refill' THEN NOW() ELSE last_refill_at END,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING credits_remaining INTO v_new_balance;

  -- If user doesn't exist, create record
  IF v_new_balance IS NULL THEN
    INSERT INTO user_credits (user_id, credits_remaining, credits_used_total, last_refill_at)
    VALUES (p_user_id, p_amount, 0, CASE WHEN p_type = 'subscription_refill' THEN NOW() ELSE NULL END)
    RETURNING credits_remaining INTO v_new_balance;
  END IF;

  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, type, metadata, balance_after)
  VALUES (p_user_id, p_amount, p_type, p_metadata, v_new_balance);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
