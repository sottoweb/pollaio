-- Tabella per registrare la raccolta giornaliera delle uova
CREATE TABLE IF NOT EXISTS egg_production (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    color VARCHAR(50) NOT NULL, -- Es: 'ROSA', 'BIANCO', 'VERDE', 'CIOCCOLATO'
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per ricerche veloci per data e colore
CREATE INDEX IF NOT EXISTS idx_egg_production_date ON egg_production(date);
CREATE INDEX IF NOT EXISTS idx_egg_production_color ON egg_production(color);

-- Policy RLS (se abilitate, ma per ora usiamo accesso standard)
ALTER TABLE egg_production ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access" ON egg_production
    FOR ALL USING (true);
