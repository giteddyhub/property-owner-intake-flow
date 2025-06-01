
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { corsHeaders } from '../_shared/cors.ts';

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

// Create Supabase client with service role key for admin privileges
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
    // Get admin token from headers
    const adminToken = req.headers.get('x-admin-token');
    if (!adminToken) {
      return new Response(
        JSON.stringify({ error: 'Admin token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate admin token
    const { data: sessionData } = await adminClient.rpc('validate_admin_session', {
      session_token: adminToken
    });

    if (!sessionData || sessionData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid admin token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { action } = await req.json();

    if (action === 'fetch_user_profiles_with_stats') {
      // Use the new secure function to get admin user summary data
      const { data: userSummaries, error: summaryError } = await adminClient
        .rpc('get_admin_user_summary');

      if (summaryError) {
        throw new Error(`Failed to fetch user summary data: ${summaryError.message}`);
      }

      return new Response(
        JSON.stringify({ profiles: userSummaries || [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin tools error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
