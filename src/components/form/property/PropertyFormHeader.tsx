import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePropertyForm } from './context/PropertyFormContext';

const PropertyFormHeader: React.FC<{ editingIndex: number | null }> = ({ editingIndex }) => {
  const { currentProperty, handleInputChange } = usePropertyForm();
  
  return (
    <>
      <h3 className="text-lg font-semibold mb-4">
        {editingIndex !== null ? 'Edit Property' : 'Add New Property'}
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="label">Property Name*</Label>
          <Input 
            id="label" 
            name="label" 
            placeholder="e.g. Vacation Home in Venice" 
            value={currentProperty.label || ''} 
            onChange={handleInputChange} 
            className="mt-1"
            required
          />
        </div>
      </div>
    </>
  );
};

export default PropertyFormHeader;
