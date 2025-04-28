
import React from 'react';
import { Property } from '@/types/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, FileText, UploadCloud } from 'lucide-react';
import { formatOccupancyStatuses } from './utils/occupancyUtils';

// Helper function to format activity type
const formatActivityType = (activity: string): string => {
  if (activity === 'owned_all_year') {
    return 'Owned all year';
  }
  if (activity === 'purchased') {
    return 'Purchased in 2024';
  }
  if (activity === 'sold') {
    return 'Sold in 2024';
  }
  if (activity === 'both') {
    return 'Purchased & Sold in 2024';
  }
  return activity.replace(/_/g, ' ');
};

interface PropertyListProps {
  properties: Property[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, onEdit, onDelete }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {properties.map((property, index) => (
        <Card key={property.id} className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>
                {property.label ? property.label : `Property ${index + 1}`}
              </span>
            </CardTitle>
            <CardDescription>
              {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()} • 
              {formatActivityType(property.activity2024)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              <strong>Address:</strong> {property.address.street}, {property.address.comune}, {property.address.province}, {property.address.zip}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Rental Status:</strong> {
                Array.isArray(property.occupancyStatuses) 
                  ? formatOccupancyStatuses(property.occupancyStatuses)
                  : 'Not specified'
              }
            </p>
            {property.occupancyStatuses.some(allocation => 
              allocation.status === 'LONG_TERM_RENT' || allocation.status === 'SHORT_TERM_RENT'
            ) && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>💸 2024 Rental Income:</strong> €{property.rentalIncome?.toLocaleString() || '0'}
              </p>
            )}
            
            {/* Document indicator */}
            <div className="text-sm text-gray-600 mt-2 flex items-center">
              <strong>Documents:</strong>
              {property.useDocumentRetrievalService ? (
                <span className="flex items-center ml-1 text-form-400">
                  <UploadCloud className="h-4 w-4 mr-1" />
                  Retrieval service
                </span>
              ) : property.documents && property.documents.length > 0 ? (
                <span className="flex items-center ml-1 text-form-400">
                  <FileText className="h-4 w-4 mr-1" />
                  {property.documents.length} file(s)
                </span>
              ) : (
                <span className="ml-1 text-gray-400">None</span>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(index)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button 
              onClick={() => onEdit(index)} 
              size="sm"
            >
              Edit
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PropertyList;
