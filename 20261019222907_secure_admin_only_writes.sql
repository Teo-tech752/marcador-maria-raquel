/*
# Secure administrator-only writes for the official scoreboard

## Purpose
The public scoreboard remains readable by everyone, while every database
write is restricted to the one Supabase Auth account whose immutable
`app_metadata.role` is exactly `admin`.

## Changes
1. Existing write policies on `alliances`, `activities`, `results`,
   `event_state`, `rain_notice`, and `change_log` are replaced.
2. Anonymous users keep SELECT-only access to public scoreboard data.
3. Authenticated users keep SELECT access, but only an authenticated user
   with `auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'` may write.
4. Direct writes to `change_log` are removed. The existing SECURITY DEFINER
   trigger function remains the only write path for audit entries.
5. Table grants are narrowed so the anon key cannot even request INSERT,
   UPDATE, or DELETE on scoreboard tables.

## Important security notes
1. The role is read from `app_metadata`, not editable `user_metadata`.
2. The application does not expose sign-up. The authorized account must be
   created privately in Supabase Auth, then assigned app metadata
   `{ "role": "admin" }` from the Supabase dashboard.
3. This migration does not invent or create credentials.
4. The public page only needs SELECT and continues to work without login.
*/

-- Remove the original broad authenticated write policies.
DROP POLICY IF EXISTS "auth_insert_alliances" ON alliances;
DROP POLICY IF EXISTS "auth_update_alliances" ON alliances;
DROP POLICY IF EXISTS "auth_insert_activities" ON activities;
DROP POLICY IF EXISTS "auth_update_activities" ON activities;
DROP POLICY IF EXISTS "auth_delete_activities" ON activities;
DROP POLICY IF EXISTS "auth_insert_results" ON results;
DROP POLICY IF EXISTS "auth_update_results" ON results;
DROP POLICY IF EXISTS "auth_delete_results" ON results;
DROP POLICY IF EXISTS "auth_update_event_state" ON event_state;
DROP POLICY IF EXISTS "auth_update_rain_notice" ON rain_notice;
DROP POLICY IF EXISTS "auth_insert_change_log" ON change_log;

-- Remove any previous policy names if this migration is re-run.
DROP POLICY IF EXISTS "admin_insert_alliances" ON alliances;
DROP POLICY IF EXISTS "admin_update_alliances" ON alliances;
DROP POLICY IF EXISTS "admin_delete_alliances" ON alliances;
DROP POLICY IF EXISTS "admin_insert_activities" ON activities;
DROP POLICY IF EXISTS "admin_update_activities" ON activities;
DROP POLICY IF EXISTS "admin_delete_activities" ON activities;
DROP POLICY IF EXISTS "admin_insert_results" ON results;
DROP POLICY IF EXISTS "admin_update_results" ON results;
DROP POLICY IF EXISTS "admin_delete_results" ON results;
DROP POLICY IF EXISTS "admin_update_event_state" ON event_state;
DROP POLICY IF EXISTS "admin_update_rain_notice" ON rain_notice;

-- The only write authority is the Supabase Auth account with immutable
-- app_metadata.role = admin. No policy is created for change_log writes.
CREATE POLICY "admin_insert_alliances" ON alliances
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_update_alliances" ON alliances
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_delete_alliances" ON alliances
  FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_insert_activities" ON activities
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_update_activities" ON activities
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_delete_activities" ON activities
  FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_insert_results" ON results
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_update_results" ON results
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_delete_results" ON results
  FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_update_event_state" ON event_state
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_update_rain_notice" ON rain_notice
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Table privileges are tightened independently of RLS.
REVOKE INSERT, UPDATE, DELETE ON alliances, activities, results, event_state, rain_notice, change_log FROM anon;
REVOKE INSERT, UPDATE, DELETE ON change_log FROM authenticated;
GRANT SELECT ON alliances, activities, results, event_state, rain_notice, change_log TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON alliances, activities, results, event_state, rain_notice TO authenticated;
