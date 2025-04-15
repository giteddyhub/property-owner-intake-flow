
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { formatters } from "./formatters.ts";
import { pdfGenerator } from "./pdf-generator.ts";
import { dataService } from "./data-service.ts";

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
    const { contactId } = await req.json();

    if (!contactId) {
      throw new Error("Contact ID is required");
    }

    console.log("Generating PDF for contact:", contactId);

    // Create a Supabase client
    const supabaseUrl = "https://ijwwnaqprojdczfppxkf.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create custom checkout link with the custom subdomain
    const customDomain = "https://ittax.siedwebs.com";
    const checkoutLink = `${customDomain}/payment-success?contact=${contactId}`;

    // Update contact with custom checkout link
    await dataService.updateContactWithCheckoutLink(supabase, contactId, checkoutLink);

    // Fetch all required data for the PDF
    const data = await dataService.fetchAllContactData(supabase, contactId);

    // Generate PDF
    const pdfBytes = await pdfGenerator.generatePdf(data, checkoutLink);
    
    // Mark PDF as generated in the database
    await dataService.markPdfAsGenerated(supabase, contactId);

    // Return PDF data
    return new Response(
      JSON.stringify({
        success: true,
        checkoutLink,
        pdf: Array.from(pdfBytes),
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
