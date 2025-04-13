import React from 'react';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PropertyType } from '@/types/form';
import { usePropertyForm } from './context/PropertyFormContext';

const PropertyTypeSection: React.FC = () => {
  const { currentProperty, handleSelectChange } = usePropertyForm();
  
  return (
    <div className="mt-6">
      <Label htmlFor="propertyType">Property Type*</Label>
      <Select 
        value={currentProperty.propertyType} 
        onValueChange={(value) => handleSelectChange('propertyType', value as PropertyType)}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select property type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="RESIDENTIAL">Residential</SelectItem>
          <SelectItem value="B&B">B&B</SelectItem>
          <SelectItem value="COMMERCIAL">Commercial</SelectItem>
          <SelectItem value="LAND">Land</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PropertyTypeSection;
