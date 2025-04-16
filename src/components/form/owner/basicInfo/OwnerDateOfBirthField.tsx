
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OwnerDateOfBirthFieldProps {
  dateOfBirth: Date | null;
  onDateChange: (date: Date | undefined) => void;
}

const OwnerDateOfBirthField: React.FC<OwnerDateOfBirthFieldProps> = ({ 
  dateOfBirth, 
  onDateChange 
}) => {
  return (
    <div>
      <Label htmlFor="dateOfBirth">Date of Birth*</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal mt-1",
              !dateOfBirth && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateOfBirth ? (
              format(dateOfBirth, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto">
          <Calendar
            mode="single"
            selected={dateOfBirth || undefined}
            onSelect={onDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default OwnerDateOfBirthField;
