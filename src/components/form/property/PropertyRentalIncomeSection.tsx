
import React from 'react';
import { Input } from '@/components/ui/input';
import { Euro, HelpCircle } from 'lucide-react';
import { usePropertyForm } from './context/PropertyFormContext';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

const PropertyRentalIncomeSection: React.FC = () => {
  const { currentProperty, handleInputChange } = usePropertyForm();
  
  return (
    <div className="mt-8 p-5 bg-purple-50 rounded-lg border border-purple-100">
      <div className="flex items-center">
        <h4 className="text-lg font-medium mr-2">💸 2024 Rental Income*</h4>
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="w-80 p-4">
              <p>Enter the rental income for this specific property only. If you have multiple rental properties, input the income for each property separately, by adding another property.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-sm text-gray-500 mt-1 mb-3">
        Enter the total rental income received in 2024 for this property
      </p>
      <div className="relative mt-1">
        <Euro className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-500" />
        <Input 
          id="rentalIncome" 
          name="rentalIncome" 
          type="number"
          min="0"
          placeholder="Enter rental income"
          value={currentProperty.rentalIncome || ''}
          onChange={handleInputChange}
          className="pl-12 py-6 text-lg font-medium border-purple-200 focus-visible:ring-purple-500"
        />
      </div>
    </div>
  );
};

export default PropertyRentalIncomeSection;
