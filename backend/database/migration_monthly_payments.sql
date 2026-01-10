-- Migration: Add monthly payment tracking fields to enrollments table
-- Run this in the Supabase SQL Editor if you have an existing database

-- Add monthly payment tracking columns to enrollments table
DO $$
BEGIN
  -- Add columns one by one to handle IF NOT EXISTS properly
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'enrollments' AND column_name = 'monthly_payment_amount'
  ) THEN
    ALTER TABLE enrollments ADD COLUMN monthly_payment_amount DECIMAL(10, 2) DEFAULT 100;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'enrollments' AND column_name = 'last_payment_date'
  ) THEN
    ALTER TABLE enrollments ADD COLUMN last_payment_date TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'enrollments' AND column_name = 'next_payment_due'
  ) THEN
    ALTER TABLE enrollments ADD COLUMN next_payment_due TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'enrollments' AND column_name = 'monthly_payment_status'
  ) THEN
    ALTER TABLE enrollments ADD COLUMN monthly_payment_status VARCHAR(20) DEFAULT 'pending';
  END IF;
END $$;

-- Add constraint for monthly_payment_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'enrollments_monthly_payment_status_check'
  ) THEN
    ALTER TABLE enrollments 
    ADD CONSTRAINT enrollments_monthly_payment_status_check 
    CHECK (monthly_payment_status IN ('paid', 'pending', 'overdue'));
  END IF;
END $$;

-- Update existing enrollments to set next_payment_due.
-- Try approved_at first, fall back to unlocked_at, then created_at.
DO $$
BEGIN
  -- If approved_at exists, use it for approved enrollments
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'enrollments' AND column_name = 'approved_at'
  ) THEN
    UPDATE enrollments 
    SET next_payment_due = approved_at + INTERVAL '1 month',
        monthly_payment_status = CASE 
          WHEN approved_at + INTERVAL '1 month' < NOW() THEN 'overdue'
          ELSE 'pending'
        END
    WHERE status = 'approved' AND next_payment_due IS NULL AND approved_at IS NOT NULL;
  
  -- Else if unlocked_at exists, use it
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'enrollments' AND column_name = 'unlocked_at'
  ) THEN
    UPDATE enrollments 
    SET next_payment_due = unlocked_at + INTERVAL '1 month',
        monthly_payment_status = CASE 
          WHEN unlocked_at + INTERVAL '1 month' < NOW() THEN 'overdue'
          ELSE 'pending'
        END
    WHERE status IN ('active', 'approved') AND next_payment_due IS NULL AND unlocked_at IS NOT NULL;
  
  -- Fallback to created_at if neither exists
  ELSE
    UPDATE enrollments 
    SET next_payment_due = created_at + INTERVAL '1 month',
        monthly_payment_status = CASE 
          WHEN created_at + INTERVAL '1 month' < NOW() THEN 'overdue'
          ELSE 'pending'
        END
    WHERE status IN ('active', 'approved') AND next_payment_due IS NULL;
  END IF;
END $$;

-- Create index for monthly payment status queries
CREATE INDEX IF NOT EXISTS idx_enrollments_monthly_payment_status ON enrollments(monthly_payment_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_next_payment_due ON enrollments(next_payment_due);
