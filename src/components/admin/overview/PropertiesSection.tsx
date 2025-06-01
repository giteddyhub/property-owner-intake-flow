
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { PropertyData } from '@/types/admin';
import { formatActivityType } from '@/components/form/property/utils/activityUtils';
import { formatPropertyOccupancy } from '@/components/admin/accounts/tabs/utils/occupancyFormatter';

interface PropertiesSectionProps {
  properties: PropertyData[];
}

export const PropertiesSection: React.FC<PropertiesSectionProps> = ({ properties }) => {
  const handleDownloadDocument = (documentUrl: string, documentName: string) => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">Properties ({properties.length})</h3>
      {properties.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {properties.map((property) => (
            <div key={property.id} className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-sm">{property.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {property.address_comune}, {property.address_province}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {property.property_type}
                </Badge>
              </div>
              
              {/* Activity 2024 */}
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-1">Activity 2024:</p>
                <Badge variant="secondary" className="text-xs">
                  {formatActivityType(property.activity_2024)}
                </Badge>
              </div>
              
              {/* Occupancy Status */}
              {property.occupancy_statuses && property.occupancy_statuses.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Occupancy:</p>
                  <p className="text-xs">{formatPropertyOccupancy(property.occupancy_statuses)}</p>
                </div>
              )}
              
              {/* Property Documents */}
              {property.documents && property.documents.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Documents:</p>
                  <div className="flex flex-wrap gap-1">
                    {property.documents.map((doc, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleDownloadDocument(doc, `${property.label}_doc_${index + 1}`)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Doc {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {property.use_document_retrieval_service && (
                <div className="mt-2 pt-2 border-t">
                  <Badge variant="secondary" className="text-xs">
                    Document Retrieval Service
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No properties found.</p>
      )}
    </div>
  );
};
