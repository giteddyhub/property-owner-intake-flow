
import React from 'react';
import { Owner } from '@/types/form';
import OwnerNameFields from './basicInfo/OwnerNameFields';
import OwnerDateOfBirthField from './basicInfo/OwnerDateOfBirthField';
import OwnerCountryFields from './basicInfo/OwnerCountryFields';
import OwnerMaritalStatusField from './basicInfo/OwnerMaritalStatusField';
import OwnerTaxCodeField from './basicInfo/OwnerTaxCodeField';

interface OwnerBasicInfoSectionProps {
  owner: Owner;
  onOwnerChange: (field: string, value: any) => void;
  onCountryChange: (field: string, value: string) => void;
  onDateChange: (date: Date | undefined) => void;
}

const OwnerBasicInfoSection: React.FC<OwnerBasicInfoSectionProps> = ({ 
  owner, 
  onOwnerChange, 
  onCountryChange, 
  onDateChange 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOwnerChange(e.target.name, e.target.value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <OwnerNameFields
        firstName={owner.firstName}
        lastName={owner.lastName}
        onInputChange={handleInputChange}
      />
      
      <OwnerDateOfBirthField
        dateOfBirth={owner.dateOfBirth}
        onDateChange={onDateChange}
      />
      
      <OwnerCountryFields
        countryOfBirth={owner.countryOfBirth}
        citizenship={owner.citizenship}
        onCountryChange={onCountryChange}
      />
      
      <OwnerMaritalStatusField
        maritalStatus={owner.maritalStatus}
        onOwnerChange={onOwnerChange}
      />
      
      <OwnerTaxCodeField
        italianTaxCode={owner.italianTaxCode}
        onInputChange={handleInputChange}
      />
    </div>
  );
};

export default OwnerBasicInfoSection;
