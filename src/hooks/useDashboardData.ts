
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Owner, 
  Property, 
  OwnerPropertyAssignment,
  MaritalStatus,
  PropertyDocument,
  OccupancyAllocation,
  OccupancyStatus,
  ActivityType,
  PropertyType
} from '@/components/dashboard/types';

interface UseDashboardDataProps {
  userId: string | undefined;
  refreshFlag?: number;
}

interface UseDashboardDataReturn {
  loading: boolean;
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
}

export const useDashboardData = ({ userId, refreshFlag = 0 }: UseDashboardDataProps): UseDashboardDataReturn => {
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assignments, setAssignments] = useState<OwnerPropertyAssignment[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Use user_id fields instead of contact_id
        const { data: ownersData, error: ownersError } = await supabase
          .from('owners')
          .select('*')
          .eq('user_id', userId);

        if (ownersError) throw ownersError;
        
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', userId);

        if (propertiesError) throw propertiesError;
        
        // Only fetch assignments if we have owners
        let assignmentsData = [];
        if (ownersData && ownersData.length > 0) {
          const { data: fetchedAssignments, error: assignmentsError } = await supabase
            .from('owner_property_assignments')
            .select('*')
            .in('owner_id', ownersData.map(o => o.id));
            
          if (assignmentsError) throw assignmentsError;
          assignmentsData = fetchedAssignments;
        }
        
        // Map the data to our frontend types
        const mappedOwners: Owner[] = ownersData.map(dbOwner => ({
          id: dbOwner.id,
          firstName: dbOwner.first_name,
          lastName: dbOwner.last_name,
          dateOfBirth: dbOwner.date_of_birth ? new Date(dbOwner.date_of_birth) : null,
          countryOfBirth: dbOwner.country_of_birth,
          citizenship: dbOwner.citizenship,
          address: {
            street: dbOwner.address_street,
            city: dbOwner.address_city,
            zip: dbOwner.address_zip,
            country: dbOwner.address_country
          },
          italianTaxCode: dbOwner.italian_tax_code,
          maritalStatus: dbOwner.marital_status as MaritalStatus,
          isResidentInItaly: dbOwner.is_resident_in_italy,
          italianResidenceDetails: dbOwner.is_resident_in_italy ? {
            street: dbOwner.italian_residence_street,
            city: dbOwner.italian_residence_city,
            zip: dbOwner.italian_residence_zip
          } : undefined
        }));
        
        const mappedProperties: Property[] = propertiesData.map(dbProperty => {
          // Process documents
          let parsedDocuments: PropertyDocument[] = [];
          if (dbProperty.documents && Array.isArray(dbProperty.documents)) {
            try {
              parsedDocuments = dbProperty.documents.map(docString => {
                try {
                  if (typeof docString === 'string') {
                    return JSON.parse(docString);
                  }
                  return docString;
                } catch (e) {
                  return {
                    id: 'unknown',
                    name: docString,
                    type: 'unknown',
                    size: 0,
                    uploadDate: new Date()
                  };
                }
              });
            } catch (e) {
              console.error('Error parsing documents:', e);
            }
          }

          // Process occupancy statuses
          let parsedOccupancyStatuses: OccupancyAllocation[] = [];
          try {
            if (typeof dbProperty.occupancy_statuses === 'string') {
              parsedOccupancyStatuses = JSON.parse(dbProperty.occupancy_statuses);
            } else if (Array.isArray(dbProperty.occupancy_statuses)) {
              // Handle case when it's an array of strings that need parsing
              if (dbProperty.occupancy_statuses.length > 0 && typeof dbProperty.occupancy_statuses[0] === 'string') {
                // Try to parse the first element to see if it's a JSON string containing an array
                try {
                  const parsed = JSON.parse(dbProperty.occupancy_statuses[0]);
                  if (Array.isArray(parsed)) {
                    parsedOccupancyStatuses = parsed;
                  } else if (typeof parsed === 'object' && parsed !== null) {
                    parsedOccupancyStatuses = [parsed];
                  }
                } catch {
                  // If parsing failed, try to parse each string individually
                  parsedOccupancyStatuses = dbProperty.occupancy_statuses
                    .map(item => {
                      if (typeof item === 'string') {
                        try {
                          return JSON.parse(item);
                        } catch (e) {
                          console.error('Failed to parse occupancy status item:', item);
                          return null;
                        }
                      }
                      return item;
                    })
                    .filter(Boolean) as OccupancyAllocation[];
                }
              } else {
                // It's already an array of objects
                parsedOccupancyStatuses = dbProperty.occupancy_statuses.map(item => {
                  if (typeof item === 'object' && item !== null) {
                    return item as OccupancyAllocation;
                  }
                  return { status: 'PERSONAL_USE' as OccupancyStatus, months: 12 };
                });
              }
            }
            
            // Ensure we always have valid occupancy statuses
            if (!parsedOccupancyStatuses || parsedOccupancyStatuses.length === 0) {
              parsedOccupancyStatuses = [{ status: 'PERSONAL_USE' as OccupancyStatus, months: 12 }];
            }
            
            // Final validation pass to ensure all statuses have both status and months
            parsedOccupancyStatuses = parsedOccupancyStatuses
              .filter(item => item && typeof item === 'object' && 'status' in item && 'months' in item);
              
          } catch (e) {
            console.error('Error parsing occupancy statuses:', e, dbProperty.occupancy_statuses);
            parsedOccupancyStatuses = [{ status: 'PERSONAL_USE' as OccupancyStatus, months: 12 }];
          }

          return {
            id: dbProperty.id,
            label: dbProperty.label,
            address: {
              comune: dbProperty.address_comune,
              province: dbProperty.address_province,
              street: dbProperty.address_street,
              zip: dbProperty.address_zip
            },
            activity2024: dbProperty.activity_2024 as ActivityType,
            purchaseDate: dbProperty.purchase_date ? new Date(dbProperty.purchase_date) : null,
            purchasePrice: dbProperty.purchase_price ? Number(dbProperty.purchase_price) : undefined,
            saleDate: dbProperty.sale_date ? new Date(dbProperty.sale_date) : null,
            salePrice: dbProperty.sale_price ? Number(dbProperty.sale_price) : undefined,
            propertyType: dbProperty.property_type as PropertyType,
            remodeling: dbProperty.remodeling,
            occupancyStatuses: parsedOccupancyStatuses,
            rentalIncome: dbProperty.rental_income ? Number(dbProperty.rental_income) : undefined,
            documents: parsedDocuments,
            useDocumentRetrievalService: Boolean(dbProperty.use_document_retrieval_service)
          };
        });
        
        const mappedAssignments: OwnerPropertyAssignment[] = assignmentsData.map(dbAssignment => ({
          id: dbAssignment.id,
          propertyId: dbAssignment.property_id,
          ownerId: dbAssignment.owner_id,
          ownershipPercentage: Number(dbAssignment.ownership_percentage),
          residentAtProperty: dbAssignment.resident_at_property,
          residentDateRange: dbAssignment.resident_from_date ? {
            from: new Date(dbAssignment.resident_from_date),
            to: dbAssignment.resident_to_date ? new Date(dbAssignment.resident_to_date) : null
          } : undefined,
          taxCredits: dbAssignment.tax_credits ? Number(dbAssignment.tax_credits) : undefined
        }));
        
        setOwners(mappedOwners);
        setProperties(mappedProperties);
        setAssignments(mappedAssignments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load your data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, refreshFlag]);

  return { loading, owners, properties, assignments };
};
