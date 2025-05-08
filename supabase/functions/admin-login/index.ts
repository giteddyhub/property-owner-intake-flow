
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
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify admin credentials using database function
    const { data, error: dbError } = await adminClient.rpc(
      'verify_admin_password',
      { email, password }
    );
    
    if (dbError || !data) {
      console.error('Admin login error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const adminId = data;
    if (!adminId) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create admin session
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    const { data: sessionData, error: sessionError } = await adminClient.rpc(
      'create_admin_session',
      { 
        admin_id: adminId, 
        ip_address: clientIp, 
        user_agent: userAgent,
        expires_in_hours: 24
      }
    );
    
    if (sessionError || !sessionData) {
      console.error('Admin session creation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get admin details to return
    const { data: adminDetails } = await adminClient
      .from('admin_credentials')
      .select('id, email, full_name, is_super_admin')
      .eq('id', adminId)
      .single();
    
    return new Response(
      JSON.stringify({
        admin: adminDetails,
        session: {
          token: sessionData[0].token,
          expires_at: sessionData[0].expires_at
        }
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
