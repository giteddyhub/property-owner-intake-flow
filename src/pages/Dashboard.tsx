
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '@/contexts/FormContext';
import { 
  BarChart, 
  CalendarDays, 
  Download, 
  Filter, 
  Home as HomeIcon, 
  LineChart,
  TrendingUp 
} from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Property, Owner } from '@/types/form';

const Dashboard = () => {
  const navigate = useNavigate();
  const { state } = useFormContext();
  const { owners, properties, assignments } = state;
  
  // Check if we have form data, if not, redirect to home page
  useEffect(() => {
    if (owners.length === 0 && properties.length === 0) {
      toast.error('No data available', {
        description: 'Please complete the property owner intake form first.',
      });
      navigate('/');
    }
  }, [owners, properties, navigate]);

  // Generate stats
  const totalProperties = properties.length;
  const totalOwners = owners.length;
  const totalAssignments = assignments.length;
  const totalRentalIncome = properties.reduce((sum, property) => 
    sum + (property.rentalIncome || 0), 0);
  
  // Calculate percentage of properties with rental income
  const propertiesWithRental = properties.filter(p => 
    p.occupancyStatuses.some(status => 
      status === 'LONG_TERM_RENT' || status === 'SHORT_TERM_RENT'
    )
  ).length;
  
  const rentalPercentage = totalProperties > 0 
    ? Math.round((propertiesWithRental / totalProperties) * 100) 
    : 0;
  
  // Calculate total tax credits
  const totalTaxCredits = assignments.reduce((sum, assignment) => 
    sum + (assignment.taxCredits || 0), 0);
  
  // Generate fake chart data
  const generateChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map((month, index) => {
      // Create a somewhat realistic curve for rental income distribution through the year
      const seasonalFactor = 
        index >= 5 && index <= 8 ? 1.3 :  // Summer months (Jun-Sep)
        index >= 9 && index <= 11 ? 0.9 : // Fall months (Oct-Dec)
        index >= 0 && index <= 2 ? 0.8 :  // Winter months (Jan-Mar)
        1.1;                              // Spring months (Apr-May)
      
      // Base value derived from actual total rental income
      const baseValue = (totalRentalIncome / 12) * seasonalFactor;
      
      // Add some randomness
      const randomFactor = 0.9 + Math.random() * 0.2;
      
      return {
        name: month,
        income: Math.round(baseValue * randomFactor)
      };
    });
  };

  const chartData = generateChartData();
  
  const handleDownloadSummary = () => {
    const formData = {
      owners,
      properties,
      assignments,
      submittedAt: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(formData, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'property-owner-submission.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Summary downloaded successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-form-400">Property Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <HomeIcon className="h-4 w-4 mr-2" />
              Return to Form
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadSummary} 
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Download Data
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Time Filters */}
        <div className="mb-6">
          <Tabs defaultValue="12months" className="w-full">
            <TabsList className="grid grid-cols-4 max-w-md bg-gray-100">
              <TabsTrigger value="12months">12 months</TabsTrigger>
              <TabsTrigger value="30days">30 days</TabsTrigger>
              <TabsTrigger value="7days">7 days</TabsTrigger>
              <TabsTrigger value="24hours">24 hours</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              Select dates
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Rental Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end">
                <span className="text-3xl font-bold">€{totalRentalIncome.toLocaleString()}</span>
                <span className="ml-2 text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  7.4%
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end">
                <span className="text-3xl font-bold">{totalProperties}</span>
                <span className="ml-2 text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  9.2%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end">
                <span className="text-3xl font-bold">{totalOwners}</span>
                <span className="ml-2 text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  6.6%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart section - 2/3 width */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Rental Income</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <LineChart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <BarChart className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis 
                      tickFormatter={(value) => `€${value}`} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => [`€${value}`, 'Rental Income']}
                      labelFormatter={(label) => `${label} 2024`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Additional stats - 1/3 width */}
          <div className="flex flex-col gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Rental Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end">
                  <span className="text-3xl font-bold">{rentalPercentage}%</span>
                  <span className="ml-2 text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    8.1%
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {propertiesWithRental} of {totalProperties} properties have rental income
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Tax Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end">
                  <span className="text-3xl font-bold">€{totalTaxCredits.toLocaleString()}</span>
                  <span className="ml-2 text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    12.3%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Property Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end">
                  <span className="text-3xl font-bold">{totalAssignments}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round(totalAssignments / totalProperties * 100) || 0}% assignment completion
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Property breakdown */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Property Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
        
        {/* Owner summary */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Owner Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {owners.map((owner, index) => (
              <OwnerCard key={owner.id} owner={owner} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Property Card Component
const PropertyCard = ({ property }: { property: Property }) => {
  // Calculate if property has rental income
  const hasRentalStatus = property.occupancyStatuses.some(
    status => status === 'LONG_TERM_RENT' || status === 'SHORT_TERM_RENT'
  );

  const formatOccupancyStatus = (statuses: string[]) => {
    const statusMap: Record<string, string> = {
      'PERSONAL_USE': 'Personal Use',
      'LONG_TERM_RENT': 'Long-term Rental',
      'SHORT_TERM_RENT': 'Short-term Rental'
    };
    
    return statuses.map(status => statusMap[status] || status).join(', ');
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {property.label || `Property in ${property.address.comune}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm grid gap-2">
        <div>
          <p className="text-gray-500">Address</p>
          <p>{property.address.street}, {property.address.comune}, {property.address.province}</p>
        </div>
        <div>
          <p className="text-gray-500">Type</p>
          <p>{property.propertyType}</p>
        </div>
        <div>
          <p className="text-gray-500">Occupancy</p>
          <p>{formatOccupancyStatus(property.occupancyStatuses)} ({property.monthsOccupied || 0} months)</p>
        </div>
        {hasRentalStatus && property.rentalIncome !== undefined && (
          <div>
            <p className="text-gray-500">Rental Income</p>
            <p className="font-semibold text-form-400">€{property.rentalIncome.toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Owner Card Component
const OwnerCard = ({ owner }: { owner: Owner }) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {owner.firstName} {owner.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm grid gap-2">
        <div>
          <p className="text-gray-500">Citizenship</p>
          <p>{owner.citizenship}</p>
        </div>
        <div>
          <p className="text-gray-500">Italian Resident</p>
          <p>{owner.isResidentInItaly ? 'Yes' : 'No'}</p>
        </div>
        {owner.isResidentInItaly && owner.italianResidenceDetails && (
          <div>
            <p className="text-gray-500">Italian Address</p>
            <p>
              {owner.italianResidenceDetails.street}, {owner.italianResidenceDetails.city}, {owner.italianResidenceDetails.comuneName}
            </p>
          </div>
        )}
        <div>
          <p className="text-gray-500">Italian Tax Code</p>
          <p>{owner.italianTaxCode || 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
