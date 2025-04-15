
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

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

    // Create custom checkout link
    const checkoutLink = `${req.headers.get("origin")}/payment-success?contact=${contactId}`;

    // Update contact with custom checkout link
    const { error: updateError } = await supabase
      .from("contacts")
      .update({ custom_checkout_link: checkoutLink })
      .eq("id", contactId);

    if (updateError) {
      console.error("Error updating contact with custom link:", updateError);
      throw new Error(`Error updating contact: ${updateError.message}`);
    }

    // Fetch contact info
    const { data: contactData, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .single();

    if (contactError || !contactData) {
      console.error("Error fetching contact:", contactError);
      throw new Error(`Error fetching contact: ${contactError?.message || "Contact not found"}`);
    }

    // Get owner information
    const { data: owners, error: ownersError } = await supabase
      .from("owners")
      .select("*")
      .eq("contact_id", contactId);

    if (ownersError) {
      console.error("Error fetching owners:", ownersError);
      throw new Error(`Error fetching owners: ${ownersError.message}`);
    }

    // Get property information
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("*")
      .eq("contact_id", contactId);

    if (propertiesError) {
      console.error("Error fetching properties:", propertiesError);
      throw new Error(`Error fetching properties: ${propertiesError.message}`);
    }

    // Get assignments information
    const { data: assignments, error: assignmentsError } = await supabase
      .from("owner_property_assignments")
      .select("*")
      .eq("contact_id", contactId);

    if (assignmentsError) {
      console.error("Error fetching assignments:", assignmentsError);
      throw new Error(`Error fetching assignments: ${assignmentsError.message}`);
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add title
    page.drawText("Italian Tax Profile", {
      x: 50,
      y: height - 50,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.6),
    });

    // Add contact information
    page.drawText(`Name: ${contactData.full_name}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font,
    });

    page.drawText(`Email: ${contactData.email}`, {
      x: 50,
      y: height - 120,
      size: 12,
      font,
    });

    // Add properties information
    page.drawText("Properties:", {
      x: 50,
      y: height - 160,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.6),
    });

    let yPosition = height - 180;
    properties.forEach((property, index) => {
      page.drawText(`${index + 1}. ${property.label}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= 20;
      page.drawText(`   Address: ${property.address_street}, ${property.address_comune}, ${property.address_province}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 20;
    });

    // Add owners information
    yPosition -= 20;
    page.drawText("Owners:", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.6),
    });

    yPosition -= 20;
    owners.forEach((owner, index) => {
      page.drawText(`${index + 1}. ${owner.first_name} ${owner.last_name}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= 20;
      page.drawText(`   Tax Code: ${owner.italian_tax_code}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 20;
    });

    // Add CTA
    const ctaPage = pdfDoc.addPage();
    const ctaHeight = ctaPage.getSize().height;

    ctaPage.drawText("Ready for your Italian Tax Filing?", {
      x: 50,
      y: ctaHeight - 100,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.6),
    });

    ctaPage.drawText("Our professional team will handle everything for you:", {
      x: 50,
      y: ctaHeight - 130,
      size: 12,
      font,
    });

    let ctaYPosition = ctaHeight - 160;
    const ctaItems = [
      "Complete tax return preparation",
      "Direct filing with Italian tax authorities",
      "Personalized tax optimization advice",
      "Priority support via email and phone",
    ];

    ctaItems.forEach((item) => {
      ctaPage.drawText(`• ${item}`, {
        x: 50,
        y: ctaYPosition,
        size: 12,
        font,
      });
      ctaYPosition -= 20;
    });

    ctaPage.drawText("Visit your personal checkout page:", {
      x: 50,
      y: ctaYPosition - 30,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.6),
    });

    ctaPage.drawText(checkoutLink, {
      x: 50,
      y: ctaYPosition - 50,
      size: 12,
      font,
      color: rgb(0, 0.3, 0.8),
    });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    
    // Mark PDF as generated in the database
    await supabase
      .from("contacts")
      .update({ pdf_generated: true })
      .eq("id", contactId);

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
