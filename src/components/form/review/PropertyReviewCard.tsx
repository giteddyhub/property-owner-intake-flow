
import React from 'react';
import { format } from 'date-fns';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ActivityType, OccupancyStatus, OccupancyAllocation, Property } from '@/types/form';
import { formatOccupancyStatuses, formatOccupancyStatus } from '../property/utils/occupancyUtils';
import { FileText, UploadCloud } from 'lucide-react';

interface PropertyReviewCardProps {
  property: Property;
  onEditClick: () => void;
}

export const formatActivity = (activity: ActivityType) => {
  switch (activity) {
    case 'purchased':
      return 'Purchased in 2024';
    case 'sold':
      return 'Sold in 2024';
    case 'both':
      return 'Purchased & Sold in 2024';
    case 'owned_all_year':
      return 'Owned all year';
    default:
      return activity;
  }
};

export const hasRentalStatus = (property: Property) => {
  return property.occupancyStatuses.some(
    allocation => allocation.status === 'LONG_TERM_RENT' || allocation.status === 'SHORT_TERM_RENT'
  );
};

const PropertyReviewCard: React.FC<PropertyReviewCardProps> = ({ property, onEditClick }) => {
  return (
    <AccordionItem 
      key={property.id} 
      value={property.id}
      className="border rounded-lg overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100">
        <div className="flex items-start w-full text-left">
          <div>
            <h3 className="font-medium">
              {property.label || `Property in ${property.address.comune}`}
            </h3>
            <p className="text-sm text-gray-500">
              {property.address.street}, {property.address.comune}, {property.address.province}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 py-3 bg-white">
        <div className="text-sm">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <p className="font-medium">Property Type</p>
              <p>{property.propertyType.charAt(0) + property.propertyType.slice(1).toLowerCase()}</p>
            </div>
            <div>
              <p className="font-medium">Activity in 2024</p>
              <p>{formatActivity(property.activity2024)}</p>
            </div>
          </div>
          
          {(property.activity2024 === 'purchased' || property.activity2024 === 'both') && (
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="font-medium">Purchase Date</p>
                <p>{property.purchaseDate ? format(new Date(property.purchaseDate), 'PPP') : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Purchase Price</p>
                <p>€{property.purchasePrice ? property.purchasePrice.toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          )}
          
          {(property.activity2024 === 'sold' || property.activity2024 === 'both') && (
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <p className="font-medium">Sale Date</p>
                <p>{property.saleDate ? format(new Date(property.saleDate), 'PPP') : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Sale Price</p>
                <p>€{property.salePrice ? property.salePrice.toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <p className="font-medium">Rental Status</p>
              <p>{
                Array.isArray(property.occupancyStatuses) 
                  ? formatOccupancyStatuses(property.occupancyStatuses) 
                  : 'Not specified'
              }</p>
            </div>
            <div>
              <p className="font-medium">Remodeling in 2024</p>
              <p>{property.remodeling ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {hasRentalStatus(property) && property.rentalIncome !== undefined && (
            <div className="border-t pt-2 mt-2">
              <p className="font-medium">Rental Income for 2024</p>
              <p className="text-lg font-semibold text-form-400">
                €{property.rentalIncome.toLocaleString()}
              </p>
            </div>
          )}
          
          {/* Documents Section */}
          <div className="border-t pt-2 mt-2">
            <p className="font-medium">Property Documents</p>
            {property.useDocumentRetrievalService ? (
              <div className="flex items-center mt-1">
                <UploadCloud className="h-4 w-4 mr-2 text-form-300" />
                <span>Document retrieval service ($28 USD)</span>
              </div>
            ) : property.documents && property.documents.length > 0 ? (
              <div className="mt-1">
                {property.documents.map(doc => (
                  <div key={doc.id} className="flex items-center mb-1">
                    <FileText className="h-4 w-4 mr-2 text-form-300" />
                    <span>{doc.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No documents uploaded</p>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PropertyReviewCard;
