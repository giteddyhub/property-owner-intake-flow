
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

interface TaxCreditsSectionProps {
  control: Control<AssignmentFormValues>;
}

const TaxCreditsSection: React.FC<TaxCreditsSectionProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="taxCredits"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tax Credits (Optional)</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="0"
              placeholder="0.00"
              {...field}
              onChange={(e) => field.onChange(
                e.target.value ? Number(e.target.value) : undefined
              )}
            />
          </FormControl>
          <FormDescription>
            Any applicable tax credits in Euro
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TaxCreditsSection;
