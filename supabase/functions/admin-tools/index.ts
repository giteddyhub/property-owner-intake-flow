
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { action, ...params } = await req.json();
    const adminToken = req.headers.get('x-admin-token');
    
    if (!adminToken) {
      return new Response(
        JSON.stringify({ error: 'Admin token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate admin token
    const { data: adminData, error: tokenError } = await adminClient.rpc(
      'validate_admin_session',
      { session_token: adminToken }
    );
    
    if (tokenError || !adminData || adminData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid admin token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const admin = adminData[0];
    console.log(`Admin ${admin.email} performing action: ${action}`);
    
    switch (action) {
      case 'fetch_user_profiles_with_stats': {
        // Get all profiles with comprehensive stats
        const { data: profiles, error: profilesError } = await adminClient
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (profilesError) {
          throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
        }
        
        // Get stats for each user
        const profilesWithStats = await Promise.all(
          profiles.map(async (profile) => {
            const [submissionsResult, propertiesResult, ownersResult] = await Promise.all([
              adminClient
                .from('form_submissions')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', profile.id),
              adminClient
                .from('properties')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', profile.id),
              adminClient
                .from('owners')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', profile.id)
            ]);
            
            return {
              ...profile,
              submissions_count: submissionsResult.count || 0,
              properties_count: propertiesResult.count || 0,
              owners_count: ownersResult.count || 0
            };
          })
        );
        
        return new Response(
          JSON.stringify({ profiles: profilesWithStats }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'fetch_audit_logs': {
        const limit = params.limit || 100;
        
        // Get audit logs with admin details
        const { data: logs, error: logsError } = await adminClient
          .from('admin_audit_log')
          .select(`
            *,
            admin_credentials!inner(email, full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (logsError) {
          throw new Error(`Failed to fetch audit logs: ${logsError.message}`);
        }
        
        // Format logs with admin info
        const formattedLogs = logs.map(log => ({
          ...log,
          admin_email: log.admin_credentials?.email,
          admin_name: log.admin_credentials?.full_name
        }));
        
        return new Response(
          JSON.stringify({ logs: formattedLogs }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
  } catch (error: any) {
    console.error('Admin tools error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
