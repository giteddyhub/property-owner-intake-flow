
-- Create policies allowing admins to view all user data

-- Form Submissions table
CREATE POLICY "Admin users can view all form submissions" 
ON public.form_submissions 
FOR SELECT 
USING (public.is_authenticated_user_admin());

-- Properties table
CREATE POLICY "Admin users can view all properties" 
ON public.properties 
FOR SELECT 
USING (public.is_authenticated_user_admin());

-- Owners table
CREATE POLICY "Admin users can view all owners" 
ON public.owners 
FOR SELECT 
USING (public.is_authenticated_user_admin());

-- Owner Property Assignments table
CREATE POLICY "Admin users can view all assignments" 
ON public.owner_property_assignments 
FOR SELECT 
USING (public.is_authenticated_user_admin());

-- Profiles table (ensure this exists)
CREATE POLICY IF NOT EXISTS "Admin users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_authenticated_user_admin());
