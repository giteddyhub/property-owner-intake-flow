
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
    console.log('Admin delete user request received');
    
    // Get admin token from headers
    const adminToken = req.headers.get('x-admin-token');
    if (!adminToken) {
      console.error('No admin token provided');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Admin token required' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { targetUserId } = await req.json();
    console.log('Target user ID:', targetUserId);

    if (!targetUserId) {
      console.error('No target user ID provided');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Target user ID is required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling admin_delete_user function with:', { adminToken: adminToken ? 'present' : 'missing', targetUserId });

    // Call the secure deletion function
    const { data: deletionResult, error: deletionError } = await adminClient
      .rpc('admin_delete_user', {
        admin_token: adminToken,
        target_user_id: targetUserId
      });

    console.log('Function response:', { deletionResult, deletionError });

    if (deletionError) {
      console.error('Database function error:', deletionError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Database error: ${deletionError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deletionResult) {
      console.error('No result returned from deletion function');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No result returned from deletion function' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deletionResult.success) {
      console.error('Deletion function reported failure:', deletionResult.error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: deletionResult.error || 'User deletion failed' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User deletion successful:', deletionResult);

    return new Response(
      JSON.stringify(deletionResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Server error: ${errorMessage}` 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
