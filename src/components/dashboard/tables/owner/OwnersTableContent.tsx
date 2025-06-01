
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Owner } from '@/components/dashboard/types';
import { OwnerTableRow } from './OwnerTableRow';
import { EmptyOwners } from './EmptyOwners';

interface OwnersTableContentProps {
  owners: Owner[];
  onRowClick: (e: React.MouseEvent, owner: Owner) => void;
  onEdit: (owner: Owner) => void;
  onDelete: (owner: Owner) => void;
  onActionClick: () => void;
  onAddOwner: () => void;
}

export const OwnersTableContent: React.FC<OwnersTableContentProps> = ({
  owners,
  onRowClick,
  onEdit,
  onDelete,
  onActionClick,
  onAddOwner
}) => {
  if (owners.length === 0) {
    return <EmptyOwners onAddOwner={onAddOwner} />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Tax Code</TableHead>
            <TableHead>Citizenship</TableHead>
            <TableHead>IT Resident</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {owners.map((owner) => (
            <OwnerTableRow
              key={owner.id}
              owner={owner}
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
