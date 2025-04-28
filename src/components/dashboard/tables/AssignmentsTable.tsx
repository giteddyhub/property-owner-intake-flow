
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';

interface AssignmentsTableProps {
  assignments: OwnerPropertyAssignment[];
  owners: Owner[];
  properties: Property[];
}

export const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ assignments, owners, properties }) => {
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
