
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { formatters } from "./formatters.ts";

export const pdfGenerator = {
  /**
   * Creates and returns a PDF document with all contact data
   */
  async generatePdf(data: any, checkoutLink: string): Promise<Uint8Array> {
    const { contactData, owners, properties, assignments } = data;
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Create the main content pages
    this.createContactInfoPage(pdfDoc, contactData);
    this.createPropertiesPages(pdfDoc, properties);
    this.createOwnersPages(pdfDoc, owners);
    this.createAssignmentsPages(pdfDoc, properties, assignments, owners);
    
    // Create the CTA page
    this.createCtaPage(pdfDoc, checkoutLink);
    
    // Generate PDF bytes
    return await pdfDoc.save();
  },
  
  /**
   * Creates the contact information page
   */
  async createContactInfoPage(pdfDoc: any, contactData: any) {
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
  },
  
  /**
   * Creates pages for all properties
   */
  async createPropertiesPages(pdfDoc: any, properties: any[]) {
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add properties information
    page.drawText("Properties:", {
      x: 50,
      y: height - 50,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.6),
    });
    
    let yPosition = height - 80;
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      
      // Check if we need a new page
      if (yPosition < 100) {
        const newPage = pdfDoc.addPage();
        yPosition = newPage.getSize().height - 50;
        page = newPage;
      }
      
      page.drawText(`${i + 1}. ${property.label}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
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
      page.drawText(`   Type: ${formatters.formatPropertyType(property.property_type)}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 20;
      
      // Add activity in 2024
      page.drawText(`   Activity in 2024: ${formatters.formatActivityType(property.activity_2024)}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });
      yPosition -= 20;
      
      // Add purchase/sale information if applicable
      if (property.activity_2024 === 'purchased' || property.activity_2024 === 'both') {
        if (property.purchase_date) {
          page.drawText(`   Purchase Date: ${formatters.formatDate(property.purchase_date)}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
        
        if (property.purchase_price) {
          page.drawText(`   Purchase Price: €${formatters.formatNumber(property.purchase_price)}`, {
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
          page.drawText(`   Sale Date: ${formatters.formatDate(property.sale_date)}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
        
        if (property.sale_price) {
          page.drawText(`   Sale Price: €${formatters.formatNumber(property.sale_price)}`, {
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
        page.drawText(`   Occupancy: ${formatters.formatOccupancyStatuses(property.occupancy_statuses)}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font,
        });
        yPosition -= 15;
      }
      
      // Add rental income if applicable
      if (property.rental_income) {
        page.drawText(`   Rental Income: €${formatters.formatNumber(property.rental_income)}`, {
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
    }
  },
  
  /**
   * Creates pages for all owners
   */
  async createOwnersPages(pdfDoc: any, owners: any[]) {
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add owners information
    page.drawText("Owners:", {
      x: 50,
      y: height - 50,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.6),
    });
    
    let yPosition = height - 80;
    
    for (let i = 0; i < owners.length; i++) {
      const owner = owners[i];
      
      // Check if we need a new page
      if (yPosition < 200) {
        const newPage = pdfDoc.addPage();
        yPosition = newPage.getSize().height - 50;
        page = newPage;
      }
      
      page.drawText(`${i + 1}. ${owner.first_name} ${owner.last_name}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont,
      });
      yPosition -= 20;
      
      // Add birth information
      if (owner.date_of_birth) {
        page.drawText(`   Born: ${formatters.formatDate(owner.date_of_birth)} in ${owner.country_of_birth}`, {
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
      page.drawText(`   Marital Status: ${formatters.formatMaritalStatus(owner.marital_status)}`, {
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
    }
  },
  
  /**
   * Creates pages for all property-owner assignments
   */
  async createAssignmentsPages(pdfDoc: any, properties: any[], assignments: any[], owners: any[]) {
    if (assignments.length === 0) return;
    
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPosition = height - 50;
    
    // Add owner-property assignments
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
    const propertyIds = Object.keys(assignmentsByProperty);
    for (let i = 0; i < propertyIds.length; i++) {
      const propertyId = propertyIds[i];
      const property = propertiesByID[propertyId];
      if (!property) continue;
      
      // Check if we need a new page
      if (yPosition < 150) {
        const newPage = pdfDoc.addPage();
        yPosition = newPage.getSize().height - 50;
        page = newPage;
      }
      
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
      const propertyAssignments = assignmentsByProperty[propertyId];
      for (let j = 0; j < propertyAssignments.length; j++) {
        const assignment = propertyAssignments[j];
        const owner = ownersByID[assignment.owner_id];
        if (!owner) continue;
        
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
            residencePeriod += formatters.formatDate(assignment.resident_from_date);
          }
          if (assignment.resident_from_date && assignment.resident_to_date) {
            residencePeriod += " to ";
          }
          if (assignment.resident_to_date) {
            residencePeriod += formatters.formatDate(assignment.resident_to_date);
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
          page.drawText(`    Tax Credits: €${formatters.formatNumber(assignment.tax_credits)}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 15;
        }
      }
      
      yPosition -= 10; // Add extra space between properties
    }
  },
  
  /**
   * Creates the call-to-action page with checkout link
   */
  async createCtaPage(pdfDoc: any, checkoutLink: string) {
    const ctaPage = pdfDoc.addPage();
    const ctaHeight = ctaPage.getSize().height;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
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
    
    for (const item of ctaItems) {
      ctaPage.drawText(`• ${item}`, {
        x: 50,
        y: ctaYPosition,
        size: 12,
        font,
      });
      ctaYPosition -= 20;
    }
    
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
  }
};
