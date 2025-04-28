
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Owner, Property, OwnerPropertyAssignment, Address, PropertyAddress, ActivityType, PropertyType, OccupancyAllocation, MaritalStatus, PropertyDocument } from '@/types/form';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assignments, setAssignments] = useState<OwnerPropertyAssignment[]>([]);

  useEffect(() => {
    // If not logged in, redirect to home
    if (!user) {
      navigate('/');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch owners
        const { data: ownersData, error: ownersError } = await supabase
          .from('owners')
          .select('*')
          .eq('user_id', user.id);

        if (ownersError) throw ownersError;
        
        // Fetch properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id);

        if (propertiesError) throw propertiesError;
        
        // Fetch assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('owner_property_assignments')
          .select('*')
          .in('owner_id', ownersData.map(o => o.id));

        if (assignmentsError) throw assignmentsError;
        
        // Map database fields to our application types
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
        
        // Parse documents and occupancy statuses from database
        const mappedProperties: Property[] = propertiesData.map(dbProperty => {
          // Convert string[] to PropertyDocument[]
          let parsedDocuments: PropertyDocument[] = [];
          if (dbProperty.documents && Array.isArray(dbProperty.documents)) {
            try {
              // Try to parse each document string to PropertyDocument
              parsedDocuments = dbProperty.documents.map(docString => {
                try {
                  return JSON.parse(docString);
                } catch (e) {
                  // If parsing fails, create a minimal document object
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

          // Parse occupancy statuses
          let parsedOccupancyStatuses: OccupancyAllocation[] = [];
          try {
            if (typeof dbProperty.occupancy_statuses === 'string') {
              // If it's a JSON string, parse it
              parsedOccupancyStatuses = JSON.parse(dbProperty.occupancy_statuses);
            } else if (Array.isArray(dbProperty.occupancy_statuses)) {
              // If it's already an array, map the items
              parsedOccupancyStatuses = dbProperty.occupancy_statuses.map(item => {
                if (typeof item === 'string') {
                  try {
                    return JSON.parse(item);
                  } catch (e) {
                    // Default fallback if parsing fails
                    return { status: 'PERSONAL_USE' as OccupancyStatus, months: 12 };
                  }
                }
                return item as OccupancyAllocation;
              });
            }
          } catch (e) {
            console.error('Error parsing occupancy statuses:', e);
            // Provide a default occupancy status
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
        
        // Set the mapped data
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
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-form-400" />
        <p className="mt-2 text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h1 className="text-2xl font-bold">Your Dashboard</h1>
                  <p className="text-gray-600">Welcome back, {user?.email}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                  <TabsTrigger value="owners">Owners</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-600 font-medium">Properties</p>
                      <p className="text-2xl font-bold">{properties.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-sm text-green-600 font-medium">Owners</p>
                      <p className="text-2xl font-bold">{owners.length}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <p className="text-sm text-amber-600 font-medium">Assignments</p>
                      <p className="text-2xl font-bold">{assignments.length}</p>
                    </div>
                  </div>
                  
                  {owners.length === 0 && properties.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">You haven't submitted any information yet.</p>
                      <Button 
                        onClick={() => navigate('/')}
                        className="bg-form-400 hover:bg-form-500"
                      >
                        Start New Submission
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Recent Activity</h3>
                      <p className="text-gray-600">
                        Your submission has been received and is being processed.
                      </p>
                      <Button 
                        onClick={() => navigate('/')}
                        className="bg-form-400 hover:bg-form-500"
                      >
                        Start New Submission
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="properties">
                  {properties.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No properties found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {properties.map((property) => (
                        <div key={property.id} className="p-4 border rounded-lg">
                          <h3 className="font-medium">{property.label}</h3>
                          <p className="text-sm text-gray-600">
                            {property.address.street}, {property.address.comune}, {property.address.province}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Type: {property.propertyType}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="owners">
                  {owners.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No owners found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {owners.map((owner) => (
                        <div key={owner.id} className="p-4 border rounded-lg">
                          <h3 className="font-medium">{owner.firstName} {owner.lastName}</h3>
                          <p className="text-sm text-gray-600">
                            {owner.address.street}, {owner.address.city}, {owner.address.country}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
