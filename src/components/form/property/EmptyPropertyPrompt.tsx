
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyPropertyPromptProps {
  onAddProperty: () => void;
}

const EmptyPropertyPrompt: React.FC<EmptyPropertyPromptProps> = ({ onAddProperty }) => {
  return (
    <div className="text-center py-10">
      <p className="text-gray-500 mb-4">No properties added yet. Please add at least one property.</p>
      <Button 
        onClick={onAddProperty}
        className="bg-form-300 hover:bg-form-400 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Property
      </Button>
    </div>
  );
};

export default EmptyPropertyPrompt;
