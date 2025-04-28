
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/components/dashboard/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatOccupancyStatuses } from '@/components/form/property/utils/occupancyUtils';

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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const openPropertyDialog = (property: Property) => {
    setSelectedProperty(property);
  };
  
  const closePropertyDialog = () => {
    setSelectedProperty(null);
  };

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
                <TableRow 
                  key={property.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openPropertyDialog(property)}
                >
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

      {/* Property Detail Dialog */}
      <Dialog open={selectedProperty !== null} onOpenChange={() => closePropertyDialog()}>
        <DialogContent className="max-w-2xl">
          {selectedProperty && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <DialogTitle>{selectedProperty.label}</DialogTitle>
                </div>
                <DialogDescription>
                  {selectedProperty.propertyType} property details
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm">Basic Information</h3>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm"><span className="font-medium">Type:</span> {selectedProperty.propertyType}</p>
                      <p className="text-sm">
                        <span className="font-medium">Status in 2024:</span> {selectedProperty.activity2024.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Remodeling:</span> {selectedProperty.remodeling ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm">Location</h3>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm"><span className="font-medium">Street:</span> {selectedProperty.address.street}</p>
                      <p className="text-sm"><span className="font-medium">City:</span> {selectedProperty.address.comune}</p>
                      <p className="text-sm"><span className="font-medium">Province:</span> {selectedProperty.address.province}</p>
                      <p className="text-sm"><span className="font-medium">ZIP:</span> {selectedProperty.address.zip}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium text-sm">Financial Information</h3>
                  <div className="mt-2 space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Purchase Date:</span> {selectedProperty.purchaseDate ? format(selectedProperty.purchaseDate, 'MMM d, yyyy') : 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Purchase Price:</span> {selectedProperty.purchasePrice ? `€${Number(selectedProperty.purchasePrice).toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Sale Date:</span> {selectedProperty.saleDate ? format(selectedProperty.saleDate, 'MMM d, yyyy') : 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Sale Price:</span> {selectedProperty.salePrice ? `€${Number(selectedProperty.salePrice).toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium text-sm">Occupancy & Rental Information</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Occupancy Status:</span> {
                        Array.isArray(selectedProperty.occupancyStatuses) 
                          ? formatOccupancyStatuses(selectedProperty.occupancyStatuses)
                          : 'Not specified'
                      }
                    </p>
                    {selectedProperty.occupancyStatuses.some(allocation => 
                      allocation.status === 'LONG_TERM_RENT' || allocation.status === 'SHORT_TERM_RENT'
                    ) && (
                      <p className="text-sm">
                        <span className="font-medium">2024 Rental Income:</span> {selectedProperty.rentalIncome ? `€${selectedProperty.rentalIncome.toLocaleString()}` : '€0'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium text-sm">Documents</h3>
                  <div className="mt-2">
                    {selectedProperty.useDocumentRetrievalService ? (
                      <p className="text-sm">Using document retrieval service</p>
                    ) : selectedProperty.documents && selectedProperty.documents.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm">
                        {selectedProperty.documents.map((doc, index) => (
                          <li key={index}>{doc.name || `Document ${index + 1}`}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No documents available</p>
                    )}
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
