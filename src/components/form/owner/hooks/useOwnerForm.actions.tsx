
import React from 'react';
import { Owner } from '@/types/form';

interface UseOwnerFormActionsProps {
  owner: Owner;
  editingIndex: number | null;
  onSubmit: () => void;
  onCancel: () => void;
  hideCancel?: boolean;
}

export const useOwnerFormActions = ({
  owner,
  editingIndex,
  onSubmit,
  onCancel,
  hideCancel = false
}: UseOwnerFormActionsProps) => {
  const handleSubmit = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onSubmit();
  };

  const isEditing = editingIndex !== null;
  const submitButtonText = isEditing ? 'Update Owner' : 'Add Owner';
  const formTitle = isEditing ? 'Edit Owner' : 'Add New Owner';
  
  return {
    handleSubmit,
    onCancel,
    hideCancel,
    isEditing,
    submitButtonText,
    formTitle
  };
};
