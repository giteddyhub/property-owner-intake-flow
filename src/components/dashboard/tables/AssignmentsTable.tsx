
import React, { useState } from 'react';
import { OwnerPropertyAssignment, Owner, Property } from '@/components/dashboard/types';
import { AssignmentsTableContent } from './assignment/AssignmentsTableContent';
import { AssignmentsTableHeader } from './assignment/AssignmentsTableHeader';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DeleteAssignmentDialog } from './assignment/DeleteAssignmentDialog';

interface AssignmentsTableProps {
  assignments: OwnerPropertyAssignment[];
  owners: Owner[];
  properties: Property[];
  onRefresh: () => void;
  userId: string;
  onShowUserOverview?: (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => void;
  onOpenDrawer: (assignment?: OwnerPropertyAssignment) => void;
}

export const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ 
  assignments, 
  owners, 
  properties,
  onRefresh,
  userId,
  onShowUserOverview,
  onOpenDrawer
}) => {
  const { deleteAssignment } = useDashboardData();
  const [assignmentToDelete, setAssignmentToDelete] = useState<OwnerPropertyAssignment | null>(null);

  const handleRowClick = (e: React.MouseEvent, assignment: OwnerPropertyAssignment) => {
    console.log('Assignment row clicked:', assignment);
    onOpenDrawer(assignment);
  };

  const handleEdit = (assignment: OwnerPropertyAssignment) => {
    console.log('Edit assignment:', assignment);
    onOpenDrawer(assignment);
  };

  const handleDelete = (assignment: OwnerPropertyAssignment) => {
    console.log('Delete assignment:', assignment);
    setAssignmentToDelete(assignment);
  };

  const handleAddAssignment = () => {
    console.log('Add new assignment');
    onOpenDrawer();
  };

  const confirmDelete = async () => {
    if (assignmentToDelete && 'id' in assignmentToDelete && assignmentToDelete.id) {
      try {
        console.log('Deleting assignment with ID:', assignmentToDelete.id);
        const success = await deleteAssignment(assignmentToDelete.id);
        if (success) {
          console.log('Assignment deleted successfully, refreshing data');
          onRefresh();
        }
      } catch (error) {
        console.error('Error in confirmDelete:', error);
      } finally {
        setAssignmentToDelete(null);
      }
    }
  };

  const handleActionClick = () => {
    console.log('Action button clicked');
  };

  return (
    <div>
      <AssignmentsTableHeader 
        onAddAssignment={handleAddAssignment}
        assignmentsCount={assignments.length}
      />
      
      <AssignmentsTableContent
        assignments={assignments}
        owners={owners}
        properties={properties}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onActionClick={handleActionClick}
        onAddAssignment={handleAddAssignment}
      />

      <DeleteAssignmentDialog
        open={!!assignmentToDelete}
        onOpenChange={() => setAssignmentToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
