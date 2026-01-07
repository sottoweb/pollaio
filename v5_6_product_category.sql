-- Add category column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'MANGIME';

-- Update existing products to default category 'MANGIME'
UPDATE products SET category = 'MANGIME' WHERE category IS NULL OR category = '';
