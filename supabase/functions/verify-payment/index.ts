
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.18.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const requestData = await req.json();
    const { sessionId } = requestData;

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log("Verifying payment for session:", sessionId);

    // Retrieve the session to check its status
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Create a Supabase client
    const supabaseUrl = "https://ijwwnaqprojdczfppxkf.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only proceed if payment was successful
    if (session.payment_status === "paid") {
      // Get the document retrieval status from metadata
      const hasDocumentRetrieval = session.metadata?.has_document_retrieval === "true";
      const ownersCount = parseInt(session.metadata?.owners_count || "1", 10);
      const propertiesCount = parseInt(session.metadata?.properties_count || "1", 10);
      
      console.log("Payment is paid, updating purchase record");
      
      // Update the purchase record with the correct column name
      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          payment_status: "paid",
          stripe_payment_id: session.payment_intent as string,
          has_document_retrieval: hasDocumentRetrieval,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", sessionId);

      if (updateError) {
        console.error("Error updating purchase record:", updateError);
        throw new Error(`Error updating purchase: ${updateError.message}`);
      } else {
        console.log("Purchase record updated successfully");
      }
    }

    // Return the session status and metadata
    return new Response(
      JSON.stringify({
        status: session.payment_status,
        customer_email: session.customer_details?.email,
        metadata: session.metadata,
        has_document_retrieval: session.metadata?.has_document_retrieval === "true",
        owners_count: parseInt(session.metadata?.owners_count || "1", 10),
        properties_count: parseInt(session.metadata?.properties_count || "1", 10),
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
  }
});
