
import React from 'react';
import FormNavigation from '@/components/form/FormNavigation';
import OwnerList from '../owner/OwnerList';
import OwnerForm from '../owner/OwnerForm';
import EmptyOwnerPrompt from '../owner/EmptyOwnerPrompt';
import { useOwnerForm } from '../owner/hooks/useOwnerForm';
import { useOwnerActions } from '../owner/hooks/useOwnerActions';

const OwnerStep: React.FC = () => {
  const {
    owners,
    currentOwner,
    editingIndex,
    showForm,
    setShowForm,
    setCurrentOwner,
    setEditingIndex,
    handleInputChange,
    handleOwnerChange,
    handleDateChange,
    handleResidencyStatusChange,
    handleCountryChange,
    scrollToTop,
    addOwner,
    updateOwner,
    removeOwner
  } = useOwnerForm();
  
  const {
    handleSubmit,
    handleEdit,
    handleDelete,
    validateAndProceed,
    handleAddOwner,
    handleCancel
  } = useOwnerActions(
    owners,
    currentOwner,
    editingIndex,
    setCurrentOwner,
    setEditingIndex,
    setShowForm,
    addOwner,
    updateOwner,
    removeOwner,
    scrollToTop
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Owner Information</h2>
      
      {owners.length > 0 && !showForm && (
        <OwnerList 
          owners={owners} 
          onAddOwner={handleAddOwner} 
          onEditOwner={handleEdit} 
          onDeleteOwner={handleDelete} 
        />
      )}
      
      {showForm && (
        <OwnerForm 
          owner={currentOwner}
          editingIndex={editingIndex}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onOwnerChange={handleOwnerChange}
          onCountryChange={handleCountryChange}
          onDateChange={handleDateChange}
          onInputChange={handleInputChange}
          onResidencyStatusChange={handleResidencyStatusChange}
          hideCancel={owners.length === 0 && editingIndex === null}
        />
      )}
      
      {!showForm && owners.length === 0 && (
        <EmptyOwnerPrompt onAddOwner={handleAddOwner} />
      )}
      
      <FormNavigation onNext={validateAndProceed} />
    </div>
  );
};

export default OwnerStep;
