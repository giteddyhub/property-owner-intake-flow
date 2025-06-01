
import React from 'react';
import { AddButton } from '@/components/dashboard/tables/ActionButtons';

interface AssignmentsTableHeaderProps {
  onAddAssignment: () => void;
  assignmentsCount: number;
}

export const AssignmentsTableHeader: React.FC<AssignmentsTableHeaderProps> = ({
  onAddAssignment,
  assignmentsCount
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-medium">Assignments</h3>
        <p className="text-sm text-gray-500">
          {assignmentsCount} assignment{assignmentsCount !== 1 ? 's' : ''}
        </p>
      </div>
      <AddButton onClick={onAddAssignment} label="Add Assignment" />
    </div>
  );
};
