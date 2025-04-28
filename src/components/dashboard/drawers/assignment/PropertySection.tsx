
import React from 'react';
import { Control } from 'react-hook-form';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Property } from '@/components/dashboard/types';
import { AssignmentFormValues } from './AssignmentForm';

interface PropertySectionProps {
  control: Control<AssignmentFormValues>;
  disabled: boolean;
  properties: Property[];
}

const PropertySection: React.FC<PropertySectionProps> = ({ control, disabled, properties }) => {
  return (
    <FormField
      control={control}
      name="propertyId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Property</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {properties.map(property => (
                <SelectItem key={property.id} value={property.id}>
                  {property.label} ({property.address.comune}, {property.address.province})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Select the property to assign
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PropertySection;
