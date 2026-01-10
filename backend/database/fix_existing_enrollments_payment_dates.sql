-- Fix existing active enrollments to have monthly payment tracking
-- Run this AFTER running migration_monthly_payments.sql

-- Update active enrollments that don't have next_payment_due set
UPDATE enrollments 
SET 
  next_payment_due = COALESCE(unlocked_at, created_at) + INTERVAL '1 month',
  monthly_payment_status = CASE 
    WHEN COALESCE(unlocked_at, created_at) + INTERVAL '1 month' < NOW() THEN 'overdue'
    ELSE 'pending'
  END,
  last_payment_date = COALESCE(unlocked_at, created_at),
  monthly_payment_amount = COALESCE(monthly_payment_amount, 100)
WHERE 
  status IN ('active', 'approved') 
  AND next_payment_due IS NULL;

-- Verify the update
SELECT 
  id,
  user_id,
  status,
  unlocked_at,
  next_payment_due,
  monthly_payment_status,
  monthly_payment_amount,
  CASE 
    WHEN next_payment_due < NOW() THEN CONCAT('Overdue by ', EXTRACT(DAY FROM NOW() - next_payment_due), ' days')
    ELSE CONCAT(EXTRACT(DAY FROM next_payment_due - NOW()), ' days until due')
  END as payment_status_description
FROM enrollments
WHERE status IN ('active', 'approved')
ORDER BY next_payment_due;
