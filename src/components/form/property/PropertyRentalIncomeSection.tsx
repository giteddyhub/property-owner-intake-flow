
import React from 'react';
import { Input } from '@/components/ui/input';
import { Euro, InfoIcon } from 'lucide-react';
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
    <div className="mt-6">
      <div className="flex items-center space-x-2 mb-3">
        <h4 className="font-medium">💸 2024 Rental Income*</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Enter the rental income for this specific property only. 
                If you have multiple rental properties, input the income 
                for each property separately.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="relative mt-1">
        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          id="rentalIncome" 
          name="rentalIncome" 
          type="number"
          min="0"
          placeholder="Enter rental income"
          value={currentProperty.rentalIncome || ''}
          onChange={handleInputChange}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default PropertyRentalIncomeSection;
