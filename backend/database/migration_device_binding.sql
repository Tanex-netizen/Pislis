-- Migration: Add device binding to users table
-- This prevents users from sharing accounts across multiple devices
-- Admin users are exempt from this restriction

-- Add device_token column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS device_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_bound_at TIMESTAMPTZ;

-- Create index for faster device token lookups
CREATE INDEX IF NOT EXISTS idx_users_device_token ON users(device_token);

-- Add comment for documentation
COMMENT ON COLUMN users.device_token IS 'Unique device identifier to prevent account sharing. NULL means no device bound yet.';
COMMENT ON COLUMN users.device_bound_at IS 'Timestamp when the device was first bound to this account.';
