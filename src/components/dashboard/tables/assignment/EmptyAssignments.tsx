
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { FileX } from 'lucide-react';

export const EmptyAssignments: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <FileX className="h-10 w-10 mb-2 opacity-40" />
          <span className="text-sm">No assignments found.</span>
          <span className="text-xs">Try creating a new assignment or changing your filters.</span>
        </div>
      </TableCell>
    </TableRow>
  );
};
