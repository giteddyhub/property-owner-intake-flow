
import React from 'react';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Owner, 
  Property, 
  OwnerPropertyAssignment,
  ActivityType
} from '@/components/dashboard/types';

// Helper function to determine badge variant based on activity
const getActivityBadgeVariant = (activity: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (activity) {
    case 'purchased':
      return 'default';
    case 'sold':
      return 'destructive';
    case 'owned_all_year':
      return 'secondary';
    case 'both':
      return 'outline';
    default:
      return 'outline';
  }
};

interface PropertiesTableProps {
  properties: Property[];
}

const PropertiesTable: React.FC<PropertiesTableProps> = ({ properties }) => {
  return (
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
  );
};

interface OwnersTableProps {
  owners: Owner[];
}

const OwnersTable: React.FC<OwnersTableProps> = ({ owners }) => {
  return (
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
  );
};

interface AssignmentsTableProps {
  assignments: OwnerPropertyAssignment[];
  owners: Owner[];
  properties: Property[];
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ assignments, owners, properties }) => {
  return (
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
  );
};

interface DataTablesProps {
  properties: Property[];
  owners: Owner[];
  assignments: OwnerPropertyAssignment[];
}

export const DataTables: React.FC<DataTablesProps> = ({ 
  properties, 
  owners, 
  assignments 
}) => {
  return (
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
      
      <PropertiesTable properties={properties} />
      <OwnersTable owners={owners} />
      <AssignmentsTable assignments={assignments} owners={owners} properties={properties} />
    </Tabs>
  );
};
