
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PropertyAddress } from '@/types/form';

interface PropertyAddressSectionProps {
  address: PropertyAddress;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  provinces: string[];
}

const PropertyAddressSection: React.FC<PropertyAddressSectionProps> = ({ 
  address, 
  onInputChange, 
  onSelectChange,
  provinces
}) => {
  return (
    <div className="mt-6">
      <h4 className="text-md font-medium mb-3">Property Address*</h4>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="address.comune">Comune*</Label>
          <Input 
            id="address.comune" 
            name="address.comune" 
            placeholder="e.g. Roma, Milano, Firenze"
            value={address.comune} 
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="address.province">Province*</Label>
          <Select 
            value={address.province} 
            onValueChange={(value) => onSelectChange('address.province', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map(province => (
                <SelectItem key={province} value={province}>{province}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="address.street">Street Address*</Label>
          <Input 
            id="address.street" 
            name="address.street" 
            placeholder="e.g. Via Roma 123"
            value={address.street} 
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="address.zip">ZIP Code*</Label>
          <Input 
            id="address.zip" 
            name="address.zip" 
            placeholder="e.g. 00100"
            value={address.zip} 
            onChange={onInputChange}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyAddressSection;
