
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

    // Parse request body
    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'Target user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Attempting to delete user:', targetUserId);

    // Call the secure deletion function
    const { data: deletionResult, error: deletionError } = await adminClient
      .rpc('admin_delete_user', {
        admin_token: adminToken,
        target_user_id: targetUserId
      });

    if (deletionError) {
      console.error('Deletion function error:', deletionError);
      return new Response(
        JSON.stringify({ error: `Deletion failed: ${deletionError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deletionResult.success) {
      console.error('Deletion failed:', deletionResult.error);
      return new Response(
        JSON.stringify({ error: deletionResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User deletion successful:', deletionResult);

    return new Response(
      JSON.stringify(deletionResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin user deletion error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
