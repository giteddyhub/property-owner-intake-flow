import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Owner, 
  Property, 
  OwnerPropertyAssignment
} from '@/types/form';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsSummaryCards } from '@/components/dashboard/StatsSummaryCards';
import { TimeRangeSelector } from '@/components/dashboard/TimeRangeSelector';
import { DataFilterTabs } from '@/components/dashboard/DataFilterTabs';
import { DataTables } from '@/components/dashboard/DataTables';
import { ActionsToolbar } from '@/components/dashboard/ActionsToolbar';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assignments, setAssignments] = useState<OwnerPropertyAssignment[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('12m');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data: ownersData, error: ownersError } = await supabase
          .from('owners')
          .select('*')
          .eq('user_id', user.id);

        if (ownersError) throw ownersError;
        
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id);

        if (propertiesError) throw propertiesError;
        
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('owner_property_assignments')
          .select('*')
          .in('owner_id', ownersData.map(o => o.id));

        if (assignmentsError) throw assignmentsError;
        
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
          isResidentInItaly: dbOwner.is_resident_in_italy
        }));
        
        const mappedProperties: Property[] = propertiesData.map(dbProperty => {
          let parsedDocuments: PropertyDocument[] = [];
          if (dbProperty.documents && Array.isArray(dbProperty.documents)) {
            try {
              parsedDocuments = dbProperty.documents.map(docString => {
                try {
                  return JSON.parse(docString);
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

          let parsedOccupancyStatuses: OccupancyAllocation[] = [];
          try {
            if (typeof dbProperty.occupancy_statuses === 'string') {
              parsedOccupancyStatuses = JSON.parse(dbProperty.occupancy_statuses);
            } else if (Array.isArray(dbProperty.occupancy_statuses)) {
              parsedOccupancyStatuses = dbProperty.occupancy_statuses.map(item => {
                if (typeof item === 'string') {
                  try {
                    return JSON.parse(item);
                  } catch (e) {
                    return { status: 'PERSONAL_USE' as OccupancyStatus, months: 12 };
                  }
                }
                return item as OccupancyAllocation;
              });
            }
          } catch (e) {
            console.error('Error parsing occupancy statuses:', e);
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
            useDocumentRetrievalService: dbProperty.use_document_retrieval_service
          };
        });
        
        const mappedAssignments: OwnerPropertyAssignment[] = assignmentsData.map(dbAssignment => ({
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
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 relative">
          <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Your Dashboard</h1>
          <ActionsToolbar />
        </div>

        <StatsSummaryCards 
          ownersCount={owners.length} 
          propertiesCount={properties.length} 
          assignmentsCount={assignments.length} 
        />

        <div className="bg-white rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Overview</h2>
            <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <DataFilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <DataTables properties={properties} owners={owners} assignments={assignments} />
          </div>
        </div>
        
        <div className="flex justify-center mt-8 mb-4">
          <Button 
            onClick={() => navigate('/')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            variant="outline"
          >
            Start New Submission
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
