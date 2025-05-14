
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
    const { action, params } = await req.json();
    console.log(`Admin tools: Executing ${action} with params:`, params);
    
    // Direct table access using admin client
    if (action === 'direct_fetch') {
      const { table, id_column, id_value, orderBy } = params;
      
      if (!table || !id_column || !id_value) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      let query = adminClient
        .from(table)
        .select('*')
        .eq(id_column, id_value);
        
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching from ${table}:`, error);
        return new Response(
          JSON.stringify({ error: `Failed to fetch from ${table}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // NEW ENDPOINT: Fetch all users/profiles for admin dashboard
    if (action === 'fetch_admin_users') {
      // Verify admin token if provided
      let isValidToken = false;
      const adminToken = req.headers.get('x-admin-token');
      
      if (adminToken) {
        try {
          const { data: tokenDetails } = await adminClient.rpc(
            'validate_admin_token_details',
            { token: adminToken }
          );
          
          isValidToken = tokenDetails?.valid || false;
          console.log('Admin token validation result:', isValidToken);
          
          if (!isValidToken) {
            console.warn('Invalid admin token provided');
          }
        } catch (error) {
          console.error('Error validating admin token:', error);
        }
      }
      
      if (!isValidToken) {
        console.warn('Attempting to access admin users without valid token');
        // We'll proceed but log the warning - in production you might want to reject
      }
      
      try {
        // Fetch all profiles
        const { data: profiles, error: profilesError } = await adminClient
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (profilesError) {
          throw profilesError;
        }
        
        // Fetch admin users
        const { data: adminUsers, error: adminError } = await adminClient
          .from('admin_users')
          .select('id');
          
        if (adminError) {
          throw adminError;
        }
        
        // Fetch additional stats for each profile
        const enhancedProfiles = await Promise.all(
          (profiles || []).map(async (profile) => {
            try {
              // Count submissions
              const { count: submissionsCount } = await adminClient
                .from('form_submissions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id);
                
              // Count properties
              const { count: propertiesCount } = await adminClient
                .from('properties')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id);
                
              // Count owners
              const { count: ownersCount } = await adminClient
                .from('owners')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id);
                
              return {
                ...profile,
                submissions_count: submissionsCount || 0,
                properties_count: propertiesCount || 0,
                owners_count: ownersCount || 0,
                is_admin: (adminUsers || []).some(admin => admin.id === profile.id)
              };
            } catch (error) {
              console.error(`Error enhancing profile ${profile.id}:`, error);
              return {
                ...profile,
                submissions_count: 0,
                properties_count: 0,
                owners_count: 0,
                is_admin: (adminUsers || []).some(admin => admin.id === profile.id),
                error: 'Failed to fetch complete profile data'
              };
            }
          })
        );
        
        return new Response(
          JSON.stringify({ 
            data: enhancedProfiles,
            adminCount: adminUsers?.length || 0,
            profileCount: profiles?.length || 0
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error in fetch_admin_users:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch admin users', 
            details: error.message,
            hint: 'This could be due to RLS policies or missing permissions'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Direct table insertion using admin client
    if (action === 'direct_insert') {
      const { table, data: insertData } = params;
      
      if (!table || !insertData) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { data, error } = await adminClient
        .from(table)
        .insert(insertData)
        .select();
      
      if (error) {
        console.error(`Error inserting into ${table}:`, error);
        return new Response(
          JSON.stringify({ error: `Failed to insert into ${table}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Direct table update using admin client
    if (action === 'direct_update') {
      const { table, id_column, id_value, data: updateData } = params;
      
      if (!table || !id_column || !id_value || !updateData) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { data, error } = await adminClient
        .from(table)
        .update(updateData)
        .eq(id_column, id_value)
        .select();
      
      if (error) {
        console.error(`Error updating ${table}:`, error);
        return new Response(
          JSON.stringify({ error: `Failed to update ${table}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Direct table deletion using admin client
    if (action === 'direct_delete') {
      const { table, id_column, id_value } = params;
      
      if (!table || !id_column || !id_value) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { data, error } = await adminClient
        .from(table)
        .delete()
        .eq(id_column, id_value)
        .select();
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        return new Response(
          JSON.stringify({ error: `Failed to delete from ${table}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Run diagnostics on admin session
    if (action === 'validate_admin_session') {
      const { token } = params;
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Token is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        // First use the validate_admin_token_details function
        const { data: tokenDetails, error: tokenDetailsError } = await adminClient.rpc(
          'validate_admin_token_details',
          { token }
        );
        
        if (tokenDetailsError) {
          console.error('Error validating token details:', tokenDetailsError);
          return new Response(
            JSON.stringify({ 
              valid: false,
              error: 'Failed to validate token details',
              details: tokenDetailsError
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Return the full token details
        return new Response(
          JSON.stringify({
            valid: tokenDetails.valid,
            details: tokenDetails,
            timestamp: new Date().toISOString()
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        console.error('Unexpected error in token validation:', e);
        return new Response(
          JSON.stringify({ 
            valid: false,
            error: 'Exception during validation',
            details: e.message
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Check if admin_get functions are available and test them
    if (action === 'check_admin_functions') {
      try {
        // Get list of available functions
        const { data: functions, error: functionsError } = await adminClient.rpc(
          'pg_get_funcs', 
          { pattern: 'admin_get_%' }
        );
        
        if (functionsError) {
          console.error('Error listing functions:', functionsError);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to list admin functions',
              details: functionsError
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Try to execute a test call for each function to verify they work
        const testResults = [];
        if (Array.isArray(functions)) {
          for (const func of functions) {
            try {
              // Try calling the function with a dummy submission ID
              const testId = '00000000-0000-0000-0000-000000000000';
              const { data: testResult, error: testError } = await adminClient.rpc(
                func.name,
                { submission_id: testId }
              );
              
              testResults.push({
                function: func.name,
                success: !testError,
                error: testError ? testError.message : null,
                returnType: Array.isArray(testResult) ? 'array' : typeof testResult
              });
            } catch (e) {
              testResults.push({
                function: func.name,
                success: false,
                error: e.message,
                exception: true
              });
            }
          }
        }
        
        return new Response(
          JSON.stringify({ functions, testResults }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        console.error('Unexpected error checking functions:', e);
        return new Response(
          JSON.stringify({ error: 'Exception checking functions', details: e.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Generate SQL for admin function
    if (action === 'generate_admin_get_function') {
      const { table, filter_column } = params;
      
      if (!table || !filter_column) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters (table and filter_column)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get table definition
      const { data: tableInfo, error: tableError } = await adminClient.rpc(
        'pg_get_table_def', 
        { table_name: table }
      );
      
      if (tableError) {
        return new Response(
          JSON.stringify({ error: `Failed to get table definition: ${tableError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Generate SQL for function
      const functionName = `admin_get_${table}`;
      const sql = `
CREATE OR REPLACE FUNCTION public.${functionName}(submission_id uuid)
RETURNS SETOF public.${table}
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.${table}
  WHERE ${filter_column} = submission_id
  ORDER BY created_at DESC;
$$;
`;
      
      return new Response(
        JSON.stringify({ 
          sql,
          table: table,
          tableInfo: tableInfo 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
