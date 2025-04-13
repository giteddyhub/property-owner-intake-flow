
import React, { useRef } from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { ActivityType } from '@/types/form';
import { activityExplanations } from './utils/propertyTypes';
import { usePropertyForm } from './context/PropertyFormContext';
import PurchaseDateCalendar from './activity/PurchaseDateCalendar';
import SaleDateCalendar from './activity/SaleDateCalendar';
import PriceInput from './activity/PriceInput';
import ActivityTypeOption from './activity/ActivityTypeOption';

const PropertyActivitySection: React.FC = () => {
  const { 
    currentProperty, 
    handleActivityTypeChange, 
    handlePurchaseDateChange, 
    handleSaleDateChange,
    setCurrentProperty
  } = usePropertyForm();
  
  const { activity2024, purchaseDate, purchasePrice, saleDate, salePrice } = currentProperty;
  
  const handlePriceChange = (name: string, value: string, inputRef: React.RefObject<HTMLInputElement>) => {
    const numValue = value === '' ? undefined : Number(value);
    
    if (name === 'purchasePrice' || name === 'salePrice') {
      setCurrentProperty(prev => ({ ...prev, [name]: numValue }));
    }
    
    setTimeout(() => {
      if (inputRef.current) {
        const cursorPosition = inputRef.current.selectionStart;
        inputRef.current.focus();
        if (cursorPosition !== null) {
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      }
    }, 0);
  };

  return (
    <div className="mt-6">
      <h4 className="text-md font-medium mb-3">Activity in 2024*</h4>
      <RadioGroup 
        value={activity2024}
        onValueChange={(value) => handleActivityTypeChange(value as ActivityType)}
        className="flex flex-col space-y-3"
      >
        <ActivityTypeOption 
          value="purchased" 
          title="Purchased Only"
          explanation={activityExplanations.purchased}
          isChecked={activity2024 === 'purchased'}
        >
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <PurchaseDateCalendar 
              purchaseDate={purchaseDate} 
              handlePurchaseDateChange={handlePurchaseDateChange} 
            />
            <PriceInput 
              id="purchasePrice" 
              label="Purchase Price (€)*" 
              value={purchasePrice} 
              onChange={handlePriceChange} 
            />
          </div>
        </ActivityTypeOption>
        
        <ActivityTypeOption 
          value="sold" 
          title="Sold Only"
          explanation={activityExplanations.sold}
          isChecked={activity2024 === 'sold'}
        >
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <SaleDateCalendar 
              saleDate={saleDate} 
              handleSaleDateChange={handleSaleDateChange} 
            />
            <PriceInput 
              id="salePrice" 
              label="Sale Price (€)*" 
              value={salePrice} 
              onChange={handlePriceChange} 
            />
          </div>
        </ActivityTypeOption>
        
        <ActivityTypeOption 
          value="both" 
          title="Both Purchased & Sold"
          explanation={activityExplanations.both}
          isChecked={activity2024 === 'both'}
        >
          <div className="mt-2">
            <h5 className="text-sm font-medium mb-2">Purchase Details</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <PurchaseDateCalendar 
                purchaseDate={purchaseDate} 
                handlePurchaseDateChange={handlePurchaseDateChange} 
              />
              <PriceInput 
                id="purchasePrice" 
                label="Purchase Price (€)*" 
                value={purchasePrice} 
                onChange={handlePriceChange} 
              />
            </div>
            
            <h5 className="text-sm font-medium mb-2 mt-4">Sale Details</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <SaleDateCalendar 
                saleDate={saleDate} 
                handleSaleDateChange={handleSaleDateChange} 
              />
              <PriceInput 
                id="salePrice" 
                label="Sale Price (€)*" 
                value={salePrice} 
                onChange={handlePriceChange} 
              />
            </div>
          </div>
        </ActivityTypeOption>
        
        <ActivityTypeOption 
          value="owned_all_year" 
          title="Owned All Year"
          explanation={activityExplanations.neither}
          isChecked={activity2024 === 'owned_all_year'}
        >
          <p className="text-sm text-gray-600 mt-2">No additional information needed.</p>
        </ActivityTypeOption>
      </RadioGroup>
    </div>
  );
};

export default PropertyActivitySection;
