
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

export const EmptyAssignments: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
        No assignments found.
      </TableCell>
    </TableRow>
  );
};
