
import React from 'react';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/components/dashboard/types';

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

export const PropertiesTable: React.FC<PropertiesTableProps> = ({ properties }) => {
  return (
    <div className="mt-0">
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
    </div>
  );
};
