-- Migration: Add monthly payment tracking fields to enrollments table
-- Run this in the Supabase SQL Editor if you have an existing database

-- Add monthly payment tracking columns to enrollments table
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS monthly_payment_amount DECIMAL(10, 2) DEFAULT 100,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_payment_due TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS monthly_payment_status VARCHAR(20) DEFAULT 'pending';

-- Add constraint for monthly_payment_status
DO $$
BEGIN
  ALTER TABLE enrollments 
  ADD CONSTRAINT enrollments_monthly_payment_status_check 
  CHECK (monthly_payment_status IN ('paid', 'pending', 'overdue'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Update existing approved enrollments to set next_payment_due based on approved_at
UPDATE enrollments 
SET next_payment_due = approved_at + INTERVAL '1 month',
    monthly_payment_status = CASE 
      WHEN approved_at + INTERVAL '1 month' < NOW() THEN 'overdue'
      ELSE 'pending'
    END
WHERE status = 'approved' AND next_payment_due IS NULL AND approved_at IS NOT NULL;

-- Create index for monthly payment status queries
CREATE INDEX IF NOT EXISTS idx_enrollments_monthly_payment_status ON enrollments(monthly_payment_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_next_payment_due ON enrollments(next_payment_due);
