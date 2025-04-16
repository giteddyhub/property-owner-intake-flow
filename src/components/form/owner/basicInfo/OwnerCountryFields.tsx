
import React from 'react';
import { Label } from '@/components/ui/label';
import CountryCombobox from '@/components/form/CountryCombobox';

interface OwnerCountryFieldsProps {
  countryOfBirth: string;
  citizenship: string;
  onCountryChange: (field: string, value: string) => void;
}

const OwnerCountryFields: React.FC<OwnerCountryFieldsProps> = ({ 
  countryOfBirth, 
  citizenship, 
  onCountryChange 
}) => {
  return (
    <>
      <div>
        <Label htmlFor="countryOfBirth">Country of Birth*</Label>
        <div className="mt-1">
          <CountryCombobox
            value={countryOfBirth}
            onChange={(value) => onCountryChange('countryOfBirth', value)}
            placeholder="Select country of birth"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="citizenship">Citizenship*</Label>
        <div className="mt-1">
          <CountryCombobox
            value={citizenship}
            onChange={(value) => onCountryChange('citizenship', value)}
            placeholder="Select citizenship"
          />
        </div>
      </div>
    </>
  );
};

export default OwnerCountryFields;
