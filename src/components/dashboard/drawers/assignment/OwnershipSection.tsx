
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
import { Input } from '@/components/ui/input';
import { AssignmentFormValues } from './AssignmentForm';

interface OwnershipSectionProps {
  control: Control<AssignmentFormValues>;
}

const OwnershipSection: React.FC<OwnershipSectionProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="ownershipPercentage"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ownership Percentage</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="1"
              max="100"
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          </FormControl>
          <FormDescription>
            Percentage of ownership (1-100)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default OwnershipSection;
