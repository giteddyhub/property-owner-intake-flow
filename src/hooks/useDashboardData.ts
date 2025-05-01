
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
    // Don't try to fetch data if no userId is available
    if (!userId) {
      console.log("No userId provided to useDashboardData, skipping data fetch");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        console.log("Fetching user data for userId:", userId);
        
        // First, check if the user exists in the auth.users table
        const { data: authUserData, error: authUserError } = await supabase.auth.getUser();
        
        if (authUserError) {
          console.error("Error fetching auth user:", authUserError);
          // Continue anyway as we might be using a pendingUserId
        } else {
          console.log("Auth user data:", authUserData?.user?.id);
        }
        
        // Fetch contacts associated with this user
        const { data: contactsData, error: contactsError } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', userId);
        
        if (contactsError) {
          console.error("Error fetching contacts:", contactsError);
          throw contactsError;
        }
        
        console.log("Contacts associated with user:", contactsData?.length || 0);
        
        // Fetch owners data - use user_id directly
        const { data: ownersData, error: ownersError } = await supabase
          .from('owners')
          .select('*')
          .eq('user_id', userId);

        if (ownersError) {
          console.error("Error fetching owners:", ownersError);
          throw ownersError;
        }
        console.log("Owners data fetched:", ownersData?.length || 0);
        
        // Fetch properties data
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', userId);

        if (propertiesError) {
          console.error("Error fetching properties:", propertiesError);
          throw propertiesError;
        }
        console.log("Properties data fetched:", propertiesData?.length || 0);
        
        // If we have owners, fetch assignments related to those owners
        let assignmentsData = [];
        if (ownersData && ownersData.length > 0) {
          const ownerIds = ownersData.map(o => o.id);
          const { data, error: assignmentsError } = await supabase
            .from('owner_property_assignments')
            .select('*')
            .in('owner_id', ownerIds);
            
          if (assignmentsError) {
            console.error("Error fetching assignments:", assignmentsError);
            throw assignmentsError;
          }
          assignmentsData = data || [];
          console.log("Assignments data fetched:", assignmentsData.length);
        } else {
          console.log("No owners found, skipping assignments fetch");
          
          // Alternative attempt - try fetching assignments directly by user_id
          const { data, error: assignmentsError } = await supabase
            .from('owner_property_assignments')
            .select('*')
            .eq('user_id', userId);
            
          if (assignmentsError) {
            console.error("Error fetching assignments by user_id:", assignmentsError);
          } else {
            assignmentsData = data || [];
            console.log("Assignments data fetched by user_id:", assignmentsData.length);
          }
        }
        
        // Map the data to the expected formats
        const mappedOwners: Owner[] = (ownersData || []).map(dbOwner => ({
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
        
        const mappedProperties: Property[] = (propertiesData || []).map(dbProperty => {
          // Handle documents parsing
          let parsedDocuments: PropertyDocument[] = [];
          try {
            if (dbProperty.documents && Array.isArray(dbProperty.documents)) {
              parsedDocuments = dbProperty.documents.map(docString => {
                try {
                  if (typeof docString === 'string') {
                    return JSON.parse(docString);
                  }
                  return docString;
                } catch (e) {
                  console.log("Error parsing document string:", docString);
                  return {
                    id: 'unknown',
                    name: typeof docString === 'string' ? docString : 'Unknown document',
                    type: 'unknown',
                    size: 0,
                    uploadDate: new Date()
                  };
                }
              });
            }
          } catch (e) {
            console.error('Error parsing documents:', e);
          }

          // Handle occupancy statuses parsing
          let parsedOccupancyStatuses: OccupancyAllocation[] = [];
          try {
            if (typeof dbProperty.occupancy_statuses === 'string') {
              parsedOccupancyStatuses = JSON.parse(dbProperty.occupancy_statuses);
            } else if (Array.isArray(dbProperty.occupancy_statuses)) {
              // Handle case when it's an array of strings that need parsing
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
            
            // Ensure we always have valid occupancy statuses
            if (!parsedOccupancyStatuses || parsedOccupancyStatuses.length === 0) {
              parsedOccupancyStatuses = [{ status: 'PERSONAL_USE' as OccupancyStatus, months: 12 }];
            }
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
        
        if (!ownersData?.length && !propertiesData?.length) {
          console.warn("No data found for this user. This might be expected for new users.");
        }
        
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
