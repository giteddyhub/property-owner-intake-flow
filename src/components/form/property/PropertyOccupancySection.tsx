
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { HelpCircle, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { OccupancyStatus } from '@/types/form';
import { occupancyExplanations } from './propertyUtils';
import { usePropertyForm } from './PropertyFormContext';

const PropertyOccupancySection: React.FC = () => {
  const { 
    occupancyMonths,
    activeStatuses,
    availableMonths,
    totalMonthsAllocated,
    currentProperty,
    handleOccupancyStatusChange,
    handleOccupancyMonthsChange,
    handleRemoveOccupancyStatus
  } = usePropertyForm();
  
  const monthsRemaining = 12 - totalMonthsAllocated;
  
  return (
    <div className="mt-6">
      <h4 className="text-md font-medium mb-3">Rental Status in 2024*</h4>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="font-medium">Months Allocation</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground ml-1 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="w-80 p-4">
                  <p>The total number of months allocated across all rental statuses must equal 12 (one full year).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className={`text-sm font-medium ${totalMonthsAllocated === 12 ? 'text-green-600' : 'text-amber-600'}`}>
            {totalMonthsAllocated}/12 months allocated {monthsRemaining > 0 ? `(${monthsRemaining} remaining)` : ''}
          </span>
        </div>
        <Progress 
          value={(totalMonthsAllocated / 12) * 100} 
          className={`h-2 ${totalMonthsAllocated === 12 ? 'bg-green-100' : ''}`}
          indicatorClassName={totalMonthsAllocated === 12 ? 'bg-green-600' : 'bg-amber-600'} 
        />
      </div>
      
      <div className="flex flex-col space-y-3">
        <OccupancyStatusItem 
          status="LONG_TERM_RENT"
          label="Long-Term Rental"
          isActive={activeStatuses.has('LONG_TERM_RENT') || occupancyMonths.LONG_TERM_RENT > 0}
          months={occupancyMonths.LONG_TERM_RENT}
          availableMonths={availableMonths.LONG_TERM_RENT}
          explanation={occupancyExplanations.LONG_TERM_RENT}
          onStatusChange={() => handleOccupancyStatusChange('LONG_TERM_RENT')}
          onMonthsChange={(months) => handleOccupancyMonthsChange('LONG_TERM_RENT', months)}
          onRemove={() => handleRemoveOccupancyStatus('LONG_TERM_RENT')}
          currentProperty={currentProperty}
        />
        
        <OccupancyStatusItem 
          status="SHORT_TERM_RENT"
          label="Short-Term Rental"
          isActive={activeStatuses.has('SHORT_TERM_RENT') || occupancyMonths.SHORT_TERM_RENT > 0}
          months={occupancyMonths.SHORT_TERM_RENT}
          availableMonths={availableMonths.SHORT_TERM_RENT}
          explanation={occupancyExplanations.SHORT_TERM_RENT}
          onStatusChange={() => handleOccupancyStatusChange('SHORT_TERM_RENT')}
          onMonthsChange={(months) => handleOccupancyMonthsChange('SHORT_TERM_RENT', months)}
          onRemove={() => handleRemoveOccupancyStatus('SHORT_TERM_RENT')}
          currentProperty={currentProperty}
        />
        
        <OccupancyStatusItem 
          status="PERSONAL_USE"
          label="Personal Use / Vacant"
          isActive={activeStatuses.has('PERSONAL_USE') || occupancyMonths.PERSONAL_USE > 0}
          months={occupancyMonths.PERSONAL_USE}
          availableMonths={availableMonths.PERSONAL_USE}
          explanation={occupancyExplanations.PERSONAL_USE}
          onStatusChange={() => handleOccupancyStatusChange('PERSONAL_USE')}
          onMonthsChange={(months) => handleOccupancyMonthsChange('PERSONAL_USE', months)}
          onRemove={() => handleRemoveOccupancyStatus('PERSONAL_USE')}
          currentProperty={currentProperty}
        />
      </div>
    </div>
  );
};

interface OccupancyStatusItemProps {
  status: OccupancyStatus;
  label: string;
  isActive: boolean;
  months: number;
  availableMonths: number[];
  explanation: string;
  onStatusChange: () => void;
  onMonthsChange: (months: number) => void;
  onRemove: () => void;
  currentProperty: Property;
}

const OccupancyStatusItem: React.FC<OccupancyStatusItemProps> = ({
  status,
  label,
  isActive,
  months,
  availableMonths,
  explanation,
  onStatusChange,
  onMonthsChange,
  onRemove,
  currentProperty
}) => {
  return (
    <div 
      className={cn(
        "relative rounded-lg border p-4 transition-all cursor-pointer",
        isActive ? "bg-purple-50 border-purple-500 ring-1 ring-purple-500" : "bg-white border-gray-200 hover:border-gray-300"
      )}
      onClick={onStatusChange}
    >
      <div className="flex items-center gap-2.5">
        <Checkbox 
          checked={isActive}
          className="cursor-pointer"
        />
        <span className="font-medium text-gray-900 cursor-pointer">{label}</span>
      </div>
      <p className="text-sm text-gray-500 mt-1 cursor-pointer ml-7.5">
        {explanation}
      </p>
      
      <Collapsible 
        open={isActive}
        className="mt-2 ml-7.5"
      >
        <CollapsibleContent>
          <Label htmlFor={`${status.toLowerCase()}_months`}>Number of Months*</Label>
          <div className="flex items-center gap-2">
            <Select 
              value={months.toString()}
              onValueChange={(value) => onMonthsChange(parseInt(value))}
              disabled={availableMonths.length === 0}
            >
              <SelectTrigger className="mt-1 w-24">
                <SelectValue placeholder="Months" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map(month => (
                  <SelectItem key={`${status.toLowerCase()}-${month}`} value={month.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentProperty.occupancyStatuses.some(allocation => 
              typeof allocation === 'object' && 
              'status' in allocation && 
              allocation.status === status && 
              months > 0
            ) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PropertyOccupancySection;
