-- Add Coop ID to associate production with a specific coop
-- Add Recorded At for precise timestamp (date + time)
-- Add Session ID to group multiple color entries into a single "collection event"

ALTER TABLE egg_production 
ADD COLUMN coop_id UUID REFERENCES coops(id),
ADD COLUMN recorded_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN session_id UUID;

-- Create index for performance
CREATE INDEX idx_egg_production_coop ON egg_production(coop_id);
CREATE INDEX idx_egg_production_session ON egg_production(session_id);
CREATE INDEX idx_egg_production_recorded_at ON egg_production(recorded_at);

-- Optional: Update existing records to link to the first coop found (if any) to avoid NULLs issues later if enforcing NOT NULL
-- UPDATE egg_production SET coop_id = (SELECT id FROM coops LIMIT 1) WHERE coop_id IS NULL;
