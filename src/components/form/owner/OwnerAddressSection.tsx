
import React, { useState, useEffect } from 'react';
import { Owner } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import CountryCombobox from '@/components/form/CountryCombobox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// List of US states
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  "District of Columbia", "Puerto Rico", "U.S. Virgin Islands", "Guam", "American Samoa",
  "Northern Mariana Islands"
];

interface OwnerAddressSectionProps {
  owner: Owner;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountryChange: (field: string, value: string) => void;
  onStateChange?: (state: string) => void;
}

const OwnerAddressSection: React.FC<OwnerAddressSectionProps> = ({ 
  owner, 
  onInputChange, 
  onCountryChange,
  onStateChange
}) => {
  const [isUS, setIsUS] = useState<boolean>(owner.address.country === 'United States');
  
  // Update isUS state when country changes
  useEffect(() => {
    setIsUS(owner.address.country === 'United States');
  }, [owner.address.country]);

  const handleStateChange = (state: string) => {
    if (onStateChange) {
      onStateChange(state);
    }
  };
  
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
        
        {isUS && (
          <div>
            <Label htmlFor="address.state">State*</Label>
            <Select 
              value={owner.address.state || ''}
              onValueChange={handleStateChange}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
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
