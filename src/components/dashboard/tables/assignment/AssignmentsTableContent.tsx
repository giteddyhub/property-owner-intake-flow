
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
import { EmptyAssignments } from './EmptyAssignments';
import { AssignmentTableRow } from './AssignmentTableRow';

interface AssignmentsTableContentProps {
  assignments: OwnerPropertyAssignment[];
  owners: Owner[];
  properties: Property[];
  onRowClick: (e: React.MouseEvent, assignment: OwnerPropertyAssignment) => void;
  onEdit: (assignment: OwnerPropertyAssignment) => void;
  onDelete: (assignment: OwnerPropertyAssignment) => void;
  onActionClick: () => void;
  onAddAssignment: () => void;
}

export const AssignmentsTableContent: React.FC<AssignmentsTableContentProps> = ({
  assignments,
  owners,
  properties,
  onRowClick,
  onEdit,
  onDelete,
  onActionClick,
  onAddAssignment
}) => {
  const getOwnerById = (id: string): Owner | undefined => {
    return owners.find(owner => owner.id === id);
  };
  
  const getPropertyById = (id: string): Property | undefined => {
    return properties.find(property => property.id === id);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Ownership %</TableHead>
            <TableHead>Residency</TableHead>
            <TableHead>Tax Credits</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.length === 0 ? (
            <EmptyAssignments onAddAssignment={onAddAssignment} />
          ) : (
            assignments.map((assignment) => (
              <AssignmentTableRow
                key={assignment.id || `${assignment.ownerId}-${assignment.propertyId}`}
                assignment={assignment}
                property={getPropertyById(assignment.propertyId)}
                owner={getOwnerById(assignment.ownerId)}
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
