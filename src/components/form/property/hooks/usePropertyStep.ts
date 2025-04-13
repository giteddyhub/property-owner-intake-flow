
import { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Property, OccupancyStatus } from '@/types/form';
import { toast } from 'sonner';
import { createEmptyProperty, initializeOccupancyData, normalizeActivityType } from '../utils';

export const usePropertyStep = () => {
  const { state, addProperty, updateProperty, removeProperty } = useFormContext();
  const { properties } = state;
  
  const [currentProperty, setCurrentProperty] = useState<Property>(createEmptyProperty());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(properties.length === 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddProperty = () => {
    setCurrentProperty(createEmptyProperty());
    setEditingIndex(null);
    setShowForm(true);
    scrollToTop();
  };

  const handleEdit = (index: number) => {
    const property = { ...properties[index] };
    
    // Use normalizeActivityType to ensure we have a valid ActivityType
    property.activity2024 = normalizeActivityType(property.activity2024);
    
    const { initialOccupancyMonths, newActiveStatuses } = initializeOccupancyData(property);
    
    setCurrentProperty(property);
    setEditingIndex(index);
    setShowForm(true);
    scrollToTop();
  };

  const handleDelete = (index: number) => {
    removeProperty(index);
    toast.success('Property removed successfully');
  };

  const handleCancel = () => {
    setCurrentProperty(createEmptyProperty());
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleSubmit = (finalProperty: Property, occupancyMonths: Record<OccupancyStatus, number>) => {
    if (editingIndex !== null) {
      updateProperty(editingIndex, finalProperty);
      toast.success('Property updated successfully');
    } else {
      addProperty(finalProperty);
      toast.success('Property added successfully');
    }
    
    setCurrentProperty(createEmptyProperty());
    setEditingIndex(null);
    setShowForm(false);
  };

  const validateAndProceed = () => {
    if (properties.length === 0) {
      toast.error('Please add at least one property before proceeding');
      return false;
    }
    return true;
  };

  return {
    currentProperty,
    editingIndex,
    showForm,
    handleEdit,
    handleDelete,
    handleCancel,
    handleSubmit,
    handleAddProperty,
    validateAndProceed
  };
};
