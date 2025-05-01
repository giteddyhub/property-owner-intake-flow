
import React, { useState, useEffect } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { Owner } from '@/types/form';
import OwnerReviewCard from '../review/OwnerReviewCard';
import PropertyReviewCard from '../review/PropertyReviewCard';
import AssignmentReviewCard from '../review/AssignmentReviewCard';
import SubmissionSummary from '../review/SubmissionSummary';
import SectionHeader from '../review/SectionHeader';
import ReviewActions from '../review/ReviewActions';
import { submitFormData } from '../review/submitUtils';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '../../auth/AuthModal';
import { toast } from 'sonner';
import {
  Accordion
} from "@/components/ui/accordion";

const ReviewStep: React.FC = () => {
  const { state, goToStep, prevStep } = useFormContext();
  const { owners, properties, assignments } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, processingSubmission, setProcessingSubmission } = useAuth();
  
  // Check if we should automatically try to submit pending form data
  useEffect(() => {
    const checkPendingSubmission = async () => {
      // If user is logged in and there's pending form data, try to submit it
      if (user && sessionStorage.getItem('pendingFormData') && !processingSubmission) {
        const pendingData = JSON.parse(sessionStorage.getItem('pendingFormData') || '{}');
        
        // Only proceed if we have valid data
        if (pendingData.owners && pendingData.properties) {
          console.log("Found pending form data on page load, submitting with user ID:", user.id);
          try {
            setIsSubmitting(true);
            setProcessingSubmission(true);
            
            await submitFormData(
              pendingData.owners,
              pendingData.properties, 
              pendingData.assignments,
              pendingData.contactInfo,
              user.id
            );
            
            sessionStorage.removeItem('pendingFormData');
            toast.success("Your information has been successfully submitted!");
          } catch (error) {
            console.error("Error submitting pending form data:", error);
            toast.error("Failed to submit your information. Please try again.");
          } finally {
            setIsSubmitting(false);
            setProcessingSubmission(false);
          }
        }
      }
    };
    
    checkPendingSubmission();
  }, [user, processingSubmission, setProcessingSubmission]);
  
  const handleSubmitButtonClick = () => {
    // Prevent duplicate submissions
    if (processingSubmission) {
      toast.info("Your submission is already being processed");
      return;
    }
    
    // Store form data in sessionStorage so we can access it post-authentication
    sessionStorage.setItem('pendingFormData', JSON.stringify({
      owners,
      properties,
      assignments,
      contactInfo: {
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      }
    }));
    
    if (!user) {
      // If not logged in, show auth modal
      setShowAuthModal(true);
    } else {
      // If logged in, proceed with submission directly
      handleSubmit();
    }
  };
  
  const handleAuthSuccess = () => {
    // Close the auth modal
    setShowAuthModal(false);
    // Short timeout to ensure auth state is updated
    setTimeout(() => {
      // If user is authenticated after modal closes, submit the form
      if (user && !processingSubmission) {
        handleSubmit();
      }
    }, 1000); // Increased timeout to ensure auth state is properly updated
  };
  
  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (processingSubmission) {
      toast.info("Your submission is already being processed");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setProcessingSubmission(true);
      
      console.log("Submitting form with user ID:", user?.id);
      
      // Get user information to populate contact info
      const contactInfo = {
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      };
      
      // Pass the user ID to submitFormData so data can be properly associated
      await submitFormData(owners, properties, assignments, contactInfo, user?.id || null);
      
      // Show success message
      toast.success("Your information has been successfully submitted!");
      
      // Set flag to redirect to dashboard after submission
      sessionStorage.setItem('redirectToDashboard', 'true');
      
      // Short timeout before redirecting
      setTimeout(() => {
        // Check if we should redirect to dashboard
        if (sessionStorage.getItem('redirectToDashboard')) {
          sessionStorage.removeItem('redirectToDashboard');
          window.location.href = '/dashboard';
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
      setProcessingSubmission(false);
    }
  };
  
  const getPropertyAssignments = (propertyId: string) => {
    return assignments.filter(assignment => assignment.propertyId === propertyId);
  };
  
  const getOwnerById = (ownerId: string) => {
    return owners.find(owner => owner.id === ownerId);
  };
  
  const getTotalPercentage = (propertyId: string) => {
    return getPropertyAssignments(propertyId)
      .reduce((sum, assignment) => sum + assignment.ownershipPercentage, 0);
  };

  return (
    <div>
      {isSubmitting && <LoadingOverlay message="Submitting your information..." />}
      
      <h2 className="text-2xl font-bold mb-6 text-form-400">Review & Submit</h2>
      
      <p className="mb-6 text-gray-600">
        Please review all the information below before submitting. You can go back to make changes if needed.
      </p>
      
      <SubmissionSummary 
        owners={owners} 
        properties={properties} 
        assignments={assignments} 
      />
      
      <div className="mb-8">
        <SectionHeader title="Owners" onEditClick={() => goToStep(1)} />
        
        <div className="grid gap-4 md:grid-cols-2">
          {owners.map((owner) => (
            <OwnerReviewCard key={owner.id} owner={owner} />
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <SectionHeader title="Properties" onEditClick={() => goToStep(2)} />
        
        <Accordion type="multiple" className="w-full space-y-4">
          {properties.map((property) => (
            <PropertyReviewCard 
              key={property.id} 
              property={property} 
              onEditClick={() => goToStep(2)} 
            />
          ))}
        </Accordion>
      </div>
      
      <div className="mb-8">
        <SectionHeader title="Owner-Property Assignments" onEditClick={() => goToStep(3)} />
        
        <div className="space-y-4">
          {properties.map((property) => {
            const propertyAssignments = getPropertyAssignments(property.id);
            const totalPercentage = getTotalPercentage(property.id);
            
            if (propertyAssignments.length === 0) {
              return null;
            }
            
            return (
              <AssignmentReviewCard 
                key={property.id}
                property={property}
                propertyAssignments={propertyAssignments}
                totalPercentage={totalPercentage}
                getOwnerById={getOwnerById}
              />
            );
          })}
        </div>
      </div>
      
      <ReviewActions 
        prevStep={prevStep}
        onSubmitButtonClick={handleSubmitButtonClick}
        isSubmitting={isSubmitting || processingSubmission}
        owners={owners}
        properties={properties}
        assignments={assignments}
      />
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
        title="Create an Account to Submit"
        description="Creating an account allows you to access your submission later and receive updates."
        defaultTab="sign-up"
      />
    </div>
  );
};

export default ReviewStep;
