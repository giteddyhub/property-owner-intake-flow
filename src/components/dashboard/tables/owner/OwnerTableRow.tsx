
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Owner } from '@/components/dashboard/types';
import { ActionButtons } from '@/components/dashboard/tables/ActionButtons';

interface OwnerTableRowProps {
  owner: Owner;
  onEdit: (owner: Owner) => void;
  onDelete: (owner: Owner) => void;
  onClick: (e: React.MouseEvent, owner: Owner) => void;
  onActionClick: () => void;
}

export const OwnerTableRow: React.FC<OwnerTableRowProps> = ({
  owner,
  onEdit,
  onDelete,
  onClick,
  onActionClick
}) => {
  return (
    <TableRow 
      className="cursor-pointer"
      onClick={(e) => onClick(e, owner)}
    >
      <TableCell className="font-medium">
        {owner.firstName}
      </TableCell>
      <TableCell className="font-medium">
        {owner.lastName}
      </TableCell>
      <TableCell>
        {owner.italianTaxCode}
      </TableCell>
      <TableCell>
        {owner.citizenship}
      </TableCell>
      <TableCell>
        <Badge variant={owner.isResidentInItaly ? "default" : "secondary"}>
          {owner.isResidentInItaly ? 'Yes' : 'No'}
        </Badge>
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
            onEdit={() => onEdit(owner)}
            onDelete={() => onDelete(owner)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
