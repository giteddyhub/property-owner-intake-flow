
import React from 'react';
import { Property } from '@/components/dashboard/types';
import { formatOccupancyStatuses } from '@/components/form/property/utils/occupancyUtils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from '@/components/ui/hover-card';
import { Euro, FileText } from 'lucide-react';

// Helper function to format activity type
const formatActivityType = (activity: string): string => {
  if (activity === 'owned_all_year') {
    return 'Owned all year';
  }
  // Format other activity types by capitalizing first letter
  return activity.charAt(0).toUpperCase() + activity.slice(1).replace('_', ' ');
};

interface PropertyDetailsProps {
  property: Property;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-medium">{property.label}</h3>
        <span className="text-sm text-muted-foreground">
          {property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-sm font-medium">Address</p>
          <p className="text-sm">
            {property.address.street}<br />
            {property.address.comune}, {property.address.province}<br />
            {property.address.zip}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Activity (2024)</p>
          <p className="text-sm">{formatActivityType(property.activity2024)}</p>
        </div>
      </div>

      {(property.purchaseDate || property.purchasePrice) && (
        <div className="border-t pt-2">
          <p className="text-sm font-medium">Purchase Information</p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {property.purchaseDate && (
              <p className="text-sm">
                Date: {format(property.purchaseDate, 'MMM d, yyyy')}
              </p>
            )}
            {property.purchasePrice && (
              <p className="text-sm">
                Price: €{property.purchasePrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {(property.saleDate || property.salePrice) && (
        <div className="border-t pt-2">
          <p className="text-sm font-medium">Sale Information</p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {property.saleDate && (
              <p className="text-sm">
                Date: {format(property.saleDate, 'MMM d, yyyy')}
              </p>
            )}
            {property.salePrice && (
              <p className="text-sm">
                Price: €{property.salePrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="border-t pt-2">
        <p className="text-sm font-medium">Status</p>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant={property.remodeling ? "default" : "outline"}>
            {property.remodeling ? "Being Remodeled" : "No Remodeling"}
          </Badge>
          
          {property.rentalIncome && (
            <Badge variant="secondary">
              Rental Income: €{property.rentalIncome.toLocaleString()}
            </Badge>
          )}
          
          {property.useDocumentRetrievalService && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              <Euro className="h-3 w-3 mr-1" /> Document Retrieval
            </Badge>
          )}
        </div>
      </div>

      <div className="border-t pt-2">
        <p className="text-sm font-medium">Occupancy</p>
        <HoverCard>
          <HoverCardTrigger asChild>
            <p className="text-sm mt-1 cursor-help underline decoration-dotted">
              {formatOccupancyStatuses(property.occupancyStatuses)}
            </p>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-4">
            <h4 className="font-medium mb-2">Detailed Occupancy</h4>
            <ul className="space-y-2">
              {property.occupancyStatuses.map((status, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>
                    {status.status 
                      ? status.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                      : 'Unknown'}
                  </span>
                  <Badge variant="outline">{status.months} months</Badge>
                </li>
              ))}
            </ul>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="border-t pt-2">
        <p className="text-sm font-medium">Documents</p>
        <div className="mt-1">
          {property.useDocumentRetrievalService ? (
            <div className="flex items-center text-sm text-blue-600">
              <Euro className="h-4 w-4 mr-2" />
              <span>Document retrieval service enabled</span>
            </div>
          ) : property.documents && property.documents.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {property.documents.slice(0, 3).map((doc, index) => (
                <li key={index} className="text-sm truncate flex items-center">
                  <FileText className="h-3 w-3 mr-1 text-gray-500" /> {doc.name}
                </li>
              ))}
              {property.documents.length > 3 && (
                <li className="text-sm text-muted-foreground">
                  + {property.documents.length - 3} more
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No documents provided</p>
          )}
        </div>
      </div>
    </div>
  );
};
