
import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Owner } from '@/components/dashboard/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface OwnersTableProps {
  owners: Owner[];
}

export const OwnersTable: React.FC<OwnersTableProps> = ({ owners }) => {
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  
  const openOwnerDialog = (owner: Owner) => {
    setSelectedOwner(owner);
  };
  
  const closeOwnerDialog = () => {
    setSelectedOwner(null);
  };

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
                <TableRow 
                  key={owner.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openOwnerDialog(owner)}
                >
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

      {/* Owner Detail Dialog */}
      <Dialog open={selectedOwner !== null} onOpenChange={() => closeOwnerDialog()}>
        <DialogContent className="max-w-2xl">
          {selectedOwner && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <DialogTitle>{`${selectedOwner.firstName} ${selectedOwner.lastName}`}</DialogTitle>
                </div>
                <DialogDescription>
                  Owner details
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm">Personal Information</h3>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm"><span className="font-medium">Full Name:</span> {`${selectedOwner.firstName} ${selectedOwner.lastName}`}</p>
                      <p className="text-sm">
                        <span className="font-medium">Date of Birth:</span> {selectedOwner.dateOfBirth ? format(selectedOwner.dateOfBirth, 'MMM d, yyyy') : 'N/A'}
                      </p>
                      <p className="text-sm"><span className="font-medium">Country of Birth:</span> {selectedOwner.countryOfBirth}</p>
                      <p className="text-sm"><span className="font-medium">Citizenship:</span> {selectedOwner.citizenship}</p>
                      <p className="text-sm"><span className="font-medium">Marital Status:</span> {selectedOwner.maritalStatus}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm">Address</h3>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm"><span className="font-medium">Street:</span> {selectedOwner.address.street}</p>
                      <p className="text-sm"><span className="font-medium">City:</span> {selectedOwner.address.city}</p>
                      <p className="text-sm"><span className="font-medium">ZIP:</span> {selectedOwner.address.zip}</p>
                      <p className="text-sm"><span className="font-medium">Country:</span> {selectedOwner.address.country}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium text-sm">Tax Information</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><span className="font-medium">Italian Tax Code:</span> {selectedOwner.italianTaxCode || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Resident in Italy:</span> {selectedOwner.isResidentInItaly ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
