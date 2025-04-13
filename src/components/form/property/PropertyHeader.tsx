
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Property } from '@/types/form';

interface PropertyHeaderProps {
  properties: Property[];
  onAddProperty: () => void;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ properties, onAddProperty }) => {
  if (properties.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold">Registered Properties</h3>
        <Button 
          onClick={onAddProperty}
          className="bg-form-300 hover:bg-form-400 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
    </div>
  );
};

export default PropertyHeader;
