
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardData = ({ userId, refreshFlag = 0 }) => {
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState([]);
  const [properties, setProperties] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) {
        console.log('No user ID provided to useDashboardData hook');
        setLoading(false);
        return;
      }

      console.log(`Fetching dashboard data for user ID: ${userId}`);
      setLoading(true);
      setError(null);

      try {
        // Fetch owners for this user
        const { data: ownersData, error: ownersError } = await supabase
          .from('owners')
          .select('*')
          .eq('user_id', userId);

        if (ownersError) throw ownersError;
        console.log(`Fetched ${ownersData?.length || 0} owners`);

        // Transform owner data to match frontend model
        const transformedOwners = ownersData?.map(owner => ({
          id: owner.id,
          firstName: owner.first_name,
          lastName: owner.last_name,
          dateOfBirth: owner.date_of_birth ? new Date(owner.date_of_birth) : null,
          countryOfBirth: owner.country_of_birth,
          citizenship: owner.citizenship,
          address: {
            street: owner.address_street || '',
            city: owner.address_city || '',
            zip: owner.address_zip || '',
            country: owner.address_country || ''
          },
          italianTaxCode: owner.italian_tax_code,
          maritalStatus: owner.marital_status,
          isResidentInItaly: owner.is_resident_in_italy,
          italianResidenceDetails: {
            street: owner.italian_residence_street || '',
            city: owner.italian_residence_city || '',
            zip: owner.italian_residence_zip || ''
          }
        })) || [];

        // Fetch properties for this user
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', userId);

        if (propertiesError) throw propertiesError;
        console.log(`Fetched ${propertiesData?.length || 0} properties`);

        // Transform property data to match frontend model
        const transformedProperties = propertiesData?.map(property => {
          // Parse occupancy statuses from JSON string array
          let occupancyStatuses = [];
          try {
            if (property.occupancy_statuses && property.occupancy_statuses.length > 0) {
              // First item in array is a JSON string
              const jsonStr = property.occupancy_statuses[0];
              occupancyStatuses = JSON.parse(jsonStr) || [];
            }
          } catch (e) {
            console.error('Error parsing occupancy statuses:', e);
          }

          // Parse documents from JSON string array
          let documents = [];
          try {
            if (property.documents && property.documents.length > 0) {
              documents = property.documents.map(docStr => {
                try {
                  return JSON.parse(docStr);
                } catch (e) {
                  console.error('Error parsing document JSON:', e);
                  return null;
                }
              }).filter(doc => doc !== null);
            }
          } catch (e) {
            console.error('Error parsing documents:', e);
          }

          return {
            id: property.id,
            label: property.label,
            address: {
              comune: property.address_comune || '',
              province: property.address_province || '',
              street: property.address_street || '',
              zip: property.address_zip || ''
            },
            activity2024: property.activity_2024,
            purchaseDate: property.purchase_date ? new Date(property.purchase_date) : null,
            purchasePrice: property.purchase_price,
            saleDate: property.sale_date ? new Date(property.sale_date) : null,
            salePrice: property.sale_price,
            propertyType: property.property_type,
            remodeling: property.remodeling,
            occupancyStatuses: occupancyStatuses,
            rentalIncome: property.rental_income,
            documents: documents,
            useDocumentRetrievalService: property.use_document_retrieval_service
          };
        }) || [];

        // Fetch assignments for this user
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('owner_property_assignments')
          .select('*')
          .eq('user_id', userId);

        if (assignmentsError) throw assignmentsError;
        console.log(`Fetched ${assignmentsData?.length || 0} assignments`);

        // Transform assignment data to match frontend model
        const transformedAssignments = assignmentsData?.map(assignment => ({
          ownerId: assignment.owner_id,
          propertyId: assignment.property_id,
          ownershipPercentage: assignment.ownership_percentage,
          residentAtProperty: assignment.resident_at_property,
          residentDateRange: {
            from: assignment.resident_from_date ? new Date(assignment.resident_from_date) : null,
            to: assignment.resident_to_date ? new Date(assignment.resident_to_date) : null
          },
          taxCredits: assignment.tax_credits
        })) || [];

        // Set the data
        setOwners(transformedOwners);
        setProperties(transformedProperties);
        setAssignments(transformedAssignments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDashboardData();
    }
  }, [userId, refreshFlag]);

  return {
    loading,
    owners,
    properties,
    assignments,
    error,
  };
};
