
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { OccupancyStatus, Property } from '@/types/form';

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
  // Handler to stop clicks on the select from propagating up to the parent div
  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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
          <div className="flex items-center gap-2" onClick={handleSelectClick}>
            <Select 
              value={months.toString()}
              onValueChange={(value) => onMonthsChange(parseInt(value))}
              disabled={availableMonths.length === 0}
            >
              <SelectTrigger className="mt-1 w-24">
                <SelectValue placeholder="Months" />
              </SelectTrigger>
              <SelectContent 
                className="z-50"
                onClick={e => e.stopPropagation()}
              >
                {availableMonths.map(month => (
                  <SelectItem 
                    key={`${status.toLowerCase()}-${month}`} 
                    value={month.toString()}
                  >
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

export default OccupancyStatusItem;
