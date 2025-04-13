
import React from 'react';
import { Owner } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import CountryCombobox from '@/components/form/CountryCombobox';

interface OwnerAddressSectionProps {
  owner: Owner;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountryChange: (field: string, value: string) => void;
}

const OwnerAddressSection: React.FC<OwnerAddressSectionProps> = ({ 
  owner, 
  onInputChange, 
  onCountryChange 
}) => {
  return (
    <div className="mt-6">
      <h4 className="text-md font-medium mb-3">Address outside Italy*</h4>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="address.street">Street Address*</Label>
          <Input 
            id="address.street" 
            name="address.street" 
            placeholder="Enter street address"
            value={owner.address.street} 
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="address.city">City*</Label>
          <Input 
            id="address.city" 
            name="address.city" 
            placeholder="Enter city name"
            value={owner.address.city} 
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="address.zip">ZIP/Postal Code*</Label>
          <Input 
            id="address.zip" 
            name="address.zip" 
            placeholder="Enter ZIP/postal code"
            value={owner.address.zip} 
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="address.country">Country*</Label>
          <div className="mt-1">
            <CountryCombobox
              value={owner.address.country}
              onChange={(value) => onCountryChange('address.country', value)}
              placeholder="Select country"
              excludeCountries={['Italy']}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerAddressSection;
