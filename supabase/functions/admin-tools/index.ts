
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
      
      // Check if the token exists in admin_sessions table
      const { data: sessionData, error: sessionError } = await adminClient
        .from('admin_sessions')
        .select('id, admin_id, expires_at, created_at')
        .eq('token', token)
        .single();
        
      if (sessionError) {
        console.error('Error validating session:', sessionError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to validate session',
            details: sessionError 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!sessionData) {
        return new Response(
          JSON.stringify({ valid: false, reason: 'No matching session found' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if session is expired
      const now = new Date();
      const expires = new Date(sessionData.expires_at);
      const isExpired = expires < now;
      
      // Get admin details
      const { data: adminData, error: adminError } = await adminClient
        .from('admin_credentials')
        .select('id, email, full_name')
        .eq('id', sessionData.admin_id)
        .single();
        
      if (adminError) {
        console.error('Error fetching admin details:', adminError);
      }
      
      return new Response(
        JSON.stringify({
          valid: !isExpired,
          session: {
            id: sessionData.id,
            created_at: sessionData.created_at,
            expires_at: sessionData.expires_at,
            is_expired: isExpired,
            time_remaining: isExpired ? 'Expired' : `${Math.round((expires.getTime() - now.getTime()) / (60 * 1000))} minutes`
          },
          admin: adminData || null
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
