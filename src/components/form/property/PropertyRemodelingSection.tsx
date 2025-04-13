
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePropertyForm } from './PropertyFormContext';

const PropertyRemodelingSection: React.FC = () => {
  const { currentProperty, handleRemodelingChange } = usePropertyForm();
  
  return (
    <div className="mt-6">
      <div className="flex items-center space-x-2">
        <Switch 
          id="remodeling" 
          checked={currentProperty.remodeling}
          onCheckedChange={handleRemodelingChange}
        />
        <Label htmlFor="remodeling">
          Remodeling or improvements done for which a building permit was filed in the past 10 years
        </Label>
      </div>
    </div>
  );
};

export default PropertyRemodelingSection;
