-- Migration: Security hardening based on Supabase Security Advisor warnings
--
-- Fixes:
-- 1. Function Search Path Mutable: Set explicit search_path on functions
-- 2. RLS Policy Always True: These are intentional for shared reference data (acknowledged)
--
-- Note: "Leaked Password Protection Disabled" is an Auth setting configured in
-- Supabase Dashboard > Authentication > Settings, not in database migrations.

-- =============================================================================
-- FIX 1: Function Search Path Mutable
-- =============================================================================
-- Setting search_path prevents potential security issues where malicious schemas
-- could intercept function calls. We set it to 'public' explicitly.

-- Recreate handle_new_user with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$;

-- Recreate update_updated_at_column with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- =============================================================================
-- NOTE ON RLS POLICY ALWAYS TRUE WARNINGS
-- =============================================================================
-- The warnings for plant_types policies using USING (true) are INTENTIONAL.
--
-- plant_types is shared reference data (plant taxonomy and AI care profiles)
-- that all authenticated users should be able to read and contribute to.
-- This is the same pattern Supabase uses for lookup tables and shared resources.
--
-- The policies ARE restricted to 'authenticated' role only - anonymous users
-- cannot access the table. The "always true" condition within authenticated
-- context is the correct design for shared reference data.
--
-- If stricter control is needed in future (e.g., only admins can write),
-- create a new migration to update the INSERT/UPDATE policies.

-- =============================================================================
-- NOTE ON LEAKED PASSWORD PROTECTION
-- =============================================================================
-- This is an Auth configuration setting, not a database setting.
-- To enable it:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication > Settings > Security
-- 3. Enable "Leaked Password Protection"
--
-- This feature checks passwords against known breach databases (Have I Been Pwned)
-- and prevents users from using compromised passwords.
