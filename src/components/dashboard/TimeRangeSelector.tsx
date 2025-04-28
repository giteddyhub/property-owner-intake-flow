
import React from 'react';

interface TimeRangeSelectorProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ 
  timeRange, 
  setTimeRange 
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-0.5 flex">
      <button 
        className={`px-3 py-1.5 text-sm rounded-md ${timeRange === '12m' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}
        onClick={() => setTimeRange('12m')}
      >
        12m
      </button>
      <button 
        className={`px-3 py-1.5 text-sm rounded-md ${timeRange === '30d' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}
        onClick={() => setTimeRange('30d')}
      >
        30d
      </button>
      <button 
        className={`px-3 py-1.5 text-sm rounded-md ${timeRange === '7d' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}
        onClick={() => setTimeRange('7d')}
      >
        7d
      </button>
      <button 
        className={`px-3 py-1.5 text-sm rounded-md ${timeRange === '24h' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}
        onClick={() => setTimeRange('24h')}
      >
        24h
      </button>
    </div>
  );
};
