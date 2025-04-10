
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { FormState, Owner, Property, OwnerPropertyAssignment, ActivityType, OccupancyStatus } from '@/types/form';

// Helper functions
const formatActivity = (activity: ActivityType) => {
  switch (activity) {
    case 'purchased':
      return 'Purchased in 2024';
    case 'sold':
      return 'Sold in 2024';
    case 'both':
      return 'Purchased & Sold in 2024';
    case 'neither':
      return 'Owned All Year';
    default:
      return activity;
  }
};

const formatOccupancyStatus = (status: OccupancyStatus) => {
  switch (status) {
    case 'PERSONAL_USE':
      return 'Personal Use';
    case 'LONG_TERM_RENT':
      return 'Long Term Rental';
    case 'SHORT_TERM_RENT':
      return 'Short Term Rental';
    default:
      return status;
  }
};

const formatDateOrNull = (date: Date | null) => {
  return date ? format(new Date(date), 'PPP') : 'N/A';
};

const formatMoney = (amount: number | undefined) => {
  return amount !== undefined ? `${amount.toLocaleString()} EUR` : 'N/A';
};

const formatPercentage = (percentage: number) => {
  return `${percentage}%`;
};

const generateQRCode = async (): Promise<string> => {
  try {
    const qrData = 'https://italiantaxes.com';
    return await QRCode.toDataURL(qrData);
  } catch (err) {
    console.error('QR Code generation error:', err);
    return '';
  }
};

