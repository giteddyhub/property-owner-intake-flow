
import React from 'react';
import { Owner } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CalendarIcon, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import CountryCombobox from '@/components/form/CountryCombobox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, StandardTooltipContent } from '@/components/ui/tooltip';
import { MaritalStatus } from '@/types/form';

interface OwnerBasicInfoSectionProps {
  owner: Owner;
  onOwnerChange: (field: string, value: any) => void;
  onCountryChange: (field: string, value: string) => void;
  onDateChange: (date: Date | undefined) => void;
}

const OwnerBasicInfoSection: React.FC<OwnerBasicInfoSectionProps> = ({ 
  owner, 
  onOwnerChange, 
  onCountryChange, 
  onDateChange 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOwnerChange(e.target.name, e.target.value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <Label htmlFor="firstName">First Name*</Label>
        <Input 
          id="firstName" 
          name="firstName" 
          placeholder="Enter first name"
          value={owner.firstName} 
          onChange={handleInputChange} 
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="lastName">Last Name*</Label>
        <Input 
          id="lastName" 
          name="lastName" 
          placeholder="Enter last name"
          value={owner.lastName} 
          onChange={handleInputChange} 
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="dateOfBirth">Date of Birth*</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal mt-1",
                !owner.dateOfBirth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {owner.dateOfBirth ? (
                format(owner.dateOfBirth, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto">
            <Calendar
              mode="single"
              selected={owner.dateOfBirth || undefined}
              onSelect={onDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div>
        <Label htmlFor="countryOfBirth">Country of Birth*</Label>
        <div className="mt-1">
          <CountryCombobox
            value={owner.countryOfBirth}
            onChange={(value) => onCountryChange('countryOfBirth', value)}
            placeholder="Select country of birth"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="citizenship">Citizenship*</Label>
        <div className="mt-1">
          <CountryCombobox
            value={owner.citizenship}
            onChange={(value) => onCountryChange('citizenship', value)}
            placeholder="Select citizenship"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="maritalStatus">Marital Status*</Label>
        <Select 
          value={owner.maritalStatus} 
          onValueChange={(value) => onOwnerChange('maritalStatus', value as MaritalStatus)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNMARRIED">Unmarried</SelectItem>
            <SelectItem value="MARRIED">Married</SelectItem>
            <SelectItem value="DIVORCED">Divorced</SelectItem>
            <SelectItem value="WIDOWED">Widowed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <div className="flex items-center space-x-1">
          <Label htmlFor="italianTaxCode">Italian Tax Code*</Label>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <StandardTooltipContent>
                <p>The "Codice Fiscale" is a unique identifier issued by the Italian government. It's required for tax purposes, property transactions, and official documents in Italy.</p>
                <p className="mt-2 font-medium">Example: RSSMRA80A01H501W</p>
              </StandardTooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input 
          id="italianTaxCode" 
          name="italianTaxCode" 
          value={owner.italianTaxCode || ''} 
          onChange={handleInputChange}
          placeholder="e.g. RSSMRA80A01H501W"
          className="mt-1"
          required
        />
      </div>
    </div>
  );
};

export default OwnerBasicInfoSection;
