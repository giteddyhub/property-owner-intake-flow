
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

interface NextStepGuidanceProps {
  hasOwners: boolean;
  onAddOwner: () => void;
}

export const NextStepGuidance: React.FC<NextStepGuidanceProps> = ({
  hasOwners,
  onAddOwner
}) => {
  if (hasOwners) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-blue-900 mb-1">Start with Property Owners</h4>
          <p className="text-sm text-blue-700 mb-3">
            Begin by adding the individuals or entities who own your properties. This will help you track ownership details and manage tax information.
          </p>
          <Button 
            onClick={onAddOwner} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Owner
          </Button>
        </div>
      </div>
    </div>
  );
};
