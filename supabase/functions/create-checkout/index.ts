
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
    const { contactId, hasDocumentRetrievalService } = requestData;

    if (!contactId) {
      throw new Error("Contact ID is required");
    }

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = "https://ijwwnaqprojdczfppxkf.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch contact information to use in the checkout
    const { data: contactData, error: contactError } = await supabase
      .from("contacts")
      .select("full_name, email")
      .eq("id", contactId)
      .single();

    if (contactError || !contactData) {
      throw new Error(`Error fetching contact: ${contactError?.message || "Contact not found"}`);
    }

    // Calculate the total amount
    const basePrice = 24500; // €245.00 in cents
    const documentRetrievalFee = 2800; // €28.00 in cents
    const totalAmount = hasDocumentRetrievalService ? basePrice + documentRetrievalFee : basePrice;

    // Define line items based on services
    const lineItems = [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Tax Filing Service - Early Access",
            description: "Professional tax filing service for your Italian property (discounted from €285)",
          },
          unit_amount: basePrice,
        },
        quantity: 1,
      },
    ];

    // Add document retrieval service if selected
    if (hasDocumentRetrievalService) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Document Retrieval Service",
            description: "Retrieval of property documents from Italian registry",
          },
          unit_amount: documentRetrievalFee,
        },
        quantity: 1,
      });
    }

    // Set up the checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: contactData.email,
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
      metadata: {
        contact_id: contactId,
        has_document_retrieval: hasDocumentRetrievalService ? "true" : "false",
      },
    });

    // Record the pending purchase in our database
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("purchases")
      .insert([
        {
          contact_id: contactId,
          amount: totalAmount / 100, // Convert cents to euros
          stripe_session_id: session.id,
          payment_status: "pending",
          includes_document_retrieval: hasDocumentRetrievalService,
        },
      ])
      .select();

    if (purchaseError) {
      console.error("Error creating purchase record:", purchaseError);
    }

    // Return the session URL to redirect the user to the Stripe checkout
    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id,
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
