
import { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Owner } from '@/types/form';
import { createEmptyOwner } from '../utils';
import { useOwnerFieldHandlers } from './useOwnerFieldHandlers';
import { useOwnerSpecialFields } from './useOwnerSpecialFields';

export const useOwnerForm = () => {
  const { state, addOwner, updateOwner, removeOwner } = useFormContext();
  const { owners } = state;
  
  const [currentOwner, setCurrentOwner] = useState<Owner>(createEmptyOwner());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(owners.length === 0);

  // Field handling hooks
  const {
    handleInputChange,
    handleOwnerChange,
    handleSelectChange,
    handleStateChange
  } = useOwnerFieldHandlers(setCurrentOwner);

  // Special fields handling hooks
  const {
    handleDateChange,
    handleResidencyStatusChange,
    handleResidencyDetailChange,
    handleCountryChange
  } = useOwnerSpecialFields(setCurrentOwner);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    owners,
    currentOwner,
    editingIndex,
    showForm,
    setShowForm,
    setCurrentOwner,
    setEditingIndex,
    handleInputChange,
    handleOwnerChange,
    handleSelectChange,
    handleStateChange,
    handleDateChange,
    handleResidencyStatusChange,
    handleResidencyDetailChange,
    handleCountryChange,
    scrollToTop,
    addOwner,
    updateOwner,
    removeOwner
  };
};
