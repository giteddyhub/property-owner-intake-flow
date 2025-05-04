
import React from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
import { AddButton } from '@/components/dashboard/tables/ActionButtons';
import { DetailsPopover } from '@/components/dashboard/details/DetailsPopover';
import { AssignmentDetails } from '@/components/dashboard/details/AssignmentDetails';
import AssignmentDrawer from '@/components/dashboard/drawers/AssignmentDrawer';
import { DeleteAssignmentDialog } from './assignment/DeleteAssignmentDialog';
import { AssignmentsTableContent } from './assignment/AssignmentsTableContent';
import { useAssignmentsTable } from '@/hooks/useAssignmentsTable';

interface AssignmentsTableProps {
  assignments: OwnerPropertyAssignment[];
  owners: Owner[];
  properties: Property[];
  onRefresh?: () => void;
  userId: string;
}

export const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ 
  assignments, 
  owners, 
  properties,
  onRefresh,
  userId
}) => {
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedAssignment,
    setSelectedAssignment,
    drawerOpen,
    setDrawerOpen,
    isCreating,
    detailsOpen,
    setDetailsOpen,
    isActionClick,
    setIsActionClick,
    handleEdit,
    handleDelete,
    handleAdd,
    handleAssignmentSaved,
    handleRowClick
  } = useAssignmentsTable({ assignments, onRefresh });
  
  const getOwnerById = (id: string): Owner | undefined => {
    return owners.find(owner => owner.id === id);
  };
  
  const getPropertyById = (id: string): Property | undefined => {
    return properties.find(property => property.id === id);
  };

  return (
    <>
      <div className="flex justify-start mb-4">
        <AddButton onClick={handleAdd} label="Add Assignment" />
      </div>

      <AssignmentsTableContent
        assignments={assignments}
        owners={owners}
        properties={properties}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={setSelectedAssignment}
        onActionClick={() => setIsActionClick(true)}
      />
      
      {selectedAssignment && (
        <DetailsPopover
          trigger={<div />}
          open={detailsOpen}
          onOpenChange={(open) => {
            // Only update state if we're closing it or opening it properly
            if (!open || selectedAssignment) {
              setDetailsOpen(open);
            }
          }}
        >
          <AssignmentDetails 
            assignment={selectedAssignment} 
            owner={getOwnerById(selectedAssignment.ownerId)} 
            property={getPropertyById(selectedAssignment.propertyId)} 
          />
        </DetailsPopover>
      )}
      
      <DeleteAssignmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
      
      <AssignmentDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        assignment={isCreating ? undefined : selectedAssignment || undefined}
        properties={properties}
        owners={owners}
        onSuccess={handleAssignmentSaved}
        userId={userId}
      />
    </>
  );
};
