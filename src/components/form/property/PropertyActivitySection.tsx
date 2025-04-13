
import React, { useRef } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Euro } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CardRadioGroupItem } from '@/components/ui/radio-group';
import { RadioGroup } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { ActivityType } from '@/types/form';
import { activityExplanations } from './propertyUtils';
import { usePropertyForm } from './PropertyFormContext';

const PropertyActivitySection: React.FC = () => {
  const { 
    currentProperty, 
    handleActivityTypeChange, 
    handlePurchaseDateChange, 
    handleSaleDateChange 
  } = usePropertyForm();
  
  const { activity2024, purchaseDate, purchasePrice, saleDate, salePrice } = currentProperty;
  
  const purchasePriceRef = useRef<HTMLInputElement>(null);
  const salePriceRef = useRef<HTMLInputElement>(null);

  const handlePriceChange = (name: string, value: string, inputRef: React.RefObject<HTMLInputElement>) => {
    const numValue = value === '' ? undefined : Number(value);
    
    if (name === 'purchasePrice' || name === 'salePrice') {
      usePropertyForm().setCurrentProperty(prev => ({ ...prev, [name]: numValue }));
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

  const PurchaseDateCalendar = () => (
    <div>
      <Label htmlFor="purchaseDate">Purchase Date*</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal mt-1",
              !purchaseDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {purchaseDate ? (
              format(new Date(purchaseDate), "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto">
          <Calendar
            mode="single"
            selected={purchaseDate || undefined}
            onSelect={handlePurchaseDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const PurchasePriceInput = () => (
    <div>
      <Label htmlFor="purchasePrice">Purchase Price (€)*</Label>
      <div className="relative mt-1">
        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          id="purchasePrice" 
          type="number"
          min="0"
          placeholder="Enter purchase price"
          value={purchasePrice || ''}
          onChange={(e) => handlePriceChange('purchasePrice', e.target.value, purchasePriceRef)}
          className="pl-10"
          ref={purchasePriceRef}
        />
      </div>
    </div>
  );

  const SaleDateCalendar = () => (
    <div>
      <Label htmlFor="saleDate">Sale Date*</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal mt-1",
              !saleDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {saleDate ? (
              format(new Date(saleDate), "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto">
          <Calendar
            mode="single"
            selected={saleDate || undefined}
            onSelect={handleSaleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const SalePriceInput = () => (
    <div>
      <Label htmlFor="salePrice">Sale Price (€)*</Label>
      <div className="relative mt-1">
        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          id="salePrice" 
          type="number"
          min="0"
          placeholder="Enter sale price"
          value={salePrice || ''}
          onChange={(e) => handlePriceChange('salePrice', e.target.value, salePriceRef)}
          className="pl-10"
          ref={salePriceRef}
        />
      </div>
    </div>
  );

  return (
    <div className="mt-6">
      <h4 className="text-md font-medium mb-3">Activity in 2024*</h4>
      <RadioGroup 
        value={activity2024}
        onValueChange={(value) => handleActivityTypeChange(value as ActivityType)}
        className="flex flex-col space-y-3"
      >
        <CardRadioGroupItem 
          value="purchased" 
          id="purchased" 
          checked={activity2024 === 'purchased'}
          title="Purchased Only"
          explanation={activityExplanations.purchased}
        >
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <PurchaseDateCalendar />
            <PurchasePriceInput />
          </div>
        </CardRadioGroupItem>
        
        <CardRadioGroupItem 
          value="sold" 
          id="sold" 
          checked={activity2024 === 'sold'}
          title="Sold Only"
          explanation={activityExplanations.sold}
        >
          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <SaleDateCalendar />
            <SalePriceInput />
          </div>
        </CardRadioGroupItem>
        
        <CardRadioGroupItem 
          value="both" 
          id="both" 
          checked={activity2024 === 'both'}
          title="Both Purchased & Sold"
          explanation={activityExplanations.both}
        >
          <div className="mt-2">
            <h5 className="text-sm font-medium mb-2">Purchase Details</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <PurchaseDateCalendar />
              <PurchasePriceInput />
            </div>
            
            <h5 className="text-sm font-medium mb-2 mt-4">Sale Details</h5>
            <div className="grid gap-4 md:grid-cols-2">
              <SaleDateCalendar />
              <SalePriceInput />
            </div>
          </div>
        </CardRadioGroupItem>
        
        <CardRadioGroupItem 
          value="owned_all_year" 
          id="owned_all_year" 
          checked={activity2024 === 'owned_all_year'}
          title="Owned All Year"
          explanation={activityExplanations.neither}
        >
          <p className="text-sm text-gray-600 mt-2">No additional information needed.</p>
        </CardRadioGroupItem>
      </RadioGroup>
    </div>
  );
};

export default PropertyActivitySection;
