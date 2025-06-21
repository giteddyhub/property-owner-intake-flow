
import React from 'react';

interface ProgressSectionProps {
  completedSteps: number;
  totalSteps: number;
  completionPercentage: number;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  completedSteps,
  totalSteps,
  completionPercentage
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Setup Progress</span>
        <span className="text-sm text-gray-600">{completionPercentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
};
