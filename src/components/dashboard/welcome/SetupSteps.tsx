
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, Plus, Users, Building2, Link } from 'lucide-react';

interface SetupStepsProps {
  hasOwners: boolean;
  hasProperties: boolean;
  hasAssignments: boolean;
  onAddOwner: () => void;
  onAddProperty: () => void;
  onAddAssignment: () => void;
}

export const SetupSteps: React.FC<SetupStepsProps> = ({
  hasOwners,
  hasProperties,
  hasAssignments,
  onAddOwner,
  onAddProperty,
  onAddAssignment
}) => {
  return (
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
  );
};
