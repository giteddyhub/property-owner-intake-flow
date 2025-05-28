
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface WidgetChangeIndicatorProps {
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
}

export const WidgetChangeIndicator: React.FC<WidgetChangeIndicatorProps> = ({
  change
}) => {
  if (!change) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      {change.type === 'increase' ? (
        <TrendingUp className="h-4 w-4 text-green-600" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-600" />
      )}
      <span className={`text-xs ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
        {change.value}% {change.period}
      </span>
    </div>
  );
};