// Main PDF generation function
export const generateTaxProfilePDF = async (formState: FormState): Promise<void> => {
  const { owners, properties, assignments } = formState;
  
  // Initialize PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set fonts
  doc.setFont('helvetica', 'normal');
  
  // Add Italian flag as image
  const flagImg = new Image();
  flagImg.src = '/lovable-uploads/6a7a7d62-400d-4db0-825b-5a6fdd10a2de.png';
  
  // Generate QR code
  const qrCode = await generateQRCode();
  
  // Background color
  doc.setFillColor(242, 250, 242); // Light green background
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
  
  // Add header for each owner
  let currentY = 20;
  let pageCount = 1;
  
  for (const owner of owners) {
    // Reset Y position for new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
      pageCount++;
    }
    
    // Owner name header
    doc.setFontSize(24);
    doc.setTextColor(38, 99, 61); // Dark green
    doc.text(`${owner.firstName.toUpperCase()} ${owner.lastName.toUpperCase()}`, 20, currentY);
    
    // TAX PROFILE text with flag
    doc.setFontSize(28);
    doc.setTextColor(38, 99, 61); // Dark green
    const taxProfileText = "TAX PROFILE";
    const taxProfileWidth = doc.getTextWidth(taxProfileText);
    doc.text(taxProfileText, doc.internal.pageSize.getWidth() - 20 - taxProfileWidth, currentY);
    
    // Horizontal line
    currentY += 8;
    doc.setDrawColor(38, 99, 61); // Dark green
    doc.setLineWidth(0.8);
    doc.line(20, currentY, doc.internal.pageSize.getWidth() - 20, currentY);
    
    // Introduction text
    currentY += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Your Italian Tax Profile (ITTAX™) serves as the foundation", doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
    currentY += 6;
    doc.text("for efficient and compliant tax filing in Italy.", doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
    
    // Thank you text
    currentY += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Thank you for using ItalianTaxes.com", doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
    
    // Properties section
    currentY += 15;
    doc.setFontSize(18);
    doc.setTextColor(38, 99, 61); // Dark green
    const ownerProperties = properties.filter(property => {
      return assignments.some(assignment => 
        assignment.propertyId === property.id && 
        assignment.ownerId === owner.id
      );
    });
    
    doc.text(`Properties (${ownerProperties.length})`, 20, currentY);
    
    // Add each property
    for (const property of ownerProperties) {
      currentY += 15;
      
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        doc.setFillColor(242, 250, 242); // Light green background for new page
        doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
        currentY = 20;
        pageCount++;
      }
      
      // Property card background
      doc.setFillColor(224, 232, 224); // Lighter green for property card
      doc.roundedRect(20, currentY, doc.internal.pageSize.getWidth() - 40, 90, 3, 3, 'F');
      
      // Property name
      currentY += 8;
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(property.label || `Property in ${property.address.comune}`, 25, currentY);
      
      // Ownership percentage
      const propertyAssignment = assignments.find(
        assignment => assignment.propertyId === property.id && assignment.ownerId === owner.id
      );
      
      if (propertyAssignment) {
        doc.setFillColor(38, 99, 61); // Dark green
        doc.setTextColor(255, 255, 255); // White text
        doc.roundedRect(
          doc.internal.pageSize.getWidth() - 80, 
          currentY - 5, 
          55, 
          10, 
          5, 
          5, 
          'F'
        );
        doc.setFontSize(11);
        doc.text(
          `Ownership: ${propertyAssignment.ownershipPercentage}%`, 
          doc.internal.pageSize.getWidth() - 52, 
          currentY, 
          { align: 'center' }
        );
      }
      
      // Address
      currentY += 10;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`📍 Address:`, 25, currentY);
      
      currentY += 6;
      doc.text(
        `${property.address.street}, ${property.address.zip} ${property.address.comune}`,
        25,
        currentY
      );
      currentY += 5;
      doc.text(`${property.address.province}, Italy`, 25, currentY);
      
      // Property details
      const midPoint = doc.internal.pageSize.getWidth() / 2;
      
      currentY += 8;
      doc.text(`Type: ${property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}`, midPoint, currentY);
      
      currentY += 6;
      doc.text(`Activity Status: ${formatActivity(property.activity2024)}`, midPoint, currentY);
      
      currentY += 6;
      doc.text(`Occupancy: ${Array.isArray(property.occupancyStatuses) ? 
        property.occupancyStatuses.map(status => formatOccupancyStatus(status)).join(', ') : 
        'Not specified'}`, midPoint, currentY);
      
      currentY += 6;
      doc.text(`Months Rented: ${property.monthsOccupied || 0} m`, midPoint, currentY);
      
      // Additional information
      currentY += 10;
      doc.setFontSize(11);
      doc.text(`⚠️ Additional information:`, 25, currentY);
      
      currentY += 6;
      doc.text(
        `Has remodeling or improvements ${property.remodeling ? 'with' : 'without'} building permits filed in the past 10 years`,
        25,
        currentY
      );
      
      // Rental earnings
      if (property.rentalIncome) {
        currentY += 10;
        doc.text(`💰 Rental earnings (2024):`, 25, currentY);
        
        currentY += 8;
        doc.setFontSize(16);
        doc.text(`${property.rentalIncome.toLocaleString()} EUR`, 25, currentY);
        
        doc.setFontSize(10);
        doc.text("make tax payments directly", 80, currentY - 3);
        doc.text("via ItalianTaxes.com", 80, currentY + 2);
      }
      
      // Residency status
      currentY += 12;
      doc.setFillColor(38, 99, 61); // Dark green
      doc.setTextColor(255, 255, 255); // White text
      doc.rect(20, currentY, doc.internal.pageSize.getWidth() - 40, 10, 'F');
      doc.setFontSize(11);
      
      if (propertyAssignment && propertyAssignment.residentAtProperty) {
        doc.text(`Registered as a resident at this property`, doc.internal.pageSize.getWidth() / 2, currentY + 6, { align: 'center' });
      } else {
        doc.text(`Never registered as a resident at this property`, doc.internal.pageSize.getWidth() / 2, currentY + 6, { align: 'center' });
      }
      
      currentY += 20; // Space for next property
    }
  }
  
  // Add footer to all pages
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer background
    doc.setFillColor(200, 200, 200);
    doc.rect(0, 270, doc.internal.pageSize.getWidth(), 27, 'F');
    
    // Logo and text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("ItalianTaxes.com", 90, 280);
    
    doc.setFontSize(12);
    doc.text("Get your Italian ", 90, 287);
    doc.setFont('helvetica', 'bold');
    doc.text("taxes filed", 140, 287);
    doc.setFont('helvetica', 'normal');
    doc.text(" in", 173, 287);
    
    doc.text("under ", 90, 294);
    doc.setFont('helvetica', 'bold');
    doc.text("14 days", 116, 294);
    doc.setFont('helvetica', 'normal');
    doc.text("!", 146, 294);
    
    // Social media handle
    doc.setFontSize(10);
    doc.text("@italiantaxes", 25, 294);
    
    // Add QR code if available
    if (qrCode) {
      try {
        doc.addImage(qrCode, 'PNG', 180, 275, 20, 20);
      } catch (err) {
        console.error('Error adding QR code to PDF:', err);
      }
    }
  }
  
  // Save the PDF
  doc.save("ItalianTaxProfile.pdf");
};
