
import React, { useState } from 'react';
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
  const { user } = useAuth();
  
  const handleSubmitButtonClick = () => {
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
      if (user) {
        handleSubmit();
      }
    }, 500);
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Check if any property has document retrieval service
      const hasDocumentRetrievalService = properties.some(
        property => property.useDocumentRetrievalService
      );
      
      // Store in session storage for the success page
      sessionStorage.setItem('hasDocumentRetrievalService', 
        JSON.stringify(hasDocumentRetrievalService)
      );
      
      // Get user information to populate contact info
      const contactInfo = {
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      };
      
      // Pass the user ID to submitFormData so data can be properly associated
      await submitFormData(owners, properties, assignments, contactInfo, user?.id || null);
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        isSubmitting={isSubmitting}
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
