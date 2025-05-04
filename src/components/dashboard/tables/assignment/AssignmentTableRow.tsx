
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
import { ActionButtons } from '@/components/dashboard/tables/ActionButtons';

interface AssignmentTableRowProps {
  assignment: OwnerPropertyAssignment;
  property?: Property;
  owner?: Owner;
  onEdit: (assignment: OwnerPropertyAssignment) => void;
  onDelete: (assignment: OwnerPropertyAssignment) => void;
  onClick: (e: React.MouseEvent, assignment: OwnerPropertyAssignment) => void;
  onActionClick: () => void;
}

export const AssignmentTableRow: React.FC<AssignmentTableRowProps> = ({
  assignment,
  property,
  owner,
  onEdit,
  onDelete,
  onClick,
  onActionClick
}) => {
  return (
    <TableRow 
      key={assignment.id || `${assignment.ownerId}-${assignment.propertyId}`}
      className="cursor-pointer"
      onClick={(e) => onClick(e, assignment)}
    >
      <TableCell>
        {property ? property.label : 'Unknown Property'}
      </TableCell>
      <TableCell>
        {owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown Owner'}
      </TableCell>
      <TableCell>{assignment.ownershipPercentage}%</TableCell>
      <TableCell>
        {assignment.residentAtProperty ? (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resident</Badge>
            {assignment.residentDateRange?.from && (
              <span className="text-xs text-gray-500">
                From: {format(new Date(assignment.residentDateRange.from), 'MMM d, yyyy')}
                {assignment.residentDateRange.to && 
                  ` to ${format(new Date(assignment.residentDateRange.to), 'MMM d, yyyy')}`
                }
              </span>
            )}
          </div>
        ) : (
          <Badge variant="outline" className="bg-gray-50">Non-Resident</Badge>
        )}
      </TableCell>
      <TableCell>
        {assignment.taxCredits !== undefined && assignment.taxCredits !== null
          ? `€${assignment.taxCredits.toLocaleString()}`
          : '-'}
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
            onEdit={() => onEdit(assignment)}
            onDelete={() => onDelete(assignment)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
