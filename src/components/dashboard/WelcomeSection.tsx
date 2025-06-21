
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CongratulationsCard } from './welcome/CongratulationsCard';
import { WelcomeHeader } from './welcome/WelcomeHeader';
import { ProgressSection } from './welcome/ProgressSection';
import { SetupSteps } from './welcome/SetupSteps';
import { NextStepGuidance } from './welcome/NextStepGuidance';

interface WelcomeSectionProps {
  userName: string;
  hasOwners: boolean;
  hasProperties: boolean;
  hasAssignments: boolean;
  onAddOwner: () => void;
  onAddProperty: () => void;
  onAddAssignment: () => void;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  userName,
  hasOwners,
  hasProperties,
  hasAssignments,
  onAddOwner,
  onAddProperty,
  onAddAssignment
}) => {
  const completedSteps = [hasOwners, hasProperties, hasAssignments].filter(Boolean).length;
  const totalSteps = 3;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
  
  const isComplete = completedSteps === totalSteps;
  const [isDismissed, setIsDismissed] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  // Check if congratulations message was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('congratulations-dismissed');
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem('congratulations-dismissed', 'true');
    }, 300); // Match animation duration
  };

  if (isComplete && !isDismissed) {
    return (
      <CongratulationsCard
        userName={userName}
        onDismiss={handleDismiss}
        isAnimatingOut={isAnimatingOut}
      />
    );
  }

  // Don't render anything if complete and dismissed
  if (isComplete && isDismissed) {
    return null;
  }

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 transition-all duration-300 hover:shadow-md">
      <WelcomeHeader
        completedSteps={completedSteps}
        totalSteps={totalSteps}
      />
      
      <CardContent>
        <div className="space-y-6">
          <ProgressSection
            completedSteps={completedSteps}
            totalSteps={totalSteps}
            completionPercentage={completionPercentage}
          />
          
          <SetupSteps
            hasOwners={hasOwners}
            hasProperties={hasProperties}
            hasAssignments={hasAssignments}
            onAddOwner={onAddOwner}
            onAddProperty={onAddProperty}
            onAddAssignment={onAddAssignment}
          />
          
          <NextStepGuidance
            hasOwners={hasOwners}
            onAddOwner={onAddOwner}
          />
        </div>
      </CardContent>
    </Card>
  );
};
