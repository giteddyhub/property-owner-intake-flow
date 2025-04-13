
import React from 'react';
import { Input } from '@/components/ui/input';
import { Euro } from 'lucide-react';
import { usePropertyForm } from './PropertyFormContext';

const PropertyRentalIncomeSection: React.FC = () => {
  const { currentProperty, handleInputChange } = usePropertyForm();
  
  return (
    <div className="mt-6">
      <h4 className="font-medium mb-3">💸 2024 Rental Income*</h4>
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
