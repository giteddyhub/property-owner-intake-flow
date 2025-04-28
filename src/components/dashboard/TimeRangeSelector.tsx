
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimeRangeSelectorProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  timeRange,
  setTimeRange
}) => {
  return (
    <div className="flex items-center">
      <span className="text-sm text-gray-500 mr-2">Time range:</span>
      <Select
        value={timeRange}
        onValueChange={(value) => setTimeRange(value)}
      >
        <SelectTrigger className="w-[120px] h-8 text-sm">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1m">Last month</SelectItem>
          <SelectItem value="3m">Last 3 months</SelectItem>
          <SelectItem value="6m">Last 6 months</SelectItem>
          <SelectItem value="12m">Last 12 months</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
