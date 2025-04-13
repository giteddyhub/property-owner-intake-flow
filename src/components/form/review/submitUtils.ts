
import { Owner, Property, OwnerPropertyAssignment, PropertyDocument } from '@/types/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ContactInfo {
  fullName: string;
  email: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export const submitFormData = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  contactInfo: ContactInfo
): Promise<void> => {
  try {
    const ownerIdMap = new Map<string, string>();
    const propertyIdMap = new Map<string, string>();
    
    console.log("Starting submission process with:", {
      ownersCount: owners.length,
      propertiesCount: properties.length,
      assignmentsCount: assignments.length,
      contactInfo
    });
    
    // Save contact information first
    const { data: contactData, error: contactError } = await supabase
      .from('contacts')
      .insert({
        full_name: contactInfo.fullName,
        email: contactInfo.email,
        submitted_at: new Date().toISOString()
      })
      .select();
      
    if (contactError) {
      console.error("Error saving contact:", contactError);
      throw new Error(`Error saving contact: ${contactError.message}`);
    }
    
    const contactId = contactData?.[0]?.id;
    if (!contactId) {
      console.error("Contact was saved but no ID was returned");
      throw new Error("Failed to get database ID for contact");
    }
    
    for (const owner of owners) {
      console.log("Saving owner:", owner.firstName, owner.lastName);
      
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .insert({
          first_name: owner.firstName,
          last_name: owner.lastName,
          date_of_birth: owner.dateOfBirth ? owner.dateOfBirth.toISOString().split('T')[0] : null,
          country_of_birth: owner.countryOfBirth,
          citizenship: owner.citizenship,
          address_street: owner.address.street,
          address_city: owner.address.city,
          address_zip: owner.address.zip,
          address_country: owner.address.country,
          italian_tax_code: owner.italianTaxCode,
          marital_status: owner.maritalStatus,
          is_resident_in_italy: owner.isResidentInItaly,
          spent_over_182_days: owner.italianResidenceDetails?.spentOver182Days,
          italian_residence_comune_name: owner.italianResidenceDetails?.comuneName,
          italian_residence_street: owner.italianResidenceDetails?.street,
          italian_residence_city: owner.italianResidenceDetails?.city,
          italian_residence_zip: owner.italianResidenceDetails?.zip,
          contact_id: contactId
        })
        .select();
        
      if (ownerError) {
        console.error("Error saving owner:", ownerError);
        throw new Error(`Error saving owner: ${ownerError.message}`);
      }
      
      if (ownerData && ownerData.length > 0) {
        ownerIdMap.set(owner.id, ownerData[0].id);
        console.log(`Mapped owner ${owner.id} to database ID ${ownerData[0].id}`);
      } else {
        console.error("Owner was saved but no data was returned");
        throw new Error("Failed to get database ID for owner");
      }
    }
    
    for (const property of properties) {
      console.log("Saving property:", property.label);
      
      // Convert OccupancyAllocation[] to string[] for database
      // Each string will have the format "STATUS:MONTHS", which we'll parse later if needed
      const occupancyStatusStrings = property.occupancyStatuses.map(
        allocation => `${allocation.status}:${allocation.months}`
      );
      
      // Convert any legacy 'neither' values to 'owned_all_year'
      const activity2024 = property.activity2024 === 'owned_all_year' ? 'owned_all_year' : property.activity2024;
      
      // Format document information for storage in the database
      // We'll store as JSON strings in a documents array
      const documentStrings = property.documents ? property.documents.map(doc => 
        JSON.stringify({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          uploadDate: doc.uploadDate.toISOString()
        })
      ) : [];
      
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert({
          label: property.label,
          address_comune: property.address.comune,
          address_province: property.address.province,
          address_street: property.address.street,
          address_zip: property.address.zip,
          activity_2024: activity2024,
          purchase_date: property.purchaseDate ? property.purchaseDate.toISOString().split('T')[0] : null,
          purchase_price: property.purchasePrice,
          sale_date: property.saleDate ? property.saleDate.toISOString().split('T')[0] : null,
          sale_price: property.salePrice,
          property_type: property.propertyType,
          remodeling: property.remodeling,
          occupancy_statuses: occupancyStatusStrings,
          rental_income: property.rentalIncome,
          contact_id: contactId,
          use_document_retrieval_service: property.useDocumentRetrievalService || false,
          documents: documentStrings.length > 0 ? documentStrings : null
        })
        .select();
        
      if (propertyError) {
        console.error("Error saving property:", propertyError);
        throw new Error(`Error saving property: ${propertyError.message}`);
      }
      
      if (propertyData && propertyData.length > 0) {
        propertyIdMap.set(property.id, propertyData[0].id);
        console.log(`Mapped property ${property.id} to database ID ${propertyData[0].id}`);
      } else {
        console.error("Property was saved but no data was returned");
        throw new Error("Failed to get database ID for property");
      }
    }
    
    console.log("ID Mappings created:", {
      owners: Array.from(ownerIdMap.entries()),
      properties: Array.from(propertyIdMap.entries())
    });
    
    for (const assignment of assignments) {
      const newPropertyId = propertyIdMap.get(assignment.propertyId);
      const newOwnerId = ownerIdMap.get(assignment.ownerId);
      
      if (!newPropertyId || !newOwnerId) {
        console.error('Could not find DB ID mapping for:', { 
          propertyId: assignment.propertyId,
          localPropertyExists: properties.some(p => p.id === assignment.propertyId),
          ownerId: assignment.ownerId,
          localOwnerExists: owners.some(o => o.id === assignment.ownerId),
          maps: { 
            properties: Array.from(propertyIdMap.entries()),
            owners: Array.from(ownerIdMap.entries())
          }
        });
        throw new Error('Failed to map local IDs to database IDs');
      }
      
      console.log("Saving assignment with mapped IDs:", {
        originalPropertyId: assignment.propertyId,
        newPropertyId,
        originalOwnerId: assignment.ownerId,
        newOwnerId
      });
      
      const insertData = {
        property_id: newPropertyId,
        owner_id: newOwnerId,
        ownership_percentage: assignment.ownershipPercentage,
        resident_at_property: assignment.residentAtProperty,
        resident_from_date: assignment.residentDateRange?.from 
          ? assignment.residentDateRange.from.toISOString().split('T')[0]
          : null,
        resident_to_date: assignment.residentDateRange?.to
          ? assignment.residentDateRange.to.toISOString().split('T')[0]
          : null,
        tax_credits: assignment.taxCredits,
        contact_id: contactId
      };
      
      console.log("Assignment data to insert:", insertData);
      
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('owner_property_assignments')
        .insert(insertData)
        .select();
        
      if (assignmentError) {
        console.error("Error saving assignment:", assignmentError);
        throw new Error(`Error saving assignment: ${assignmentError.message}`);
      }
    }
    
    toast({
      title: "Success",
      description: "Form submitted successfully! Thank you for completing the property owner intake process.",
      type: "success",
      duration: 5000,
    });
    
    window.location.href = 'https://www.italiantaxes.com/';
    
  } catch (error) {
    console.error('Error submitting form:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : 'Please try again later',
      type: "error",
    });
    throw error;
  }
};
