
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface OwnerNameFieldsProps {
  firstName: string;
  lastName: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OwnerNameFields: React.FC<OwnerNameFieldsProps> = ({ 
  firstName, 
  lastName, 
  onInputChange 
}) => {
  return (
    <>
      <div>
        <Label htmlFor="firstName">First Name*</Label>
        <Input 
          id="firstName" 
          name="firstName" 
          placeholder="Enter first name"
          value={firstName} 
          onChange={onInputChange} 
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="lastName">Last Name*</Label>
        <Input 
          id="lastName" 
          name="lastName" 
          placeholder="Enter last name"
          value={lastName} 
          onChange={onInputChange} 
          className="mt-1"
        />
      </div>
    </>
  );
};

export default OwnerNameFields;
