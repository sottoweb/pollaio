-- Add is_paid column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT TRUE;

-- Update existing transactions to be paid (safe default)
UPDATE transactions SET is_paid = TRUE WHERE is_paid IS NULL;
