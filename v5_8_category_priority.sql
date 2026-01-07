-- Add priority to expense_categories for sorting
ALTER TABLE expense_categories ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Set default priorities (Higher shows first)
UPDATE expense_categories SET priority = 100 WHERE name = 'MANGIME';
UPDATE expense_categories SET priority = 90 WHERE name = 'VETERINARIO';
UPDATE expense_categories SET priority = 80 WHERE name = 'MANUTENZIONE';
UPDATE expense_categories SET priority = 70 WHERE name = 'PULIZIA';
UPDATE expense_categories SET priority = 60 WHERE name = 'ATTREZZATURA';
UPDATE expense_categories SET priority = 10 WHERE name = 'ALTRO';
