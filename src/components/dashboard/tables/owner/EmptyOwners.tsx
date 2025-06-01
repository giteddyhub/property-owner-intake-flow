
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

interface EmptyOwnersProps {
  onAddOwner: () => void;
}

export const EmptyOwners: React.FC<EmptyOwnersProps> = ({ onAddOwner }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No owners yet</h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm">
        Start by adding property owners to manage ownership details and assignments.
      </p>
      <Button onClick={onAddOwner} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Your First Owner
      </Button>
    </div>
  );
};
