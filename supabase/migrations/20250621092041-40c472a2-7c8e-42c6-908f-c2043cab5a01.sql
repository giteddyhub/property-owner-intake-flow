
-- First, let's clean up duplicate and conflicting RLS policies
-- Drop existing policies that might be conflicting

-- Clean up properties table policies
DROP POLICY IF EXISTS "Users can view own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON public.properties;
DROP POLICY IF EXISTS "Admin users can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admin token holders can view all properties" ON public.properties;

-- Clean up owners table policies
DROP POLICY IF EXISTS "Users can view own owners" ON public.owners;
DROP POLICY IF EXISTS "Users can insert own owners" ON public.owners;
DROP POLICY IF EXISTS "Users can update own owners" ON public.owners;
DROP POLICY IF EXISTS "Users can delete own owners" ON public.owners;
DROP POLICY IF EXISTS "Admin users can view all owners" ON public.owners;
DROP POLICY IF EXISTS "Admin token holders can view all owners" ON public.owners;

-- Clean up assignments table policies
DROP POLICY IF EXISTS "Users can view own assignments" ON public.owner_property_assignments;
DROP POLICY IF EXISTS "Users can insert own assignments" ON public.owner_property_assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON public.owner_property_assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON public.owner_property_assignments;
DROP POLICY IF EXISTS "Admin users can view all assignments" ON public.owner_property_assignments;
DROP POLICY IF EXISTS "Admin token holders can view all assignments" ON public.owner_property_assignments;

-- Clean up form_submissions table policies
DROP POLICY IF EXISTS "Users can view own submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can update own submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Users can delete own submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admin users can view all form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admin token holders can view all form submissions" ON public.form_submissions;

-- Create clean, consistent RLS policies
-- Properties table policies
CREATE POLICY "authenticated_users_full_access_properties" 
ON public.properties 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Owners table policies
CREATE POLICY "authenticated_users_full_access_owners" 
ON public.owners 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Owner Property Assignments table policies
CREATE POLICY "authenticated_users_full_access_assignments" 
ON public.owner_property_assignments 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Form Submissions table policies
CREATE POLICY "authenticated_users_full_access_submissions" 
ON public.form_submissions 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin-specific policies for viewing all data
CREATE POLICY "admin_users_view_all_properties" 
ON public.properties 
FOR SELECT
TO authenticated
USING (public.is_authenticated_user_admin());

CREATE POLICY "admin_users_view_all_owners" 
ON public.owners 
FOR SELECT
TO authenticated
USING (public.is_authenticated_user_admin());

CREATE POLICY "admin_users_view_all_assignments" 
ON public.owner_property_assignments 
FOR SELECT
TO authenticated
USING (public.is_authenticated_user_admin());

CREATE POLICY "admin_users_view_all_submissions" 
ON public.form_submissions 
FOR SELECT
TO authenticated
USING (public.is_authenticated_user_admin());

-- Ensure user_id columns are NOT NULL where they should be required
ALTER TABLE public.properties ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.owners ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.owner_property_assignments ALTER COLUMN user_id SET NOT NULL;
