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
import { submitFormData } from '../review/utils/submissionService';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '../../auth/AuthModal';
import { toast } from 'sonner';
import {
  Accordion
} from "@/components/ui/accordion";

// Create unique ID for this component instance
const REVIEW_STEP_INSTANCE_ID = Date.now().toString();

const ReviewStep: React.FC = () => {
  const { state, goToStep, prevStep } = useFormContext();
  const { owners, properties, assignments } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [submissionInProgress, setSubmissionInProgress] = useState(false);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const { user, processingSubmission, setProcessingSubmission, submissionCompleted } = useAuth();
  
  console.log(`ReviewStep [${REVIEW_STEP_INSTANCE_ID}] render: isSubmitting=${isSubmitting}, processingSubmission=${processingSubmission}`);
  
  // Don't automatically attempt to submit on component mount
  // Let auth context handle submission after sign up instead
  
  const handleSubmitButtonClick = () => {
    // Prevent duplicate submissions
    if (processingSubmission || submissionInProgress || submissionCompleted) {
      toast.info("Your submission is already being processed");
      return;
    }
    
    console.log("ReviewStep handleSubmitButtonClick");
    
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
    
    // Mark that we've attempted submission from this component
    setSubmissionAttempted(true);
    
    // Don't try to submit here - AuthContext will handle submission after auth
    // Redirect will happen automatically through AuthContext
  };
  
  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (processingSubmission || submissionInProgress || submissionCompleted) {
      toast.info("Your submission is already being processed");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setProcessingSubmission(true);
      setSubmissionInProgress(true);
      setSubmissionAttempted(true);
      
      // Get user information to populate contact info
      const contactInfo = {
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      };
      
      // Pass the user ID to submitFormData so data can be properly associated
      await submitFormData(owners, properties, assignments, contactInfo, user?.id || null);
      
      // Success notification is handled in submitFormData
      
      // Clear form data to prevent duplicate submissions
      sessionStorage.removeItem('pendingFormData');
      
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
      setProcessingSubmission(false);
      setSubmissionInProgress(false);
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
            const propertyAssignments = assignments.filter(assignment => assignment.propertyId === property.id);
            const totalPercentage = propertyAssignments.reduce((sum, assignment) => sum + assignment.ownershipPercentage, 0);
            
            if (propertyAssignments.length === 0) {
              return null;
            }
            
            return (
              <AssignmentReviewCard 
                key={property.id}
                property={property}
                propertyAssignments={propertyAssignments}
                totalPercentage={totalPercentage}
                getOwnerById={(id) => owners.find(owner => owner.id === id)}
              />
            );
          })}
        </div>
      </div>
      
      <ReviewActions 
        prevStep={prevStep}
        onSubmitButtonClick={handleSubmitButtonClick}
        isSubmitting={isSubmitting || processingSubmission || submissionInProgress}
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
