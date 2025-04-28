
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, BarChart, Calendar, Export, Filter, Search, Settings, User } from 'lucide-react';
import { 
  Owner, 
  Property, 
  OwnerPropertyAssignment, 
  Address, 
  PropertyAddress, 
  ActivityType, 
  PropertyType, 
  OccupancyAllocation, 
  MaritalStatus, 
  PropertyDocument,
  OccupancyStatus 
} from '@/types/form';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

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

  // Get the user initials for the avatar
  const getUserInitials = () => {
    if (!user || !user.user_metadata || !user.user_metadata.full_name) return 'U';
    const fullName = user.user_metadata.full_name;
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`;
    }
    return nameParts[0][0] || 'U';
  };

  // Format property activity for display
  const getActivityBadgeVariant = (activity: ActivityType): "default" | "secondary" | "destructive" | "outline" => {
    switch (activity) {
      case 'PURCHASE':
        return 'default';
      case 'SALE':
        return 'destructive';
      case 'OWNED':
        return 'secondary';
      default:
        return 'outline';
    }
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
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-semibold">UI</span>
            </div>
            <span className="font-semibold text-gray-900">Property Dashboard</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Home</a>
            <a href="#" className="text-gray-900 font-medium text-sm">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Properties</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Documents</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm">Reports</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-900">
              <Search className="h-5 w-5" />
            </button>
            <button className="text-gray-500 hover:text-gray-900">
              <Settings className="h-5 w-5" />
            </button>
            <div className="relative">
              <Avatar className="h-8 w-8 cursor-pointer" onClick={handleSignOut}>
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Your Dashboard</h1>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-600 border border-gray-200 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-gray-600 border border-gray-200 hover:bg-gray-50"
            >
              <Export className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-500">Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-semibold">{properties.length}</div>
                  <div className="text-sm text-green-500 flex items-center mt-1">
                    +2.4% <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </div>
                <div className="h-12 w-24">
                  <svg className="h-full w-full" viewBox="0 0 100 40">
                    <path d="M0,40 L5,35 L10,38 L15,30 L20,32 L25,28 L30,25 L35,27 L40,24 L45,20 L50,22 L55,18 L60,15 L65,17 L70,13 L75,15 L80,10 L85,12 L90,7 L95,9 L100,5" fill="none" stroke="#DCFCE7" strokeWidth="3" />
                    <path d="M0,40 L5,35 L10,38 L15,30 L20,32 L25,28 L30,25 L35,27 L40,24 L45,20 L50,22 L55,18 L60,15 L65,17 L70,13 L75,15 L80,10 L85,12 L90,7 L95,9 L100,5" fill="none" stroke="#22C55E" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-500">Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-semibold">{owners.length}</div>
                  <div className="text-sm text-green-500 flex items-center mt-1">
                    +6.2% <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </div>
                <div className="h-12 w-24">
                  <svg className="h-full w-full" viewBox="0 0 100 40">
                    <path d="M0,35 L5,32 L10,34 L15,30 L20,28 L25,30 L30,25 L35,23 L40,25 L45,20 L50,18 L55,20 L60,15 L65,13 L70,17 L75,12 L80,10 L85,12 L90,7 L95,5 L100,8" fill="none" stroke="#DBEAFE" strokeWidth="3" />
                    <path d="M0,35 L5,32 L10,34 L15,30 L20,28 L25,30 L30,25 L35,23 L40,25 L45,20 L50,18 L55,20 L60,15 L65,13 L70,17 L75,12 L80,10 L85,12 L90,7 L95,5 L100,8" fill="none" stroke="#3B82F6" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-500">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-semibold">{assignments.length}</div>
                  <div className="text-sm text-green-500 flex items-center mt-1">
                    +4.7% <ArrowRight className="h-3 w-3 ml-1" />
                  </div>
                </div>
                <div className="h-12 w-24">
                  <svg className="h-full w-full" viewBox="0 0 100 40">
                    <path d="M0,32 L5,30 L10,33 L15,28 L20,30 L25,25 L30,27 L35,22 L40,24 L45,19 L50,21 L55,16 L60,18 L65,13 L70,15 L75,10 L80,12 L85,7 L90,9 L95,4 L100,6" fill="none" stroke="#FEF3C7" strokeWidth="3" />
                    <path d="M0,32 L5,30 L10,33 L15,28 L20,30 L25,25 L30,27 L35,22 L40,24 L45,19 L50,21 L55,16 L60,18 L65,13 L70,15 L75,10 L80,12 L85,7 L90,9 L95,4 L100,6" fill="none" stroke="#F59E0B" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Overview</h2>
            
            <div className="bg-gray-50 rounded-lg p-0.5 flex">
              <button 
                className={`px-3 py-1.5 text-sm rounded-md ${timeRange === '12m' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}
                onClick={() => setTimeRange('12m')}
              >
                12m
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-md ${timeRange === '30d' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}
                onClick={() => setTimeRange('30d')}
              >
                30d
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-md ${timeRange === '7d' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}
                onClick={() => setTimeRange('7d')}
              >
                7d
              </button>
              <button 
                className={`px-3 py-1.5 text-sm rounded-md ${timeRange === '24h' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}
                onClick={() => setTimeRange('24h')}
              >
                24h
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="bg-gray-50 p-0.5 rounded-lg inline-flex mb-4">
              <button 
                className={`px-4 py-2 text-sm ${activeFilter === 'all' ? 'bg-white shadow-sm rounded-md' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All data
              </button>
              <button 
                className={`px-4 py-2 text-sm ${activeFilter === 'properties' ? 'bg-white shadow-sm rounded-md' : ''}`}
                onClick={() => setActiveFilter('properties')}
              >
                Properties
              </button>
              <button 
                className={`px-4 py-2 text-sm ${activeFilter === 'owners' ? 'bg-white shadow-sm rounded-md' : ''}`}
                onClick={() => setActiveFilter('owners')}
              >
                Owners
              </button>
              <button 
                className={`px-4 py-2 text-sm ${activeFilter === 'assignments' ? 'bg-white shadow-sm rounded-md' : ''}`}
                onClick={() => setActiveFilter('assignments')}
              >
                Assignments
              </button>
            </div>
            
            <Tabs defaultValue="properties" className="w-full">
              <TabsList className="border-b border-gray-100 w-full justify-start mb-6 bg-transparent">
                <TabsTrigger value="properties" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-4 py-2">
                  Properties
                </TabsTrigger>
                <TabsTrigger value="owners" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-4 py-2">
                  Owners
                </TabsTrigger>
                <TabsTrigger value="assignments" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none rounded-none bg-transparent px-4 py-2">
                  Assignments
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="properties" className="mt-0">
                <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-white">
                        <TableHead className="text-xs font-medium text-gray-500">Label</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Type</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Location</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Activity</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Purchase Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No properties found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        properties.map((property) => (
                          <TableRow key={property.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{property.label}</TableCell>
                            <TableCell>{property.propertyType}</TableCell>
                            <TableCell>{`${property.address.street}, ${property.address.comune}`}</TableCell>
                            <TableCell>
                              <Badge variant={getActivityBadgeVariant(property.activity2024)}>
                                {property.activity2024}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {property.purchaseDate ? format(property.purchaseDate, 'MMM d, yyyy') : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {properties.length > 0 && (
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="text-gray-500">
                      Showing {Math.min(properties.length, 5)} of {properties.length} properties
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-50 border-blue-200 text-blue-700">
                        1
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="owners">
                <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-white">
                        <TableHead className="text-xs font-medium text-gray-500">Name</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Citizenship</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Tax Code</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Resident in Italy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {owners.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            No owners found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        owners.map((owner) => (
                          <TableRow key={owner.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{`${owner.firstName} ${owner.lastName}`}</TableCell>
                            <TableCell>{owner.citizenship}</TableCell>
                            <TableCell>{owner.italianTaxCode || 'N/A'}</TableCell>
                            <TableCell>{owner.isResidentInItaly ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {owners.length > 0 && (
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="text-gray-500">
                      Showing {Math.min(owners.length, 5)} of {owners.length} owners
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-50 border-blue-200 text-blue-700">
                        1
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="assignments">
                <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-white">
                        <TableHead className="text-xs font-medium text-gray-500">Owner</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Property</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Ownership %</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Resident</TableHead>
                        <TableHead className="text-xs font-medium text-gray-500">Tax Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No assignments found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignments.map((assignment) => {
                          const owner = owners.find(o => o.id === assignment.ownerId);
                          const property = properties.find(p => p.id === assignment.propertyId);
                          
                          return (
                            <TableRow key={`${assignment.ownerId}-${assignment.propertyId}`} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                {owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown owner'}
                              </TableCell>
                              <TableCell>{property ? property.label : 'Unknown property'}</TableCell>
                              <TableCell>{assignment.ownershipPercentage}%</TableCell>
                              <TableCell>{assignment.residentAtProperty ? 'Yes' : 'No'}</TableCell>
                              <TableCell>
                                {assignment.taxCredits ? `€${assignment.taxCredits.toLocaleString()}` : 'N/A'}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {assignments.length > 0 && (
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <div className="text-gray-500">
                      Showing {Math.min(assignments.length, 5)} of {assignments.length} assignments
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-50 border-blue-200 text-blue-700">
                        1
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
