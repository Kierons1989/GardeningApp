-- Add plant state and per-plant care profile columns
-- plant_state: tracks current growth stage, environment, health for contextual care
-- ai_care_profile: per-plant override of the shared plant_type care profile

ALTER TABLE plants ADD COLUMN IF NOT EXISTS plant_state JSONB DEFAULT NULL;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS ai_care_profile JSONB DEFAULT NULL;

COMMENT ON COLUMN plants.plant_state IS 'Current state/context: growth stage, environment, health status';
COMMENT ON COLUMN plants.ai_care_profile IS 'Per-plant care profile override, regenerated when plant state changes';
