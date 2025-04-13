
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface OccupancyProgressBarProps {
  totalMonthsAllocated: number;
}

const OccupancyProgressBar: React.FC<OccupancyProgressBarProps> = ({ totalMonthsAllocated }) => {
  const monthsRemaining = 12 - totalMonthsAllocated;
  
  return (
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
  );
};

export default OccupancyProgressBar;
