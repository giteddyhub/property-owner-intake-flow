
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
    const { 
      purchaseId, 
      hasDocumentRetrievalService, 
      ownersCount = 1, 
      propertiesCount = 1,
      totalAmount = 0 
    } = requestData;

    if (!purchaseId) {
      throw new Error("Purchase ID is required");
    }

    console.log("Processing checkout for purchase:", purchaseId, "with document retrieval:", hasDocumentRetrievalService);
    console.log("Owners count:", ownersCount, "Properties count:", propertiesCount, "Total amount:", totalAmount);

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = "https://ijwwnaqprojdczfppxkf.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch purchase record and associated contact
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("purchases")
      .select("id, contact_id, has_document_retrieval")
      .eq("id", purchaseId)
      .single();

    if (purchaseError || !purchaseData) {
      console.error("Error fetching purchase:", purchaseError);
      throw new Error(`Error fetching purchase: ${purchaseError?.message || "Purchase not found"}`);
    }

    // Update the document retrieval preference on the purchase
    await supabase
      .from("purchases")
      .update({ has_document_retrieval: hasDocumentRetrievalService })
      .eq("id", purchaseId);
    
    // Fetch contact information to use in the checkout
    const { data: contactData, error: contactError } = await supabase
      .from("contacts")
      .select("full_name, email")
      .eq("id", purchaseData.contact_id)
      .single();

    if (contactError || !contactData) {
      console.error("Error fetching contact:", contactError);
      throw new Error(`Error fetching contact: ${contactError?.message || "Contact not found"}`);
    }

    console.log("Found contact:", contactData.email);

    // Convert total amount to cents for Stripe
    const totalAmountCents = Math.round(totalAmount * 100);

    // Calculate document retrieval fee
    const documentRetrievalFee = hasDocumentRetrievalService ? 2800 : 0; // $28.00 in cents
    
    // Use the calculated total if provided, otherwise fallback to base calculation
    const finalAmount = totalAmountCents > 0 ? totalAmountCents : 24500 + documentRetrievalFee;

    // Create line items description based on the counts
    const baseDescription = `Professional tax filing service for ${ownersCount} owner${ownersCount > 1 ? 's' : ''} and ${propertiesCount} propert${propertiesCount > 1 ? 'ies' : 'y'} (Early Bird Price)`;

    // Define line items based on services
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax Filing Service - Early Access",
            description: baseDescription,
          },
          unit_amount: finalAmount - documentRetrievalFee, // Base amount excluding document retrieval fee
        },
        quantity: 1,
      },
    ];

    // Add document retrieval service if selected
    if (hasDocumentRetrievalService) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Document Retrieval Service",
            description: "Retrieval of property documents from Italian registry",
          },
          unit_amount: documentRetrievalFee,
        },
        quantity: 1,
      });
    }

    console.log("Creating Stripe checkout session with amount:", finalAmount / 100);

    // Set up the checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: contactData.email,
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
      metadata: {
        purchase_id: purchaseId,
        has_document_retrieval: hasDocumentRetrievalService ? "true" : "false",
        owners_count: ownersCount.toString(),
        properties_count: propertiesCount.toString(),
      },
    });

    console.log("Stripe session created:", session.id);

    // Update the purchase record with the Stripe session ID
    await supabase
      .from("purchases")
      .update({ 
        amount: finalAmount / 100, // Convert cents to dollars
        stripe_session_id: session.id, 
        payment_status: "pending",
        has_document_retrieval: hasDocumentRetrievalService,
      })
      .eq("id", purchaseId);

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
