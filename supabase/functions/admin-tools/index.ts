
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
