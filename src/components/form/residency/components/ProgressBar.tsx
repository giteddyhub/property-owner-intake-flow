
import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, total }) => {
  const percentage = (progress / total) * 100;
  
  return (
    <div className="bg-gray-100 h-2 rounded-full mb-8">
      <div 
        className="bg-purple-600 h-2 rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
