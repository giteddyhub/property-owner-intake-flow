
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { FileX, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyAssignmentsProps {
  onAddAssignment: () => void;
}

export const EmptyAssignments: React.FC<EmptyAssignmentsProps> = ({ onAddAssignment }) => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <FileX className="h-10 w-10 mb-2 opacity-40" />
          <span className="text-sm mb-2">No ownership links found.</span>
          <span className="text-xs mb-4">Create your first ownership link to get started.</span>
          <Button onClick={onAddAssignment} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Ownership Link
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
