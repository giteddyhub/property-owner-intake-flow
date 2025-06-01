
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { corsHeaders } from '../_shared/cors.ts';

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

console.log('[admin-delete-user] Function starting with environment check');
console.log('[admin-delete-user] SUPABASE_URL exists:', !!supabaseUrl);
console.log('[admin-delete-user] SERVICE_ROLE_KEY exists:', !!serviceRoleKey);

// Create Supabase client with service role key for admin privileges
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('[admin-delete-user] Supabase client created successfully');

Deno.serve(async (req) => {
  console.log('[admin-delete-user] 🚀 Request received:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[admin-delete-user] Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('[admin-delete-user] Processing request...');
    
    // Get admin token from headers
    const adminToken = req.headers.get('x-admin-token');
    console.log('[admin-delete-user] Admin token present:', !!adminToken);
    
    if (!adminToken) {
      console.error('[admin-delete-user] ❌ No admin token provided');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Admin token required' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('[admin-delete-user] Request body parsed successfully:', requestBody);
    } catch (parseError) {
      console.error('[admin-delete-user] ❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError.message
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { targetUserId } = requestBody;
    console.log('[admin-delete-user] Target user ID:', targetUserId);

    if (!targetUserId) {
      console.error('[admin-delete-user] ❌ No target user ID provided');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Target user ID is required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate that targetUserId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(targetUserId)) {
      console.error('[admin-delete-user] ❌ Invalid UUID format:', targetUserId);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid user ID format' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-delete-user] 🔧 Calling admin_delete_user function...');
    console.log('[admin-delete-user] Parameters:', { 
      adminToken: adminToken ? 'present' : 'missing', 
      targetUserId 
    });

    // Test database connection first
    try {
      const { data: connectionTest, error: connectionError } = await adminClient
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        console.error('[admin-delete-user] ❌ Database connection test failed:', connectionError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Database connection failed: ${connectionError.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('[admin-delete-user] ✅ Database connection test passed');
    } catch (dbError) {
      console.error('[admin-delete-user] ❌ Database connection error:', dbError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Database connection error: ${dbError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call the secure deletion function
    const { data: deletionResult, error: deletionError } = await adminClient
      .rpc('admin_delete_user', {
        admin_token: adminToken,
        target_user_id: targetUserId
      });

    console.log('[admin-delete-user] 📊 Function response received');
    console.log('[admin-delete-user] Deletion result:', deletionResult);
    console.log('[admin-delete-user] Deletion error:', deletionError);

    if (deletionError) {
      console.error('[admin-delete-user] ❌ Database function error:', {
        message: deletionError.message,
        details: deletionError.details,
        hint: deletionError.hint,
        code: deletionError.code
      });
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Database error: ${deletionError.message}`,
          details: deletionError.details || 'No additional details',
          hint: deletionError.hint || 'No hint available'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deletionResult) {
      console.error('[admin-delete-user] ❌ No result returned from deletion function');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'No result returned from deletion function' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deletionResult.success) {
      console.error('[admin-delete-user] ❌ Deletion function reported failure:', deletionResult.error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: deletionResult.error || 'User deletion failed' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-delete-user] ✅ User deletion successful:', deletionResult);

    return new Response(
      JSON.stringify(deletionResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[admin-delete-user] ❌ Unexpected error in edge function:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Server error: ${errorMessage}`,
        type: 'unexpected_error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
