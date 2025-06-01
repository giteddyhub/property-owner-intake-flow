
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface OwnersTableHeaderProps {
  onAddOwner: () => void;
  ownersCount: number;
}

export const OwnersTableHeader: React.FC<OwnersTableHeaderProps> = ({
  onAddOwner,
  ownersCount
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium text-gray-900">Owners</h3>
        <span className="text-sm text-gray-500">({ownersCount})</span>
      </div>
      <Button 
        onClick={onAddOwner}
        size="sm"
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Owner
      </Button>
    </div>
  );
};
