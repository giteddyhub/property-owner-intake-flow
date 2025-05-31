
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { PropertyData } from '@/types/admin';
import { formatPropertyOccupancy } from '../utils/occupancyFormatter';

interface PropertyDetailsRowProps {
  property: PropertyData;
  onDownloadDocument: (documentUrl: string, documentName: string) => void;
}

export const PropertyDetailsRow: React.FC<PropertyDetailsRowProps> = ({
  property,
  onDownloadDocument
}) => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="bg-muted/20">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Full Address:</span>
              <p>{property.address_street}, {property.address_comune}, {property.address_province} {property.address_zip}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Property Type:</span>
              <p>{property.property_type}</p>
            </div>
            {property.purchase_price && (
              <div>
                <span className="font-medium text-muted-foreground">Purchase Price:</span>
                <p>€{property.purchase_price.toLocaleString()}</p>
              </div>
            )}
            {property.purchase_date && (
              <div>
                <span className="font-medium text-muted-foreground">Purchase Date:</span>
                <p>{format(new Date(property.purchase_date), 'MMM dd, yyyy')}</p>
              </div>
            )}
            {property.sale_price && (
              <div>
                <span className="font-medium text-muted-foreground">Sale Price:</span>
                <p>€{property.sale_price.toLocaleString()}</p>
              </div>
            )}
            {property.sale_date && (
              <div>
                <span className="font-medium text-muted-foreground">Sale Date:</span>
                <p>{format(new Date(property.sale_date), 'MMM dd, yyyy')}</p>
              </div>
            )}
            {property.rental_income && (
              <div>
                <span className="font-medium text-muted-foreground">Rental Income:</span>
                <p>€{property.rental_income.toLocaleString()}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-muted-foreground">Remodeling:</span>
              <p>{property.remodeling ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          {/* Documents Section */}
          {property.documents && property.documents.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-2">Documents ({property.documents.length})</h4>
              <div className="flex flex-wrap gap-2">
                {property.documents.map((doc, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadDocument(doc, `${property.label}_document_${index + 1}`);
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Document {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {property.use_document_retrieval_service && (
            <div className="border-t pt-4">
              <Badge variant="secondary">
                Document Retrieval Service Enabled
              </Badge>
            </div>
          )}

          {/* Occupancy Status */}
          {property.occupancy_statuses && property.occupancy_statuses.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-2">Occupancy Status</h4>
              <p className="text-sm">{formatPropertyOccupancy(property.occupancy_statuses)}</p>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
