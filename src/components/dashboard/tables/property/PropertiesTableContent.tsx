
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

interface PropertiesTableContentProps {
  properties: Property[];
  onRowClick: (e: React.MouseEvent, property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
  onActionClick: () => void;
}

export const PropertiesTableContent: React.FC<PropertiesTableContentProps> = ({
  properties,
  onRowClick,
  onEdit,
  onDelete,
  onActionClick
}) => {
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
          {properties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No properties found
              </TableCell>
            </TableRow>
          ) : (
            properties.map((property) => (
              <PropertyTableRow
                key={property.id}
                property={property}
                onEdit={onEdit}
                onDelete={onDelete}
                onClick={onRowClick}
                onActionClick={onActionClick}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
