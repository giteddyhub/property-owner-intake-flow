
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PropertiesTableHeaderProps {
  onAddProperty: () => void;
  propertiesCount: number;
}

export const PropertiesTableHeader: React.FC<PropertiesTableHeaderProps> = ({
  onAddProperty,
  propertiesCount
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium text-gray-900">Properties</h3>
        <span className="text-sm text-gray-500">({propertiesCount})</span>
      </div>
      <Button 
        onClick={onAddProperty}
        size="sm"
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Property
      </Button>
    </div>
  );
};
