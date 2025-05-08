
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { corsHeaders } from '../_shared/cors.ts';

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

// Create Supabase client with admin privileges
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { token } = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Session token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate admin session
    const { data, error } = await adminClient.rpc(
      'validate_admin_session',
      { session_token: token }
    );
    
    if (error) {
      console.error('Admin session validation error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to validate session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // No data means invalid session
    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return admin details from session validation
    return new Response(
      JSON.stringify({
        admin: data[0]
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
