
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Plus, Users, Building2, Link } from 'lucide-react';

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

  if (isComplete) {
    return null; // Don't show welcome section if everything is completed
  }

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Welcome, {userName}!</span>
          <span className="text-sm font-normal text-gray-600">
            ({completedSteps}/{totalSteps} steps completed)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm text-gray-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                {hasOwners ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Add Owners</span>
              </div>
              {!hasOwners && (
                <Button size="sm" onClick={onAddOwner} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                {hasProperties ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <Building2 className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Add Properties</span>
              </div>
              {!hasProperties && (
                <Button size="sm" onClick={onAddProperty} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-2">
                {hasAssignments ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <Link className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Link Ownership</span>
              </div>
              {!hasAssignments && hasOwners && hasProperties && (
                <Button size="sm" onClick={onAddAssignment} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Link
                </Button>
              )}
            </div>
          </div>
          
          {!hasOwners && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-1">Get started by adding your first owner</h4>
              <p className="text-sm text-blue-700 mb-3">
                Add property owners to track ownership details and manage tax information.
              </p>
              <Button onClick={onAddOwner} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Owner
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
