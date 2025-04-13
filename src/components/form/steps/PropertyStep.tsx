
import React, { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import FormNavigation from '@/components/form/FormNavigation';
import { toast } from 'sonner';
import { 
  Property, 
  OccupancyStatus,
  OccupancyAllocation 
} from '@/types/form';
import { 
  createEmptyProperty, 
  getInitialOccupancyMonths,
  normalizeActivityType
} from '../property/propertyUtils';
import PropertyHeader from '../property/PropertyHeader';
import PropertyList from '../property/PropertyList';
import PropertyForm from '../property/PropertyForm';

const PropertyStep: React.FC = () => {
  const { state, addProperty, updateProperty, removeProperty } = useFormContext();
  const { properties } = state;
  
  const [currentProperty, setCurrentProperty] = useState<Property>(createEmptyProperty());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(properties.length === 0);

  const handleEdit = (index: number) => {
    const property = { ...properties[index] };
    
    // Handle the case of legacy 'neither' value
    if (property.activity2024 === 'neither') {
      property.activity2024 = normalizeActivityType('neither');
    }
    
    const { initialOccupancyMonths, newActiveStatuses } = getInitialOccupancyMonths(property);
    
    setCurrentProperty(property);
    setEditingIndex(index);
    setShowForm(true);
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Property Information</h2>
      
      {properties.length > 0 && !showForm && (
        <div className="mb-6">
          <PropertyHeader 
            properties={properties} 
            onAddProperty={() => {
              setCurrentProperty(createEmptyProperty());
              setEditingIndex(null);
              setShowForm(true);
            }} 
          />
          
          <PropertyList 
            properties={properties}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
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
