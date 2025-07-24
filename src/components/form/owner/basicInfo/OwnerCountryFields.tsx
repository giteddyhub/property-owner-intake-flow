
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
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

interface OwnerCountryFieldsProps {
  countryOfBirth: string;
  citizenship: string;
  stateOfBirth?: string;
  stateOfCitizenship?: string;
  onCountryChange: (field: string, value: string) => void;
  onStateChange?: (field: string, value: string) => void;
}

const OwnerCountryFields: React.FC<OwnerCountryFieldsProps> = ({ 
  countryOfBirth, 
  citizenship,
  stateOfBirth,
  stateOfCitizenship, 
  onCountryChange,
  onStateChange
}) => {
  const [isBirthUS, setIsBirthUS] = useState<boolean>(countryOfBirth === 'United States');
  const [isCitizenshipUS, setIsCitizenshipUS] = useState<boolean>(citizenship === 'United States');
  
  // Update US state flags when country changes
  useEffect(() => {
    setIsBirthUS(countryOfBirth === 'United States');
  }, [countryOfBirth]);
  
  useEffect(() => {
    setIsCitizenshipUS(citizenship === 'United States');
  }, [citizenship]);

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
        {isBirthUS && (
          <div className="mt-2">
            <Label htmlFor="stateOfBirth">State of Birth*</Label>
            <Select 
              onValueChange={(value) => onStateChange && onStateChange('stateOfBirth', value)} 
              value={stateOfBirth || ""}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select state of birth" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
                  <SelectItem key={`birth-${state}`} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
        {isCitizenshipUS && (
          <div className="mt-2">
            <Label htmlFor="stateOfCitizenship">State of Residence in US*</Label>
            <Select 
              onValueChange={(value) => onStateChange && onStateChange('stateOfCitizenship', value)} 
              value={stateOfCitizenship || ""}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select state of residence" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
                  <SelectItem key={`citizenship-${state}`} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </>
  );
};

export default OwnerCountryFields;
