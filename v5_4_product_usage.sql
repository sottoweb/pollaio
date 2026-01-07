-- Add usage_count to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Optional: Initialize usage_count based on existing transaction_items
-- This query computes usage count from history
UPDATE products
SET usage_count = (
  SELECT COUNT(*)
  FROM transaction_items
  WHERE transaction_items.product_id = products.id
);
