-- Supabase function to update partner wallet
CREATE OR REPLACE FUNCTION update_partner_wallet(
  partner_id INTEGER,
  amount NUMERIC,
  transaction_type TEXT,
  description TEXT,
  payment_id TEXT DEFAULT NULL,
  order_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
  transaction_id UUID;
BEGIN
  -- Get current wallet balance
  SELECT wallet_balance INTO current_balance
  FROM partners
  WHERE id = partner_id;
  
  -- Calculate new balance
  IF transaction_type = 'credit' THEN
    new_balance := current_balance + amount;
  ELSIF transaction_type = 'debit' THEN
    new_balance := current_balance - amount;
  ELSE
    RAISE EXCEPTION 'Invalid transaction type: %', transaction_type;
  END IF;
  
  -- Update partner wallet balance
  UPDATE partners
  SET wallet_balance = new_balance,
      updated_at = NOW()
  WHERE id = partner_id;
  
  -- Insert wallet transaction record
  INSERT INTO wallet_transactions (
    partner_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description,
    reference_id,
    reference_type,
    status,
    created_at
  ) VALUES (
    partner_id,
    transaction_type,
    amount,
    current_balance,
    new_balance,
    description,
    payment_id,
    'razorpay_payment',
    'completed',
    NOW()
  ) RETURNING id INTO transaction_id;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'old_balance', current_balance,
    'new_balance', new_balance,
    'amount', amount,
    'transaction_type', transaction_type
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to update wallet'
    );
END;
$$;
