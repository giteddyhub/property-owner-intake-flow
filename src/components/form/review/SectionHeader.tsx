
import React from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionHeaderProps {
  title: string;
  onEditClick: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onEditClick }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onEditClick}
        className="flex items-center gap-1"
      >
        <Edit className="h-4 w-4" />
        Edit
      </Button>
    </div>
  );
};

export default SectionHeader;
