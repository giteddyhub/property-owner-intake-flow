
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';

interface EmptyPropertiesProps {
  onAddProperty: () => void;
}

export const EmptyProperties: React.FC<EmptyPropertiesProps> = ({ onAddProperty }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Building2 className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        Get started by adding your first property to track ownership and manage assignments.
      </p>
      <Button onClick={onAddProperty} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Your First Property
      </Button>
    </div>
  );
};
