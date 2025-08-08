import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateStrongPassword(length: number): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{};:,.?";
  const all = upper + lower + digits + symbols;

  // Ensure at least one from each category
  const cryptoArray = new Uint32Array(length);
  crypto.getRandomValues(cryptoArray);

  const pick = (chars: string, n: number) =>
    Array.from({ length: n }, (_, i) => chars[cryptoArray[i] % chars.length]).join("");

  const required = [
    pick(upper, 1),
    pick(lower, 1),
    pick(digits, 1),
    pick(symbols, 1),
  ].join("");

  const remaining = Array.from({ length: Math.max(0, length - 4) }, (_, i) =>
    all[cryptoArray[i + 4] % all.length]
  ).join("");

  const combined = (required + remaining).split("");
  // Shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = cryptoArray[i] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { admin_token, target_email } = await req.json();

    if (!admin_token || !target_email) {
      return new Response(JSON.stringify({ error: "Missing admin_token or target_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing server configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Validate calling admin
    const { data: isValid, error: validateError } = await supabase.rpc(
      "validate_admin_token_for_access",
      { admin_token }
    );

    if (validateError) {
      console.error("[rotate-admin-password] validate error:", validateError);
      return new Response(JSON.stringify({ error: validateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate new password
    const newPassword = generateStrongPassword(20);

    // Hash via RPC so it matches DB hashing
    const { data: hashed, error: hashError } = await supabase.rpc("hash_password", {
      password: newPassword,
    });

    if (hashError || !hashed) {
      console.error("[rotate-admin-password] hash error:", hashError);
      return new Response(JSON.stringify({ error: hashError?.message || "Hashing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update credentials
    const { error: updateError } = await supabase
      .from("admin_credentials")
      .update({ password_hash: String(hashed), updated_at: new Date().toISOString() })
      .eq("email", target_email);

    if (updateError) {
      console.error("[rotate-admin-password] update error:", updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Invalidate all sessions for that admin (best practice when rotating passwords)
    const { error: invalidateError } = await supabase.rpc("invalidate_all_admin_sessions", {
      admin_email: target_email,
    });
    if (invalidateError) {
      console.warn("[rotate-admin-password] invalidate sessions warning:", invalidateError);
    }

    return new Response(
      JSON.stringify({ success: true, email: target_email, new_password: newPassword }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[rotate-admin-password] unexpected error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
