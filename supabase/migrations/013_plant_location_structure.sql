-- Migration: Add structured location fields to plants table
-- This replaces free-text area field with structured location selection

-- Add new structured location fields
ALTER TABLE plants
ADD COLUMN location_type text CHECK (location_type IN ('front_garden', 'back_garden', 'patio', 'other')),
ADD COLUMN location_custom text,
ADD COLUMN location_protection text CHECK (location_protection IN ('greenhouse', 'polytunnel', 'cold_frame'));

-- Add index for filtering by location_type
CREATE INDEX idx_plants_location_type ON plants(location_type);

-- Migrate existing area data to new structure
UPDATE plants SET
  location_type = CASE
    WHEN LOWER(area) LIKE '%front%' THEN 'front_garden'
    WHEN LOWER(area) LIKE '%back%' THEN 'back_garden'
    WHEN LOWER(area) LIKE '%patio%' THEN 'patio'
    WHEN area IS NOT NULL AND area != '' THEN 'other'
    ELSE NULL
  END,
  location_custom = CASE
    WHEN LOWER(area) NOT LIKE '%front%'
     AND LOWER(area) NOT LIKE '%back%'
     AND LOWER(area) NOT LIKE '%patio%'
     AND area IS NOT NULL
     AND area != ''
    THEN area
    ELSE NULL
  END
WHERE area IS NOT NULL AND area != '';

-- Mark legacy area field as deprecated (keep for backwards compatibility)
COMMENT ON COLUMN plants.area IS 'DEPRECATED: Use location_type, location_custom, location_protection instead';
