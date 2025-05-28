
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface ProgressiveLoaderProps {
  stage: 'initializing' | 'loading-data' | 'processing' | 'rendering' | 'complete';
  progress?: number;
  message?: string;
}

const stageMessages = {
  'initializing': 'Initializing admin panel...',
  'loading-data': 'Loading data from server...',
  'processing': 'Processing information...',
  'rendering': 'Rendering interface...',
  'complete': 'Ready!'
};

const stageProgress = {
  'initializing': 20,
  'loading-data': 40,
  'processing': 70,
  'rendering': 90,
  'complete': 100
};

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  stage,
  progress,
  message
}) => {
  const currentProgress = progress ?? stageProgress[stage];
  const currentMessage = message ?? stageMessages[stage];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 rounded-full bg-primary/20"></div>
                <div 
                  className="absolute inset-0 rounded-full bg-primary transition-all duration-500"
                  style={{
                    clipPath: `polygon(50% 0%, 50% 50%, ${50 + (currentProgress / 100) * 50}% 50%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)`
                  }}
                ></div>
                <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                  <span className="text-sm font-medium">{currentProgress}%</span>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="font-medium">{currentMessage}</h3>
                <Progress value={currentProgress} className="w-64" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
