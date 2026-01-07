-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- 2. Insert Default Categories
INSERT INTO expense_categories (name) VALUES 
('MANGIME'), 
('VETERINARIO'), 
('MANUTENZIONE'), 
('PULIZIA'), 
('ATTREZZATURA'), 
('ALTRO')
ON CONFLICT (name) DO NOTHING;

-- 3. Add category_id to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES expense_categories(id);

-- 4. Set default category for existing products
-- Assuming 'MANGIME' has an ID (usually 1 if inserted first, but let's query it safely)
UPDATE products 
SET category_id = (SELECT id FROM expense_categories WHERE name = 'MANGIME')
WHERE category_id IS NULL;
