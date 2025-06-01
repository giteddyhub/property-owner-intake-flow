
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { corsHeaders } from '../_shared/cors.ts';

console.log('[admin-delete-user] 🚀 Function module loading...');

// Get environment variables with detailed logging
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

console.log('[admin-delete-user] Environment check:');
console.log('[admin-delete-user] SUPABASE_URL exists:', !!supabaseUrl);
console.log('[admin-delete-user] SUPABASE_URL value:', supabaseUrl ? 'present' : 'missing');
console.log('[admin-delete-user] SERVICE_ROLE_KEY exists:', !!serviceRoleKey);
console.log('[admin-delete-user] SERVICE_ROLE_KEY length:', serviceRoleKey ? serviceRoleKey.length : 0);

if (!supabaseUrl) {
  console.error('[admin-delete-user] ❌ CRITICAL: SUPABASE_URL environment variable is missing');
}

if (!serviceRoleKey) {
  console.error('[admin-delete-user] ❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable is missing');
}

// Create Supabase client with detailed error handling
let adminClient;
try {
  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('[admin-delete-user] ✅ Supabase client created successfully');
} catch (clientError) {
  console.error('[admin-delete-user] ❌ CRITICAL: Failed to create Supabase client:', clientError);
}

Deno.serve(async (req) => {
  console.log('[admin-delete-user] 🚀 Request received:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(req.headers.entries())
  });
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      console.log('[admin-delete-user] Handling CORS preflight request');
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (req.method === 'GET') {
      console.log('[admin-delete-user] Health check requested');
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: {
          supabaseUrl: !!supabaseUrl,
          serviceRoleKey: !!serviceRoleKey,
          clientCreated: !!adminClient
        },
        method: req.method,
        url: req.url
      };
      console.log('[admin-delete-user] Health check response:', healthStatus);
      return new Response(
        JSON.stringify(healthStatus),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate environment before processing
    if (!supabaseUrl || !serviceRoleKey || !adminClient) {
      console.error('[admin-delete-user] ❌ Environment validation failed');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Server configuration error - missing environment variables',
          details: {
            supabaseUrl: !!supabaseUrl,
            serviceRoleKey: !!serviceRoleKey,
            clientCreated: !!adminClient
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[admin-delete-user] Processing DELETE request...');
    
    // Get admin token from headers with extensive logging
    const adminToken = req.headers.get('x-admin-token');
    const authHeader = req.headers.get('authorization');
    const contentType = req.headers.get('content-type');
    
    console.log('[admin-delete-user] Header analysis:', {
      'x-admin-token': adminToken ? `present (${adminToken.length} chars)` : 'missing',
      'authorization': authHeader ? `present (${authHeader.length} chars)` : 'missing',
      'content-type': contentType || 'missing',
      allHeaders: Object.fromEntries(req.headers.entries())
    });
    
    if (!adminToken) {
      console.error('[admin-delete-user] ❌ No admin token provided');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Admin token required',
          debug: {
            headers: Object.fromEntries(req.headers.entries()),
            method: req.method
          }
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-delete-user] 🔍 Admin token received, validating...');

    // Test admin session validation first
    try {
      console.log('[admin-delete-user] 🔍 Testing admin session validation...');
      const { data: sessionData, error: sessionError } = await adminClient
        .rpc('validate_admin_session', { session_token: adminToken });

      console.log('[admin-delete-user] Session validation result:', {
        data: sessionData,
        error: sessionError,
        dataLength: sessionData ? sessionData.length : 0
      });

      if (sessionError) {
        console.error('[admin-delete-user] ❌ Session validation error:', sessionError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Session validation failed: ${sessionError.message}`,
            details: sessionError
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!sessionData || sessionData.length === 0) {
        console.error('[admin-delete-user] ❌ Invalid session - no admin data returned');
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Invalid or expired admin session'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[admin-delete-user] ✅ Admin session validated successfully');
    } catch (validationError) {
      console.error('[admin-delete-user] ❌ Exception during session validation:', validationError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Session validation exception: ${validationError.message}`,
          details: validationError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body with enhanced error handling
    let requestBody;
    try {
      console.log('[admin-delete-user] 📖 Parsing request body...');
      
      if (!req.body) {
        console.error('[admin-delete-user] ❌ No request body provided');
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Request body is required'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      requestBody = await req.json();
      console.log('[admin-delete-user] ✅ Request body parsed successfully:', requestBody);
    } catch (parseError) {
      console.error('[admin-delete-user] ❌ Failed to parse request body:', {
        error: parseError.message,
        name: parseError.name,
        stack: parseError.stack
      });
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
    console.log('[admin-delete-user] 🎯 Target user ID extracted:', targetUserId);

    if (!targetUserId) {
      console.error('[admin-delete-user] ❌ No target user ID provided');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Target user ID is required',
          received: requestBody
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
          error: 'Invalid user ID format',
          received: targetUserId
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-delete-user] ✅ All validation passed, proceeding with deletion...');

    // Test database connection
    console.log('[admin-delete-user] 🔧 Testing database connection...');
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
            error: `Database connection failed: ${connectionError.message}`,
            details: connectionError
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
          error: `Database connection error: ${dbError.message}`,
          details: dbError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[admin-delete-user] 🔧 Calling admin_delete_user function...');
    console.log('[admin-delete-user] Parameters:', { 
      adminToken: adminToken ? `${adminToken.substring(0, 10)}...` : 'missing',
      targetUserId 
    });

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
      name: error.name,
      cause: error.cause
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Server error: ${errorMessage}`,
        type: 'unexpected_error',
        details: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
