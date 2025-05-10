
-- Create functions for emergency admin access to bypass RLS

-- Function to get owners for a specific submission
CREATE OR REPLACE FUNCTION public.admin_get_owners(submission_id uuid)
RETURNS SETOF public.owners
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.owners WHERE form_submission_id = submission_id ORDER BY created_at DESC;
$$;

-- Function to get properties for a specific submission
CREATE OR REPLACE FUNCTION public.admin_get_properties(submission_id uuid)
RETURNS SETOF public.properties
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.properties WHERE form_submission_id = submission_id ORDER BY created_at DESC;
$$;

-- Function to get assignments for a specific submission
CREATE OR REPLACE FUNCTION public.admin_get_assignments(submission_id uuid)
RETURNS SETOF public.owner_property_assignments
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.owner_property_assignments WHERE form_submission_id = submission_id ORDER BY created_at DESC;
$$;

-- Function to validate admin token against session table
CREATE OR REPLACE FUNCTION public.validate_admin_token_details(token text)
RETURNS TABLE (
  valid boolean,
  admin_id uuid,
  expires_at timestamptz,
  created_at timestamptz,
  is_expired boolean,
  admin_email text,
  admin_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record record;
  admin_record record;
BEGIN
  -- Find session record
  SELECT * INTO session_record
  FROM public.admin_sessions
  WHERE admin_sessions.token = token;
  
  -- Check if session exists
  IF session_record IS NULL THEN
    RETURN QUERY SELECT 
      false, 
      NULL::uuid, 
      NULL::timestamptz, 
      NULL::timestamptz, 
      NULL::boolean, 
      NULL::text, 
      NULL::text;
    RETURN;
  END IF;
  
  -- Check if session is expired
  IF session_record.expires_at < now() THEN
    RETURN QUERY SELECT 
      false, 
      session_record.admin_id, 
      session_record.expires_at, 
      session_record.created_at, 
      true, 
      NULL::text, 
      NULL::text;
    RETURN;
  END IF;
  
  -- Get admin details
  SELECT * INTO admin_record
  FROM public.admin_credentials
  WHERE id = session_record.admin_id;
  
  -- Return results
  RETURN QUERY SELECT
    true,
    session_record.admin_id,
    session_record.expires_at,
    session_record.created_at,
    false,
    admin_record.email,
    admin_record.full_name;
END;
$$;

-- Expose a simpler function for RLS policies
CREATE OR REPLACE FUNCTION public.validate_admin_token_for_access(token text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT valid FROM public.validate_admin_token_details(token) LIMIT 1;
$$;
