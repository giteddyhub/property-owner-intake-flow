
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.18.0";

// Define standard CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced logging function
const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Initialize Stripe client with API key
function initStripe() {
  logStep("Initializing Stripe client");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
  if (!stripeKey) {
    logStep("ERROR: STRIPE_SECRET_KEY is not set");
    throw new Error("STRIPE_SECRET_KEY is not configured. Please add your Stripe secret key to the edge function secrets.");
  }
  
  if (!stripeKey.startsWith('sk_')) {
    logStep("ERROR: Invalid Stripe key format", { keyPrefix: stripeKey.substring(0, 3) });
    throw new Error("Invalid Stripe secret key format. Key should start with 'sk_'");
  }
  
  logStep("Stripe key validated", { keyPrefix: stripeKey.substring(0, 7) + "..." });
  
  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });
}

// Initialize Supabase client with service role key
function initSupabase() {
  const supabaseUrl = "https://ijwwnaqprojdczfppxkf.supabase.co";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseServiceKey) {
    logStep("ERROR: Missing SUPABASE_SERVICE_ROLE_KEY");
    throw new Error("Server configuration error: Missing service role key");
  }
  
  logStep("Supabase client initialized");
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Fetch purchase and related form submission data from Supabase
async function fetchPurchaseData(supabase, purchaseId) {
  logStep("Fetching purchase data", { purchaseId });
  
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
    logStep("ERROR: Failed to fetch purchase", { error: purchaseError, purchaseId });
    throw new Error(`Error fetching purchase: ${purchaseError?.message || "Purchase not found"}`);
  }

  logStep("Purchase data retrieved", { purchaseId, hasFormSubmission: !!purchaseData.form_submissions });

  // Get user_id from form submission
  const userId = purchaseData.form_submissions?.user_id;
  if (!userId) {
    logStep("ERROR: No user_id found in form submission", { purchaseId });
    throw new Error("User ID not found for this purchase");
  }

  logStep("User ID found", { userId });

  // Fetch user profile separately
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", userId)
    .single();

  if (profileError || !profileData) {
    logStep("ERROR: Failed to fetch profile", { error: profileError, userId });
    throw new Error(`User profile not found: ${profileError?.message || "Profile not found"}`);
  }

  if (!profileData.email) {
    logStep("ERROR: No email in profile", { userId });
    throw new Error("User email not found in profile");
  }

  logStep("Profile data retrieved", { email: profileData.email, hasName: !!profileData.full_name });

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
  logStep("Updating document retrieval preference", { purchaseId, hasDocumentRetrieval });
  
  const { error: updateError } = await supabase
    .from("purchases")
    .update({ has_document_retrieval: hasDocumentRetrieval })
    .eq("id", purchaseId);
    
  if (updateError) {
    logStep("WARNING: Failed to update document retrieval preference", { error: updateError });
    // Non-critical error, continue execution
  } else {
    logStep("Document retrieval preference updated successfully");
  }
}

// Create line items for the Stripe checkout session
function createLineItems(basePrice, hasDocumentRetrieval, ownersCount, propertiesCount) {
  logStep("Creating line items", { basePrice, hasDocumentRetrieval, ownersCount, propertiesCount });
  
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

  logStep("Line items created", { itemCount: lineItems.length, totalCents: basePriceCents + documentRetrievalFeeCents });
  return lineItems;
}

// Create and initialize Stripe checkout session
async function createStripeCheckoutSession(stripe, lineItems, contactEmail, requestOrigin, purchaseId, hasDocumentRetrieval, ownersCount, propertiesCount) {
  logStep("Creating Stripe checkout session", { contactEmail, requestOrigin, purchaseId });
  
  try {
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

    logStep("Stripe session created successfully", { 
      sessionId: session.id, 
      url: session.url,
      amountTotal: session.amount_total 
    });

    // Ensure URL is valid
    if (!session.url || !session.url.startsWith("http")) {
      logStep("ERROR: Invalid Stripe checkout URL", { url: session.url });
      throw new Error(`Invalid Stripe checkout URL: ${session.url}`);
    }

    return session;
  } catch (stripeError) {
    logStep("ERROR: Stripe session creation failed", { error: stripeError.message });
    throw new Error(`Stripe error: ${stripeError.message}`);
  }
}

// Update purchase record with Stripe session information
async function updatePurchaseWithSessionId(supabase, purchaseId, sessionId, totalAmount, hasDocumentRetrieval) {
  logStep("Updating purchase with session ID", { purchaseId, sessionId, totalAmount });
  
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
    logStep("WARNING: Failed to update purchase with session ID", { error: updateSessionError });
    // Non-critical error, continue execution
  } else {
    logStep("Purchase updated with session ID successfully");
  }
}

// Create error response with CORS headers
function createErrorResponse(message, status = 400) {
  logStep("Creating error response", { message, status });
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
  logStep("Creating success response", { hasUrl: !!data.url });
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

  logStep("Function invoked", { method: req.method });

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

    logStep("Request data parsed", { 
      purchaseId, 
      hasDocumentRetrievalService, 
      ownersCount, 
      propertiesCount, 
      totalAmount 
    });

    if (!purchaseId) {
      logStep("ERROR: Missing purchase ID");
      return createErrorResponse("Purchase ID is required");
    }

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

  } catch (error) {
    logStep("ERROR: Function execution failed", { message: error.message, stack: error.stack });
    return createErrorResponse(error.message);
  }
});
