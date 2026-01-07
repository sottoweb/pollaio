-- Add priority column to products table for manual sorting
-- Default 0. Higher numbers appear first in lists.
ALTER TABLE products ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
