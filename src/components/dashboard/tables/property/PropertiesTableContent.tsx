
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Property } from '@/components/dashboard/types';
import { PropertyTableRow } from './PropertyTableRow';
import { EmptyProperties } from './EmptyProperties';

interface PropertiesTableContentProps {
  properties: Property[];
  onRowClick: (e: React.MouseEvent, property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
  onActionClick: () => void;
  onAddProperty: () => void;
}

export const PropertiesTableContent: React.FC<PropertiesTableContentProps> = ({
  properties,
  onRowClick,
  onEdit,
  onDelete,
  onActionClick,
  onAddProperty
}) => {
  if (properties.length === 0) {
    return <EmptyProperties onAddProperty={onAddProperty} />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property Label</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Activity 2024</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <PropertyTableRow
              key={property.id}
              property={property}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onRowClick}
              onActionClick={onActionClick}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
