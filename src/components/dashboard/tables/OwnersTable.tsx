
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Owner } from '@/components/dashboard/types';

interface OwnersTableProps {
  owners: Owner[];
}

export const OwnersTable: React.FC<OwnersTableProps> = ({ owners }) => {
  return (
    <div>
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
    </div>
  );
};
