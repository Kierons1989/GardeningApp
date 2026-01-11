-- Migration: User Location and Climate Zones
-- Adds location and climate zone fields to user profiles for personalized care advice

-- Add location and climate_zone columns to profiles
DO $$
BEGIN
  -- Add location column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
  END IF;

  -- Add climate_zone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'climate_zone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN climate_zone INT;
  END IF;
END $$;

-- Add constraint to validate climate zone is between 7-10 (UK USDA zones)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'profiles' AND constraint_name = 'valid_climate_zone'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT valid_climate_zone
      CHECK (climate_zone IS NULL OR (climate_zone BETWEEN 7 AND 10));
  END IF;
END $$;

-- Add index for climate zone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_climate_zone ON profiles(climate_zone);

-- Add comments
COMMENT ON COLUMN profiles.location IS 'User''s town or city for climate zone calculation (e.g., "Birmingham", "Edinburgh")';
COMMENT ON COLUMN profiles.climate_zone IS 'USDA hardiness zone (7-10) calculated from location. Zone 8 is default for most of UK.';
