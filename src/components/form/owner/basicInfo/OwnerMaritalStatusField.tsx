
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaritalStatus } from '@/types/form';

interface OwnerMaritalStatusFieldProps {
  maritalStatus: MaritalStatus;
  onOwnerChange: (field: string, value: any) => void;
}

const OwnerMaritalStatusField: React.FC<OwnerMaritalStatusFieldProps> = ({ 
  maritalStatus, 
  onOwnerChange 
}) => {
  return (
    <div>
      <Label htmlFor="maritalStatus">Marital Status*</Label>
      <Select 
        value={maritalStatus} 
        onValueChange={(value) => onOwnerChange('maritalStatus', value as MaritalStatus)}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="UNMARRIED">Unmarried</SelectItem>
          <SelectItem value="MARRIED">Married</SelectItem>
          <SelectItem value="DIVORCED">Divorced</SelectItem>
          <SelectItem value="WIDOWED">Widowed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default OwnerMaritalStatusField;
