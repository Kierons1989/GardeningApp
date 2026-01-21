-- Migration: Enable Row Level Security on plant_types table
--
-- Background:
-- The plant_types table stores shared reference data (plant taxonomy and AI-generated
-- care profiles) that all authenticated users can access. Previously RLS was not enabled,
-- which Supabase Security Advisor flagged as a security concern.
--
-- This migration enables RLS while preserving the existing access patterns:
-- - All authenticated users can read plant types (shared reference data)
-- - Authenticated users can insert/update via API routes
-- - The unique constraint on (top_level, middle_level) prevents duplicates
--
-- No breaking changes: all current access goes through authenticated requests.

-- Enable Row Level Security
ALTER TABLE public.plant_types ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read plant types
-- Rationale: Plant types are shared reference data, not user-specific
CREATE POLICY "authenticated_read_plant_types"
ON public.plant_types
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert new plant types
-- Rationale: New plant types are created via /api/ai/generate-type-profile
-- The unique constraint on (top_level, middle_level) prevents duplicates
CREATE POLICY "authenticated_insert_plant_types"
ON public.plant_types
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update plant types
-- Rationale: Care profiles may be regenerated/updated via API routes
CREATE POLICY "authenticated_update_plant_types"
ON public.plant_types
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Note: No DELETE policy is created intentionally.
-- Plant types should not be deleted as they may be referenced by plants.
-- If deletion is needed in future, it should be handled by admin/service role.
