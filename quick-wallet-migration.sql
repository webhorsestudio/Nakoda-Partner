-- Quick Migration Script for Wallet Transactions Table
-- Run this in your Supabase SQL Editor if the table doesn't exist

-- Check if wallet_transactions table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN
        -- Create wallet_transactions table
        CREATE TABLE public.wallet_transactions (
            id SERIAL NOT NULL,
            partner_id INTEGER NOT NULL,
            transaction_type VARCHAR(20) NOT NULL,
            amount NUMERIC(12, 2) NOT NULL,
            balance_before NUMERIC(12, 2) NOT NULL,
            balance_after NUMERIC(12, 2) NOT NULL,
            description TEXT NOT NULL,
            reference_id VARCHAR(100) NULL,
            reference_type VARCHAR(50) NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'completed',
            metadata JSONB NULL,
            processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            
            CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
            CONSTRAINT wallet_transactions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE,
            CONSTRAINT wallet_transactions_type_check CHECK (
                transaction_type IN ('credit', 'debit', 'refund', 'commission', 'adjustment')
            ),
            CONSTRAINT wallet_transactions_status_check CHECK (
                status IN ('pending', 'completed', 'failed', 'cancelled')
            ),
            CONSTRAINT wallet_transactions_amount_check CHECK (amount > 0.00),
            CONSTRAINT wallet_transactions_balance_check CHECK (balance_after >= 0.00)
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_wallet_transactions_partner_id ON public.wallet_transactions USING btree (partner_id);
        CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions USING btree (transaction_type);
        CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON public.wallet_transactions USING btree (status);
        CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions USING btree (created_at);
        CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference ON public.wallet_transactions USING btree (reference_id, reference_type);
        CREATE INDEX IF NOT EXISTS idx_wallet_transactions_partner_created ON public.wallet_transactions USING btree (partner_id, created_at DESC);

        RAISE NOTICE 'wallet_transactions table created successfully';
    ELSE
        RAISE NOTICE 'wallet_transactions table already exists';
    END IF;
END $$;

-- Check if partners table has wallet columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'partners' AND column_name = 'wallet_balance') THEN
        -- Add wallet columns to partners table
        ALTER TABLE public.partners 
        ADD COLUMN wallet_balance NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN available_balance NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN pending_balance NUMERIC(12, 2) DEFAULT 0.00,
        ADD COLUMN wallet_status VARCHAR(20) DEFAULT 'active',
        ADD COLUMN last_transaction_at TIMESTAMP WITH TIME ZONE NULL,
        ADD COLUMN wallet_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ADD COLUMN wallet_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

        -- Add constraints
        ALTER TABLE public.partners 
        ADD CONSTRAINT partners_wallet_balance_check CHECK (wallet_balance >= 0.00),
        ADD CONSTRAINT partners_available_balance_check CHECK (available_balance >= 0.00),
        ADD CONSTRAINT partners_pending_balance_check CHECK (pending_balance >= 0.00),
        ADD CONSTRAINT partners_wallet_status_check CHECK (
            wallet_status IN ('active', 'suspended', 'frozen', 'closed')
        );

        -- Update existing partners with default wallet values
        UPDATE public.partners 
        SET 
            wallet_balance = 0.00,
            available_balance = 0.00,
            pending_balance = 0.00,
            wallet_status = 'active',
            wallet_created_at = COALESCE(created_at, NOW()),
            wallet_updated_at = NOW()
        WHERE wallet_balance IS NULL;

        RAISE NOTICE 'Wallet columns added to partners table successfully';
    ELSE
        RAISE NOTICE 'Wallet columns already exist in partners table';
    END IF;
END $$;
