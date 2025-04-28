
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
import { Owner } from '@/components/dashboard/types';
import { AssignmentFormValues } from './AssignmentForm';

interface OwnerSectionProps {
  control: Control<AssignmentFormValues>;
  disabled: boolean;
  owners: Owner[];
}

const OwnerSection: React.FC<OwnerSectionProps> = ({ control, disabled, owners }) => {
  return (
    <FormField
      control={control}
      name="ownerId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Owner</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an owner" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {owners.map(owner => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.firstName} {owner.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Select the owner for this property
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default OwnerSection;
