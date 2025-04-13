
import React from 'react';
import { useFormContext } from '@/contexts/FormContext';
import FormNavigation from '@/components/form/FormNavigation';
import { toast } from 'sonner';
import { Property } from '@/types/form';
import PropertyHeader from '../property/PropertyHeader';
import PropertyList from '../property/PropertyList';
import PropertyForm from '../property/PropertyForm';
import EmptyPropertyPrompt from '../property/EmptyPropertyPrompt';
import { usePropertyStep } from '../property/hooks/usePropertyStep';

const PropertyStep: React.FC = () => {
  const { state, addProperty, updateProperty, removeProperty } = useFormContext();
  const { properties } = state;
  
  const { 
    currentProperty, 
    editingIndex, 
    showForm, 
    handleEdit, 
    handleDelete, 
    handleCancel, 
    handleSubmit, 
    handleAddProperty,
    validateAndProceed 
  } = usePropertyStep();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Property Information</h2>
      
      {properties.length > 0 && !showForm && (
        <div className="mb-6">
          <PropertyHeader 
            properties={properties} 
            onAddProperty={handleAddProperty}
          />
          
          <PropertyList 
            properties={properties}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
      
      {properties.length === 0 && !showForm && (
        <EmptyPropertyPrompt onAddProperty={handleAddProperty} />
      )}
      
      {showForm ? (
        <PropertyForm 
          property={currentProperty}
          editingIndex={editingIndex}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          hideCancel={properties.length === 0 && editingIndex === null}
        />
      ) : (
        <FormNavigation 
          onNext={validateAndProceed}
          showNext={true}
          showBack={true}
        />
      )}
    </div>
  );
};

export default PropertyStep;
