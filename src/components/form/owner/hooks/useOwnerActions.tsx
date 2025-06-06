
import { useState } from 'react';
import { Owner } from '@/types/form';
import { createEmptyOwner } from '../utils';
import { validateOwner, validateHasOwners } from '../validation/ownerValidation';
import { toast } from 'sonner';

export const useOwnerActions = (
  owners: Owner[],
  currentOwner: Owner,
  editingIndex: number | null,
  setCurrentOwner: (owner: Owner) => void,
  setEditingIndex: (index: number | null) => void,
  setShowForm: (show: boolean) => void,
  addOwner: (owner: Owner) => void,
  updateOwner: (index: number, owner: Owner) => void,
  removeOwner: (index: number) => void,
  scrollToTop: () => void
) => {
  // State to track if we should show the residency dialog
  const [showResidencyDialog, setShowResidencyDialog] = useState(false);
  
  const handleSubmit = () => {
    // Check if the owner is an Italian resident first
    if (currentOwner.isResidentInItaly === true) {
      setShowResidencyDialog(true);
      return;
    }
    
    if (!validateOwner(currentOwner)) {
      return;
    }

    if (editingIndex !== null) {
      updateOwner(editingIndex, currentOwner);
      toast.success('Owner updated successfully');
    } else {
      addOwner(currentOwner);
      toast.success('Owner added successfully');
    }
    
    setCurrentOwner(createEmptyOwner());
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEdit = (index: number) => {
    setCurrentOwner({ ...owners[index] });
    setEditingIndex(index);
    setShowForm(true);
    scrollToTop();
  };

  const handleDelete = (index: number) => {
    removeOwner(index);
    toast.success('Owner removed successfully');
  };

  const validateAndProceed = () => {
    // Check if any owner is an Italian resident
    const hasItalianResident = owners.some(owner => owner.isResidentInItaly === true);
    
    if (hasItalianResident) {
      setShowResidencyDialog(true);
      return false;
    }
    
    return validateHasOwners(owners);
  };

  const handleAddOwner = () => {
    setCurrentOwner(createEmptyOwner());
    setEditingIndex(null);
    setShowForm(true);
    scrollToTop();
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentOwner(createEmptyOwner());
    setEditingIndex(null);
  };

  return {
    handleSubmit,
    handleEdit,
    handleDelete,
    validateAndProceed,
    handleAddOwner,
    handleCancel,
    showResidencyDialog,
    setShowResidencyDialog
  };
};
