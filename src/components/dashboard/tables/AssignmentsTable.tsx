
import React, { useState } from 'react';
import { OwnerPropertyAssignment, Owner, Property } from '@/components/dashboard/types';
import { AssignmentsTableContent } from './assignment/AssignmentsTableContent';
import AssignmentDrawer from '@/components/dashboard/drawers/AssignmentDrawer';

interface AssignmentsTableProps {
  assignments: OwnerPropertyAssignment[];
  owners: Owner[];
  properties: Property[];
  onRefresh: () => void;
  userId: string;
  onShowUserOverview?: (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => void;
}

export const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ 
  assignments, 
  owners, 
  properties,
  onRefresh,
  userId,
  onShowUserOverview 
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<OwnerPropertyAssignment | undefined>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (e: React.MouseEvent, assignment: OwnerPropertyAssignment) => {
    console.log('Assignment row clicked:', assignment);
    setSelectedAssignment(assignment);
    setIsDrawerOpen(true);
  };

  const handleEdit = (assignment: OwnerPropertyAssignment) => {
    console.log('Edit assignment:', assignment);
    setSelectedAssignment(assignment);
    setIsDrawerOpen(true);
  };

  const handleDelete = (assignment: OwnerPropertyAssignment) => {
    console.log('Delete assignment:', assignment);
    // TODO: Implement delete confirmation dialog
  };

  const handleActionClick = () => {
    console.log('Action button clicked');
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedAssignment(undefined);
  };

  const handleSuccess = () => {
    onRefresh();
    handleDrawerClose();
  };

  return (
    <>
      <AssignmentsTableContent
        assignments={assignments}
        owners={owners}
        properties={properties}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onActionClick={handleActionClick}
      />
      
      <AssignmentDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        assignment={selectedAssignment}
        properties={properties}
        owners={owners}
        onSuccess={handleSuccess}
        userId={userId}
      />
    </>
  );
};
