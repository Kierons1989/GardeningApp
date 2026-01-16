-- Migration: Enforce one generic (no cultivar) plant per type per user
-- This allows users to have multiple cultivars of the same type,
-- but only one "generic" entry (where cultivar_name is null or empty)

CREATE UNIQUE INDEX idx_one_generic_per_type
ON plants(user_id, plant_type_id)
WHERE (cultivar_name IS NULL OR cultivar_name = '');
