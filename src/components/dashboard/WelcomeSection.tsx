
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Plus, Users, Building2, Link, Sparkles, X } from 'lucide-react';

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
      <Card 
        className={`mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 transition-all duration-300 ${
          isAnimatingOut ? 'animate-fade-out scale-95 opacity-0' : 'animate-fade-in'
        }`}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 relative">
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 h-8 w-8 bg-white rounded-full shadow-sm border border-green-200 flex items-center justify-center hover:bg-green-50 transition-colors duration-200 group"
              aria-label="Dismiss congratulations message"
            >
              <X className="h-4 w-4 text-green-600 group-hover:text-green-700" />
            </button>
            
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Congratulations, {userName}! 🎉
              </h3>
              <p className="text-green-700">
                Your property portfolio is all set up. You can now manage your owners, properties, and ownership assignments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render anything if complete and dismissed
  if (isComplete && isDismissed) {
    return null;
  }

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <span className="text-xl">Welcome, {userName}!</span>
            <div className="text-sm font-normal text-gray-600 mt-1">
              Complete your setup ({completedSteps}/{totalSteps} steps completed)
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Bar */}
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
          
          {/* Setup Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border transition-all duration-200 ${
              hasOwners 
                ? 'bg-green-50 border-green-200 shadow-sm' 
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`transition-colors duration-200 ${
                    hasOwners ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {hasOwners ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
                {!hasOwners && (
                  <Button 
                    size="sm" 
                    onClick={onAddOwner} 
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
              <div>
                <div className="font-medium text-sm mb-1">Property Owners</div>
                <div className="text-xs text-gray-600">
                  {hasOwners ? 'Owners added successfully' : 'Add property owners to get started'}
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border transition-all duration-200 ${
              hasProperties 
                ? 'bg-green-50 border-green-200 shadow-sm' 
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`transition-colors duration-200 ${
                    hasProperties ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {hasProperties ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <Building2 className="h-4 w-4 text-gray-600" />
                </div>
                {!hasProperties && (
                  <Button 
                    size="sm" 
                    onClick={onAddProperty} 
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
              <div>
                <div className="font-medium text-sm mb-1">Properties</div>
                <div className="text-xs text-gray-600">
                  {hasProperties ? 'Properties added successfully' : 'Add your property details'}
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border transition-all duration-200 ${
              hasAssignments 
                ? 'bg-green-50 border-green-200 shadow-sm' 
                : hasOwners && hasProperties
                  ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`transition-colors duration-200 ${
                    hasAssignments ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {hasAssignments ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <Link className="h-4 w-4 text-gray-600" />
                </div>
                {!hasAssignments && hasOwners && hasProperties && (
                  <Button 
                    size="sm" 
                    onClick={onAddAssignment} 
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Link
                  </Button>
                )}
              </div>
              <div>
                <div className="font-medium text-sm mb-1">Ownership Links</div>
                <div className="text-xs text-gray-600">
                  {hasAssignments 
                    ? 'Ownership relationships established' 
                    : hasOwners && hasProperties
                      ? 'Connect owners to properties'
                      : 'Add owners and properties first'
                  }
                </div>
              </div>
            </div>
          </div>
          
          {/* Next Step Guidance */}
          {!hasOwners && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-blue-900 mb-1">Start with Property Owners</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Begin by adding the individuals or entities who own your properties. This will help you track ownership details and manage tax information.
                  </p>
                  <Button 
                    onClick={onAddOwner} 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Owner
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
