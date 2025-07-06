
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.18.0";

// Define standard CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Stripe client with API key
function initStripe() {
  console.log("Initializing Stripe with secret key");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  
  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });
}

// Initialize Supabase client with service role key
function initSupabase() {
  const supabaseUrl = "https://ijwwnaqprojdczfppxkf.supabase.co";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseServiceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
    throw new Error("Server configuration error");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Fetch purchase and related form submission data from Supabase
async function fetchPurchaseData(supabase, purchaseId) {
  console.log("Fetching purchase data for ID:", purchaseId);
  
  // First, fetch the purchase with form submission
  const { data: purchaseData, error: purchaseError } = await supabase
    .from("purchases")
    .select(`
      id, 
      has_document_retrieval,
      form_submission_id,
      form_submissions(
        user_id
      )
    `)
    .eq("id", purchaseId)
    .single();

  if (purchaseError || !purchaseData) {
    console.error("Error fetching purchase:", purchaseError);
    throw new Error(`Error fetching purchase: ${purchaseError?.message || "Purchase not found"}`);
  }

  console.log("Purchase data:", purchaseData);

  // Get user_id from form submission
  const userId = purchaseData.form_submissions?.user_id;
  if (!userId) {
    console.error("No user_id found in form submission for purchase:", purchaseId);
    throw new Error("User ID not found for this purchase");
  }

  console.log("Found user ID:", userId);

  // Fetch user profile separately
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", userId)
    .single();

  if (profileError || !profileData) {
    console.error("Error fetching profile:", profileError);
    throw new Error(`User profile not found: ${profileError?.message || "Profile not found"}`);
  }

  console.log("Profile data:", profileData);

  if (!profileData.email) {
    console.error("No email found in profile for user:", userId);
    throw new Error("User email not found in profile");
  }

  return {
    ...purchaseData,
    contactData: {
      full_name: profileData.full_name,
      email: profileData.email
    }
  };
}

// Update document retrieval preference in purchase record
async function updateDocumentRetrieval(supabase, purchaseId, hasDocumentRetrieval) {
  const { error: updateError } = await supabase
    .from("purchases")
    .update({ has_document_retrieval: hasDocumentRetrieval })
    .eq("id", purchaseId);
    
  if (updateError) {
    console.error("Error updating purchase document retrieval preference:", updateError);
    // Non-critical error, continue execution
  }
}

// Create line items for the Stripe checkout session
function createLineItems(basePrice, hasDocumentRetrieval, ownersCount, propertiesCount) {
  const basePriceCents = Math.round(basePrice * 100);
  const documentRetrievalFeeCents = hasDocumentRetrieval ? 2800 : 0; // €28.00 in cents
  
  // Define line items description based on the counts
  const baseDescription = `Professional tax filing service for ${ownersCount} owner${ownersCount > 1 ? 's' : ''} and ${propertiesCount} propert${propertiesCount > 1 ? 'ies' : 'y'} (Early Bird Price)`;

  // Define line items based on services
  const lineItems = [
    {
      price_data: {
        currency: "eur",
        product_data: {
          name: "Tax Filing Service - Early Access",
          description: baseDescription,
        },
        unit_amount: basePriceCents,
      },
      quantity: 1,
    },
  ];

  // Add document retrieval service if selected
  if (hasDocumentRetrieval) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: "Document Retrieval Service",
          description: "Retrieval of property documents from Italian registry",
        },
        unit_amount: documentRetrievalFeeCents,
      },
      quantity: 1,
    });
  }

  return lineItems;
}

// Create and initialize Stripe checkout session
async function createStripeCheckoutSession(stripe, lineItems, contactEmail, requestOrigin, purchaseId, hasDocumentRetrieval, ownersCount, propertiesCount) {
  console.log("Creating Stripe checkout session");
  console.log("Line items:", JSON.stringify(lineItems));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    customer_email: contactEmail,
    success_url: `${requestOrigin}/tax-filing-service/${purchaseId}?payment=success`,
    cancel_url: `${requestOrigin}/payment-cancelled`,
    metadata: {
      purchase_id: purchaseId,
      has_document_retrieval: hasDocumentRetrieval ? "true" : "false",
      owners_count: ownersCount.toString(),
      properties_count: propertiesCount.toString(),
    },
  });

  console.log("Stripe session created:", session.id);
  console.log("Stripe session URL:", session.url);
  console.log("Stripe session amount total:", session.amount_total);

  // Ensure URL is valid
  if (!session.url || !session.url.startsWith("http")) {
    throw new Error(`Invalid Stripe checkout URL: ${session.url}`);
  }

  return session;
}

// Update purchase record with Stripe session information
async function updatePurchaseWithSessionId(supabase, purchaseId, sessionId, totalAmount, hasDocumentRetrieval) {
  const { error: updateSessionError } = await supabase
    .from("purchases")
    .update({ 
      amount: totalAmount, // Store in euros
      stripe_session_id: sessionId, 
      payment_status: "pending",
      has_document_retrieval: hasDocumentRetrieval,
    })
    .eq("id", purchaseId);

  if (updateSessionError) {
    console.error("Error updating purchase with session ID:", updateSessionError);
    // Non-critical error, continue execution
  }
}

// Create error response with CORS headers
function createErrorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status,
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      }
    }
  );
}

// Create success response with CORS headers
function createSuccessResponse(data) {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      }
    }
  );
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request data
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

    // Initialize clients
    const stripe = initStripe();
    const supabase = initSupabase();

    // Fetch purchase data with contact information from profiles
    const purchaseDataWithContact = await fetchPurchaseData(supabase, purchaseId);
    
    // Update document retrieval preference
    await updateDocumentRetrieval(supabase, purchaseId, hasDocumentRetrievalService);
    
    // Calculate base price (total minus document retrieval fee if enabled)
    const basePrice = totalAmount - (hasDocumentRetrievalService ? 28 : 0);
    
    // Create line items for Stripe checkout
    const lineItems = createLineItems(
      basePrice, 
      hasDocumentRetrievalService, 
      ownersCount, 
      propertiesCount
    );

    try {
      // Create Stripe checkout session
      const session = await createStripeCheckoutSession(
        stripe, 
        lineItems, 
        purchaseDataWithContact.contactData.email, 
        req.headers.get("origin"), 
        purchaseId, 
        hasDocumentRetrievalService, 
        ownersCount, 
        propertiesCount
      );

      // Update purchase record with session information
      await updatePurchaseWithSessionId(
        supabase, 
        purchaseId, 
        session.id, 
        totalAmount, 
        hasDocumentRetrievalService
      );

      // Return the session URL to redirect the user to the Stripe checkout
      return createSuccessResponse({ 
        url: session.url,
        session_id: session.id,
        amount_total: session.amount_total,
      });
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      return createErrorResponse(`Stripe error: ${stripeError.message}`);
    }
  } catch (error) {
    console.error("Error:", error);
    return createErrorResponse(error.message);
  }
});
