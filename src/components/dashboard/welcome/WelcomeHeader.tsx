
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface WelcomeHeaderProps {
  completedSteps: number;
  totalSteps: number;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  completedSteps,
  totalSteps
}) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div>
          <span className="text-xl">Welcome!</span>
          <div className="text-sm font-normal text-gray-600 mt-1">
            Complete your setup ({completedSteps}/{totalSteps} steps completed)
          </div>
        </div>
      </CardTitle>
    </CardHeader>
  );
};
