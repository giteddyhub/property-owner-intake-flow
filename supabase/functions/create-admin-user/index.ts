
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
    // Parse request body
    const { email, password, full_name } = await req.json();
    
    // Validate inputs
    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: email, password, and full_name are required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Creating admin user: ${email} with name: ${full_name}`);
    
    // Check if this is the first admin user
    const { count: existingAdminCount, error: countError } = await adminClient
      .from('admin_credentials')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking existing admins:', countError);
      return new Response(
        JSON.stringify({ error: 'Could not check if any admin accounts exist' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let adminId: string;
    
    if (existingAdminCount === 0) {
      // This is the first admin, use the create_initial_admin function
      const { data: initialAdminData, error: initialAdminError } = await adminClient.rpc(
        'create_initial_admin',
        { 
          email, 
          password, 
          full_name, 
          is_super_admin: true 
        }
      );
      
      if (initialAdminError) {
        console.error('Error creating initial admin:', initialAdminError);
        return new Response(
          JSON.stringify({ error: initialAdminError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      adminId = initialAdminData;
    } else {
      // Not the first admin, insert directly
      const { data: adminData, error: insertError } = await adminClient
        .from('admin_credentials')
        .insert([
          {
            email,
            password_hash: adminClient.rpc('hash_password', { password }),
            full_name,
            is_super_admin: false
          }
        ])
        .select('id')
        .single();
      
      if (insertError) {
        console.error('Error creating admin user:', insertError);
        return new Response(
          JSON.stringify({ error: insertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      adminId = adminData.id;
    }
    
    // Return the created user data
    return new Response(
      JSON.stringify({
        id: adminId,
        email,
        full_name
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
