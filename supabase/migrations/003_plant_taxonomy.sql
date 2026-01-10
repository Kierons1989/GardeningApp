-- Migration: Plant Taxonomy System
-- Creates hierarchical plant type structure with top/middle levels and growth habits

-- Create plant_types table for reusable plant taxonomy and care profiles
CREATE TABLE IF NOT EXISTS plant_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  top_level TEXT NOT NULL,
  middle_level TEXT NOT NULL,
  growth_habit TEXT[] DEFAULT '{}',
  ai_care_profile JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_plant_taxonomy UNIQUE (top_level, middle_level)
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_plant_types_top_level ON plant_types(top_level);
CREATE INDEX IF NOT EXISTS idx_plant_types_middle_level ON plant_types(middle_level);

-- Add new columns to plants table (use ADD COLUMN IF NOT EXISTS for safety)
DO $$
BEGIN
  -- Add plant_type_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'plant_type_id'
  ) THEN
    ALTER TABLE plants ADD COLUMN plant_type_id UUID REFERENCES plant_types(id);
  END IF;

  -- Add cultivar_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'plants' AND column_name = 'cultivar_name'
  ) THEN
    ALTER TABLE plants ADD COLUMN cultivar_name TEXT;
  END IF;
END $$;

-- Add index for plant_type relationship
CREATE INDEX IF NOT EXISTS idx_plants_plant_type ON plants(plant_type_id);

-- Update care_profile_cache to support middle_level caching (only if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'care_profile_cache'
  ) THEN
    -- Add middle_level column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'care_profile_cache' AND column_name = 'middle_level'
    ) THEN
      ALTER TABLE care_profile_cache ADD COLUMN middle_level TEXT;
    END IF;
  END IF;
END $$;

-- Create index for middle_level cache lookups
CREATE INDEX IF NOT EXISTS idx_cache_middle_level ON care_profile_cache(middle_level);

-- Add comment to deprecated field
COMMENT ON COLUMN plants.plant_type IS 'Deprecated: Use plant_type_id instead. Old freeform plant type field.';
COMMENT ON COLUMN plants.ai_care_profile IS 'Deprecated: Care profiles now stored in plant_types table. Kept for backward compatibility.';
