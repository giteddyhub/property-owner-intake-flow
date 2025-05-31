
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

    // Create a Supabase client with service role key
    const supabaseUrl = "https://ijwwnaqprojdczfppxkf.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting batch payment verification");

    // Get all pending payments with session IDs
    const { data: pendingPayments, error: fetchError } = await supabase
      .from("purchases")
      .select("id, stripe_session_id, has_document_retrieval, created_at")
      .eq("payment_status", "pending")
      .not("stripe_session_id", "is", null);

    if (fetchError) {
      console.error("Error fetching pending payments:", fetchError);
      throw new Error(`Failed to fetch pending payments: ${fetchError.message}`);
    }

    console.log(`Found ${pendingPayments?.length || 0} pending payments to verify`);

    if (!pendingPayments || pendingPayments.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending payments found", verified: 0, failed: 0 }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          }
        }
      );
    }

    let verifiedCount = 0;
    let failedCount = 0;
    const results = [];

    // Process each pending payment
    for (const payment of pendingPayments) {
      try {
        console.log(`Verifying payment ${payment.id} with session ${payment.stripe_session_id}`);

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(payment.stripe_session_id);

        if (session.payment_status === "paid") {
          console.log(`Payment ${payment.id} is paid, updating database`);

          // Update the purchase record
          const { error: updateError } = await supabase
            .from("purchases")
            .update({
              payment_status: "paid",
              stripe_payment_id: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq("id", payment.id);

          if (updateError) {
            console.error(`Error updating payment ${payment.id}:`, updateError);
            failedCount++;
            results.push({
              paymentId: payment.id,
              status: "error",
              message: `Update failed: ${updateError.message}`
            });
          } else {
            verifiedCount++;
            results.push({
              paymentId: payment.id,
              status: "verified",
              stripeStatus: session.payment_status
            });
          }
        } else {
          console.log(`Payment ${payment.id} status: ${session.payment_status}`);
          results.push({
            paymentId: payment.id,
            status: "not_paid",
            stripeStatus: session.payment_status
          });
        }
      } catch (error) {
        console.error(`Error processing payment ${payment.id}:`, error);
        failedCount++;
        results.push({
          paymentId: payment.id,
          status: "error",
          message: error.message
        });
      }
    }

    console.log(`Batch verification complete: ${verifiedCount} verified, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        message: "Batch verification complete",
        verified: verifiedCount,
        failed: failedCount,
        total: pendingPayments.length,
        results
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
  } catch (error) {
    console.error("Error in batch verification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
  }
});
