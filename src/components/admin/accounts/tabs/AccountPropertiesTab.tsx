
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Download, Home } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PropertyData } from '@/types/admin';
import { formatOccupancyStatuses } from '@/components/form/property/utils/occupancyUtils';

interface AccountPropertiesTabProps {
  properties: PropertyData[];
}

export const AccountPropertiesTab: React.FC<AccountPropertiesTabProps> = ({ properties }) => {
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null);

  const togglePropertyExpansion = (propertyId: string) => {
    setExpandedProperty(expandedProperty === propertyId ? null : propertyId);
  };

  const handleDownloadDocument = (documentUrl: string, documentName: string) => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Improved helper function to parse and format occupancy statuses from database format
  const formatPropertyOccupancy = (occupancyStatuses: string[] | undefined) => {
    if (!occupancyStatuses || occupancyStatuses.length === 0) {
      return 'Not specified';
    }

    console.log('Raw occupancy statuses:', occupancyStatuses);
    console.log('Type of occupancyStatuses:', typeof occupancyStatuses);
    console.log('Is array:', Array.isArray(occupancyStatuses));

    try {
      // Handle different possible formats
      let parsedStatuses: any[] = [];

      if (Array.isArray(occupancyStatuses)) {
        parsedStatuses = occupancyStatuses.map((status, index) => {
          console.log(`Processing status ${index}:`, status, 'Type:', typeof status);
          
          if (typeof status === 'string') {
            try {
              // Try to parse as JSON first
              const parsed = JSON.parse(status);
              console.log('Parsed JSON:', parsed);
              return parsed;
            } catch {
              // If JSON parsing fails, treat as a simple string value
              console.log('Not JSON, treating as string:', status);
              return { status: status, months: 0 }; // Create a basic object structure
            }
          } else if (typeof status === 'object' && status !== null) {
            console.log('Already an object:', status);
            return status;
          }
          return null;
        }).filter(Boolean);
      }

      console.log('Final parsed statuses:', parsedStatuses);

      // If we have valid allocation objects with status and months, use the utility function
      if (parsedStatuses.length > 0) {
        const validAllocations = parsedStatuses.filter(allocation => 
          allocation && 
          typeof allocation === 'object' && 
          ('status' in allocation || 'PERSONAL_USE' in allocation || 'LONG_TERM_RENT' in allocation || 'SHORT_TERM_RENT' in allocation)
        );

        if (validAllocations.length > 0) {
          // Check if it's the old format with direct status properties
          if ('PERSONAL_USE' in validAllocations[0] || 'LONG_TERM_RENT' in validAllocations[0] || 'SHORT_TERM_RENT' in validAllocations[0]) {
            // Convert old format to new format
            const converted = [];
            const allocation = validAllocations[0];
            if (allocation.PERSONAL_USE > 0) converted.push({ status: 'PERSONAL_USE', months: allocation.PERSONAL_USE });
            if (allocation.LONG_TERM_RENT > 0) converted.push({ status: 'LONG_TERM_RENT', months: allocation.LONG_TERM_RENT });
            if (allocation.SHORT_TERM_RENT > 0) converted.push({ status: 'SHORT_TERM_RENT', months: allocation.SHORT_TERM_RENT });
            
            return formatOccupancyStatuses(converted);
          } else {
            // Use the new format directly
            return formatOccupancyStatuses(validAllocations);
          }
        }
      }

      // Fallback: try to display whatever we have
      return occupancyStatuses.map(status => {
        if (typeof status === 'string') {
          return status;
        }
        return JSON.stringify(status);
      }).join(', ');

    } catch (error) {
      console.error('Error parsing occupancy statuses:', error);
      console.error('Original data:', occupancyStatuses);
      return `Raw: ${JSON.stringify(occupancyStatuses)}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Properties
        </CardTitle>
        <CardDescription>
          {properties.length === 0 
            ? 'This user has no properties.' 
            : `${properties.length} properties found for this user.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {properties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No properties found for this user.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Activity 2024</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map(property => (
                <React.Fragment key={property.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => togglePropertyExpansion(property.id)}
                  >
                    <TableCell>
                      {expandedProperty === property.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{property.label}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{property.property_type}</Badge>
                    </TableCell>
                    <TableCell>{property.address_comune}, {property.address_province}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{property.activity_2024}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(property.created_at), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                  {expandedProperty === property.id && (
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
                                      handleDownloadDocument(doc, `${property.label}_document_${index + 1}`);
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
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
