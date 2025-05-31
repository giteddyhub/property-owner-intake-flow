
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { PropertyData } from '@/types/admin';
import { formatActivityType } from '@/components/form/property/utils/activityUtils';

interface PropertyTableRowProps {
  property: PropertyData;
  isExpanded: boolean;
  onToggleExpansion: (propertyId: string) => void;
}

export const PropertyTableRow: React.FC<PropertyTableRowProps> = ({
  property,
  isExpanded,
  onToggleExpansion
}) => {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onToggleExpansion(property.id)}
    >
      <TableCell>
        {isExpanded ? (
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
        <Badge variant="secondary">{formatActivityType(property.activity_2024)}</Badge>
      </TableCell>
      <TableCell>{format(new Date(property.created_at), 'MMM dd, yyyy')}</TableCell>
    </TableRow>
  );
};
