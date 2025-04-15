
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';

interface ReviewActionsProps {
  prevStep: () => void;
  onSubmitButtonClick: () => void;
  isSubmitting: boolean;
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
}

const ReviewActions: React.FC<ReviewActionsProps> = ({ 
  prevStep, 
  onSubmitButtonClick, 
  isSubmitting,
  owners,
  properties,
  assignments
}) => {
  // Check if all properties have at least one ownership assignment
  const propertiesWithAssignments = new Set(
    assignments.map(assignment => assignment.propertyId)
  );
  
  const allPropertiesHaveAssignments = properties.every(
    property => propertiesWithAssignments.has(property.id)
  );
  
  // Check if total ownership percentages add up to 100% for each property
  const propertyAssignmentTotals = new Map<string, number>();
  
  assignments.forEach(assignment => {
    const currentTotal = propertyAssignmentTotals.get(assignment.propertyId) || 0;
    propertyAssignmentTotals.set(
      assignment.propertyId, 
      currentTotal + assignment.ownershipPercentage
    );
  });
  
  const allPropertiesHave100Percent = Array.from(propertyAssignmentTotals.values()).every(
    total => Math.abs(total - 100) < 0.001 // Use a small epsilon for floating point comparison
  );
  
  // Determine if submit button should be disabled
  const isSubmitDisabled = 
    isSubmitting || 
    owners.length === 0 || 
    properties.length === 0 || 
    assignments.length === 0 || 
    !allPropertiesHaveAssignments || 
    !allPropertiesHave100Percent;
  
  // Get error message
  const getErrorMessage = () => {
    if (owners.length === 0) {
      return "Please add at least one owner";
    }
    if (properties.length === 0) {
      return "Please add at least one property";
    }
    if (assignments.length === 0) {
      return "Please add ownership assignments for your properties";
    }
    if (!allPropertiesHaveAssignments) {
      return "All properties must have at least one owner assigned";
    }
    if (!allPropertiesHave100Percent) {
      return "Ownership percentages for each property must total exactly 100%";
    }
    return "";
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {isSubmitDisabled && !isSubmitting && (
        <div className="text-sm text-red-500 font-medium">
          {getErrorMessage()}
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={prevStep}
          disabled={isSubmitting}
        >
          Back
        </Button>
        
        <Button 
          type="button" 
          onClick={onSubmitButtonClick}
          disabled={isSubmitDisabled}
          className="bg-form-300 hover:bg-form-400 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewActions;
