
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/components/dashboard/types';
import { ActionButtons } from '@/components/dashboard/tables/ActionButtons';
import { formatActivityType } from '@/components/form/property/utils/activityUtils';

interface PropertyTableRowProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
  onClick: (e: React.MouseEvent, property: Property) => void;
  onActionClick: () => void;
}

export const PropertyTableRow: React.FC<PropertyTableRowProps> = ({
  property,
  onEdit,
  onDelete,
  onClick,
  onActionClick
}) => {
  return (
    <TableRow 
      className="cursor-pointer"
      onClick={(e) => onClick(e, property)}
    >
      <TableCell className="font-medium">
        {property.label}
      </TableCell>
      <TableCell>
        {property.address ? `${property.address.comune || ''}, ${property.address.province || ''}` : '-'}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{property.propertyType}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{formatActivityType(property.activity2024)}</Badge>
      </TableCell>
      <TableCell>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onActionClick();
          }}
        >
          <ActionButtons
            onEdit={() => onEdit(property)}
            onDelete={() => onDelete(property)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
