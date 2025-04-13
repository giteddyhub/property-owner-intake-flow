
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyOwnerPromptProps {
  onAddOwner: () => void;
}

const EmptyOwnerPrompt: React.FC<EmptyOwnerPromptProps> = ({ onAddOwner }) => {
  return (
    <div className="text-center py-10">
      <p className="text-gray-500 mb-4">No owners added yet. Please add at least one owner.</p>
      <Button 
        onClick={onAddOwner}
        className="bg-form-300 hover:bg-form-400 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Owner
      </Button>
    </div>
  );
};

export default EmptyOwnerPrompt;
