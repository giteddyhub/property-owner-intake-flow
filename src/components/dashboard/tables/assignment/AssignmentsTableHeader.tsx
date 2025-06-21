
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
        <h3 className="text-lg font-medium">Ownership Links</h3>
        <p className="text-sm text-gray-500">
          {assignmentsCount} ownership link{assignmentsCount !== 1 ? 's' : ''}
        </p>
      </div>
      <AddButton onClick={onAddAssignment} label="Add Ownership Link" />
    </div>
  );
};
