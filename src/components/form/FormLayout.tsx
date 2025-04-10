
import React, { useEffect } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Card, CardContent } from '@/components/ui/card';
import WelcomeStep from './steps/WelcomeStep';
import OwnerStep from './steps/OwnerStep';
import PropertyStep from './steps/PropertyStep';
import AssignmentStep from './steps/AssignmentStep';
import ReviewStep from './steps/ReviewStep';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { saveOwner, saveProperty, saveAssignment } from '@/services/formDataService';
import { toast } from 'sonner';

const FormLayout = () => {
  const { state } = useFormContext();
  const { user, signOut } = useAuth();
  const { currentStep, owners, properties, assignments } = state;

  // Save current data based on the current step
  const saveCurrentStepData = async () => {
    try {
      switch (currentStep) {
        case 1: // Owner step
          if (owners.length > 0) {
            // Save each owner
            for (const owner of owners) {
              await saveOwner(owner);
            }
            toast.success("Owner information saved", {
              description: "Your owner data has been saved successfully.",
              duration: 3000,
            });
          }
          break;
        case 2: // Property step
          if (properties.length > 0) {
            // Save each property
            for (const property of properties) {
              await saveProperty(property);
            }
            toast.success("Property information saved", {
              description: "Your property data has been saved successfully.",
              duration: 3000,
            });
          }
          break;
        case 3: // Assignment step
          if (assignments.length > 0) {
            // Save each assignment
            for (const assignment of assignments) {
              await saveAssignment(assignment);
            }
            toast.success("Assignment information saved", {
              description: "Your assignment data has been saved successfully.",
              duration: 3000,
            });
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error saving data", {
        description: "There was an error saving your data. Please try again.",
        duration: 3000,
      });
    }
  };

  const renderStep = () => {
    // Create props object for each step component
    const commonProps = {
      onSave: saveCurrentStepData
    };
    
    switch (currentStep) {
      case 0:
        return <WelcomeStep onSave={saveCurrentStepData} />;
      case 1:
        return <OwnerStep />;
      case 2:
        return <PropertyStep />;
      case 3:
        return <AssignmentStep />;
      case 4:
        return <ReviewStep expandAllSections={true} />;
      default:
        return <WelcomeStep onSave={saveCurrentStepData} />;
    }
  };

  // Save data when component mounts or user navigates away
  useEffect(() => {
    // Add beforeunload event to save data when user navigates away
    const handleBeforeUnload = () => {
      saveCurrentStepData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentStep, owners, properties, assignments]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-form-500">Italy Tax Form</h1>
        <div className="flex items-center space-x-2">
          {user && (
            <>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                <span>{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormLayout;
