
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

    // Create custom checkout link with the custom subdomain
    const customDomain = "https://ittax.siedwebs.com";
    const checkoutLink = `${customDomain}/payment-success?contact=${contactId}`;

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
      
      // Add property type
      page.drawText(`   Type: ${formatPropertyType(property.property_type)}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 20;
      
      // Add activity in 2024
      page.drawText(`   Activity in 2024: ${formatActivityType(property.activity_2024)}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 20;
      
      // Add purchase/sale information if applicable
      if (property.activity_2024 === 'purchased' || property.activity_2024 === 'both') {
        if (property.purchase_date) {
          page.drawText(`   Purchase Date: ${formatDate(property.purchase_date)}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
        
        if (property.purchase_price) {
          page.drawText(`   Purchase Price: €${formatNumber(property.purchase_price)}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
      }
      
      if (property.activity_2024 === 'sold' || property.activity_2024 === 'both') {
        if (property.sale_date) {
          page.drawText(`   Sale Date: ${formatDate(property.sale_date)}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
        
        if (property.sale_price) {
          page.drawText(`   Sale Price: €${formatNumber(property.sale_price)}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
      }
      
      // Add occupancy information
      if (property.occupancy_statuses && property.occupancy_statuses.length > 0) {
        page.drawText(`   Occupancy: ${formatOccupancyStatuses(property.occupancy_statuses)}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font,
        });
        yPosition -= 15;
      }
      
      // Add rental income if applicable
      if (property.rental_income) {
        page.drawText(`   Rental Income: €${formatNumber(property.rental_income)}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font,
          color: rgb(0.2, 0.4, 0.6),
        });
        yPosition -= 15;
      }
      
      // Add remodeling information
      page.drawText(`   Remodeling in 2024: ${property.remodeling ? 'Yes' : 'No'}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      
      yPosition -= 30; // Add extra space between properties
    });

    // Add owners information
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
      
      // Add birth information
      if (owner.date_of_birth) {
        page.drawText(`   Born: ${formatDate(owner.date_of_birth)} in ${owner.country_of_birth}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font,
        });
        yPosition -= 15;
      }
      
      // Add citizenship
      page.drawText(`   Citizenship: ${owner.citizenship}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 15;
      
      // Add tax code
      page.drawText(`   Italian Tax Code: ${owner.italian_tax_code}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 15;
      
      // Add address
      page.drawText(`   Address: ${owner.address_street}, ${owner.address_city}, ${owner.address_zip}, ${owner.address_country}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 15;
      
      // Add marital status
      page.drawText(`   Marital Status: ${formatMaritalStatus(owner.marital_status)}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 15;
      
      // Add Italian residency information
      page.drawText(`   Italian Resident: ${owner.is_resident_in_italy ? 'Yes' : 'No'}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 15;
      
      if (owner.is_resident_in_italy) {
        if (owner.italian_residence_comune_name) {
          page.drawText(`   Residence Location: ${owner.italian_residence_comune_name}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
        
        if (owner.italian_residence_street) {
          page.drawText(`   Italian Address: ${owner.italian_residence_street}, ${owner.italian_residence_city || ''}, ${owner.italian_residence_zip || ''}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
        
        if (owner.spent_over_182_days !== null) {
          page.drawText(`   Spent over 182 days in Italy: ${owner.spent_over_182_days ? 'Yes' : 'No'}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
      }
      
      yPosition -= 10; // Add extra space between owners
    });

    // Check if we need a new page for assignments
    if (yPosition < 200 && assignments.length > 0) {
      page = pdfDoc.addPage();
      yPosition = height - 50;
    }

    // Add owner-property assignments
    if (assignments.length > 0) {
      page.drawText("Property Ownership:", {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.6),
      });
      
      yPosition -= 20;
      
      // Group assignments by property
      const propertiesByID = {};
      properties.forEach(prop => {
        propertiesByID[prop.id] = prop;
      });
      
      const ownersByID = {};
      owners.forEach(own => {
        ownersByID[own.id] = own;
      });
      
      // Group assignments by property
      const assignmentsByProperty = {};
      assignments.forEach(assignment => {
        if (!assignmentsByProperty[assignment.property_id]) {
          assignmentsByProperty[assignment.property_id] = [];
        }
        assignmentsByProperty[assignment.property_id].push(assignment);
      });
      
      // Print each property with its owners
      Object.keys(assignmentsByProperty).forEach(propertyId => {
        const property = propertiesByID[propertyId];
        if (!property) return;
        
        page.drawText(`Property: ${property.label || property.address_comune}`, {
          x: 50,
          y: yPosition,
          size: 11,
          font: boldFont,
        });
        yPosition -= 20;
        
        // Calculate total percentage
        const totalPercentage = assignmentsByProperty[propertyId].reduce(
          (sum, assignment) => sum + Number(assignment.ownership_percentage),
          0
        );
        
        page.drawText(`Total Ownership: ${totalPercentage}%`, {
          x: 50,
          y: yPosition,
          size: 10,
          font,
        });
        yPosition -= 15;
        
        // List each owner for this property
        assignmentsByProperty[propertyId].forEach(assignment => {
          const owner = ownersByID[assignment.owner_id];
          if (!owner) return;
          
          page.drawText(`   • ${owner.first_name} ${owner.last_name}: ${assignment.ownership_percentage}%${assignment.resident_at_property ? ' (Resident)' : ''}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
          
          // Add residence date range if applicable
          if (assignment.resident_at_property && (assignment.resident_from_date || assignment.resident_to_date)) {
            let residencePeriod = "    Residence period: ";
            if (assignment.resident_from_date) {
              residencePeriod += formatDate(assignment.resident_from_date);
            }
            if (assignment.resident_from_date && assignment.resident_to_date) {
              residencePeriod += " to ";
            }
            if (assignment.resident_to_date) {
              residencePeriod += formatDate(assignment.resident_to_date);
            }
            
            page.drawText(residencePeriod, {
              x: 50,
              y: yPosition,
              size: 10,
              font,
            });
            yPosition -= 15;
          }
          
          // Add tax credits if applicable
          if (assignment.tax_credits) {
            page.drawText(`    Tax Credits: €${formatNumber(assignment.tax_credits)}`, {
              x: 50,
              y: yPosition,
              size: 10,
              font,
            });
            yPosition -= 15;
          }
        });
        
        yPosition -= 10; // Add extra space between properties
      });
    }

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

// Helper function to format property type
function formatPropertyType(propertyType) {
  if (!propertyType) return "N/A";
  
  const types = {
    "RESIDENTIAL": "Residential",
    "B&B": "B&B",
    "COMMERCIAL": "Commercial",
    "LAND": "Land",
    "OTHER": "Other"
  };
  
  return types[propertyType] || propertyType;
}

// Helper function to format activity type
function formatActivityType(activityType) {
  if (!activityType) return "N/A";
  
  const activities = {
    "purchased": "Purchased in 2024",
    "sold": "Sold in 2024",
    "both": "Purchased & Sold in 2024",
    "owned_all_year": "Owned all year"
  };
  
  return activities[activityType] || activityType;
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to format number with commas
function formatNumber(num) {
  if (num === null || num === undefined) return "N/A";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Helper function to format marital status
function formatMaritalStatus(status) {
  if (!status) return "N/A";
  
  const statuses = {
    "UNMARRIED": "Unmarried",
    "MARRIED": "Married",
    "DIVORCED": "Divorced",
    "WIDOWED": "Widowed"
  };
  
  return statuses[status] || status;
}

// Helper function to format occupancy statuses
function formatOccupancyStatuses(statuses) {
  if (!statuses || !Array.isArray(statuses) || statuses.length === 0) {
    return "Not specified";
  }
  
  return statuses.map(status => {
    if (typeof status === 'string') {
      return formatOccupancyStatus(status);
    } else if (status && typeof status === 'object' && 'status' in status && 'months' in status) {
      return `${formatOccupancyStatus(status.status)} (${status.months} months)`;
    }
    return "Unknown";
  }).join(", ");
}

// Helper function to format occupancy status
function formatOccupancyStatus(status) {
  if (!status) return "N/A";
  
  const statuses = {
    "PERSONAL_USE": "Personal Use",
    "LONG_TERM_RENT": "Long-term Rental",
    "SHORT_TERM_RENT": "Short-term Rental"
  };
  
  return statuses[status] || status;
}

