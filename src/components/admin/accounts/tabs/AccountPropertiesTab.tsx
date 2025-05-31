
import React from 'react';
import { Home } from 'lucide-react';
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PropertyData } from '@/types/admin';
import { PropertyTableRow } from './components/PropertyTableRow';
import { PropertyDetailsRow } from './components/PropertyDetailsRow';
import { usePropertyExpansion } from './hooks/usePropertyExpansion';
import { useDocumentDownload } from './hooks/useDocumentDownload';

interface AccountPropertiesTabProps {
  properties: PropertyData[];
}

export const AccountPropertiesTab: React.FC<AccountPropertiesTabProps> = ({ properties }) => {
  const { expandedProperty, togglePropertyExpansion } = usePropertyExpansion();
  const { handleDownloadDocument } = useDocumentDownload();

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
                  <PropertyTableRow
                    property={property}
                    isExpanded={expandedProperty === property.id}
                    onToggleExpansion={togglePropertyExpansion}
                  />
                  {expandedProperty === property.id && (
                    <PropertyDetailsRow
                      property={property}
                      onDownloadDocument={handleDownloadDocument}
                    />
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
