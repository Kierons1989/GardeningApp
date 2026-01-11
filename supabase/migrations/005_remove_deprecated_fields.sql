-- Migration: Remove Deprecated Fields
-- Removes ai_care_profile and plant_type columns from plants table
-- These are replaced by the plant_types reference system

-- Remove deprecated ai_care_profile column (now stored in plant_types)
ALTER TABLE plants DROP COLUMN IF EXISTS ai_care_profile;

-- Remove deprecated plant_type text column (replaced by plant_type_id FK)
ALTER TABLE plants DROP COLUMN IF EXISTS plant_type;

-- Add comment to document the migration
COMMENT ON TABLE plants IS 'User plant collection. Care profiles are now stored in plant_types table via plant_type_id foreign key.';
