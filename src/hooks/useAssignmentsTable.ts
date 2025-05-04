
import { useState } from 'react';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAssignmentsTable = (props: {
  assignments: OwnerPropertyAssignment[];
  onRefresh?: () => void;
}) => {
  const { assignments, onRefresh } = props;
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<OwnerPropertyAssignment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isActionClick, setIsActionClick] = useState(false);
  
  const handleEdit = (assignment: OwnerPropertyAssignment) => {
    setSelectedAssignment(assignment);
    setIsCreating(false);
    setDrawerOpen(true);
    // Ensure details popup doesn't show
    setDetailsOpen(false);
  };
  
  const handleDelete = async () => {
    if (!selectedAssignment || !selectedAssignment.id) return;
    
    try {
      const { error } = await supabase
        .from('owner_property_assignments')
        .delete()
        .eq('id', selectedAssignment.id);
      
      if (error) throw error;
      
      toast.success('Assignment deleted successfully');
      setDeleteDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };
  
  const handleAdd = () => {
    setSelectedAssignment(null);
    setIsCreating(true);
    setDrawerOpen(true);
  };
  
  const handleAssignmentSaved = () => {
    if (onRefresh) onRefresh();
  };
  
  const handleRowClick = (e: React.MouseEvent, assignment: OwnerPropertyAssignment) => {
    // Prevent row click if action buttons were clicked
    if (isActionClick) {
      setIsActionClick(false);
      return;
    }
    
    // Don't navigate or trigger form submission on row clicks
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedAssignment(assignment);
    setDetailsOpen(true);
  };

  return {
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
  };
};
