-- Migration: RLS Performance Optimization
--
-- Fixes Supabase Performance Advisor warning: "Auth RLS Initialization Plan"
--
-- Problem: Using auth.uid() directly in RLS policies causes the function to be
-- re-evaluated for every row in the query. This is inefficient at scale.
--
-- Solution: Wrap auth.uid() in a subquery (select auth.uid()) which forces
-- PostgreSQL to evaluate it once per query, not per row.
--
-- This is a non-breaking change - the policies enforce the same rules,
-- just more efficiently.
--
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- =============================================================================
-- PROFILES TABLE (3 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- =============================================================================
-- PLANTS TABLE (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own plants" ON plants;
CREATE POLICY "Users can view own plants"
  ON plants FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own plants" ON plants;
CREATE POLICY "Users can insert own plants"
  ON plants FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own plants" ON plants;
CREATE POLICY "Users can update own plants"
  ON plants FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own plants" ON plants;
CREATE POLICY "Users can delete own plants"
  ON plants FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================================================
-- TASK_HISTORY TABLE (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own task history" ON task_history;
CREATE POLICY "Users can view own task history"
  ON task_history FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own task history" ON task_history;
CREATE POLICY "Users can insert own task history"
  ON task_history FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own task history" ON task_history;
CREATE POLICY "Users can update own task history"
  ON task_history FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own task history" ON task_history;
CREATE POLICY "Users can delete own task history"
  ON task_history FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================================================
-- PLANT_CONVERSATIONS TABLE (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own conversations" ON plant_conversations;
CREATE POLICY "Users can view own conversations"
  ON plant_conversations FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON plant_conversations;
CREATE POLICY "Users can insert own conversations"
  ON plant_conversations FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON plant_conversations;
CREATE POLICY "Users can update own conversations"
  ON plant_conversations FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own conversations" ON plant_conversations;
CREATE POLICY "Users can delete own conversations"
  ON plant_conversations FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================================================
-- LAWNS TABLE (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own lawn" ON lawns;
CREATE POLICY "Users can view own lawn"
  ON lawns FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own lawn" ON lawns;
CREATE POLICY "Users can insert own lawn"
  ON lawns FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own lawn" ON lawns;
CREATE POLICY "Users can update own lawn"
  ON lawns FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own lawn" ON lawns;
CREATE POLICY "Users can delete own lawn"
  ON lawns FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================================================
-- LAWN_TASK_HISTORY TABLE (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own lawn task history" ON lawn_task_history;
CREATE POLICY "Users can view own lawn task history"
  ON lawn_task_history FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own lawn task history" ON lawn_task_history;
CREATE POLICY "Users can insert own lawn task history"
  ON lawn_task_history FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own lawn task history" ON lawn_task_history;
CREATE POLICY "Users can update own lawn task history"
  ON lawn_task_history FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own lawn task history" ON lawn_task_history;
CREATE POLICY "Users can delete own lawn task history"
  ON lawn_task_history FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================================================
-- LAWN_MOWING_LOG TABLE (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own lawn mowing log" ON lawn_mowing_log;
CREATE POLICY "Users can view own lawn mowing log"
  ON lawn_mowing_log FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own lawn mowing log" ON lawn_mowing_log;
CREATE POLICY "Users can insert own lawn mowing log"
  ON lawn_mowing_log FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own lawn mowing log" ON lawn_mowing_log;
CREATE POLICY "Users can update own lawn mowing log"
  ON lawn_mowing_log FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own lawn mowing log" ON lawn_mowing_log;
CREATE POLICY "Users can delete own lawn mowing log"
  ON lawn_mowing_log FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =============================================================================
-- LAWN_HEALTH_CHECKS TABLE (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own lawn health checks" ON lawn_health_checks;
CREATE POLICY "Users can view own lawn health checks"
  ON lawn_health_checks FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own lawn health checks" ON lawn_health_checks;
CREATE POLICY "Users can insert own lawn health checks"
  ON lawn_health_checks FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own lawn health checks" ON lawn_health_checks;
CREATE POLICY "Users can update own lawn health checks"
  ON lawn_health_checks FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own lawn health checks" ON lawn_health_checks;
CREATE POLICY "Users can delete own lawn health checks"
  ON lawn_health_checks FOR DELETE
  USING ((select auth.uid()) = user_id);
