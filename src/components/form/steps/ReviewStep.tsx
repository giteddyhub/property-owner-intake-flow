
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
import { submitFormData } from '../review/utils/submitUtils';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '../../auth/AuthModal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion
} from "@/components/ui/accordion";

const ReviewStep: React.FC = () => {
  const { state, goToStep, prevStep } = useFormContext();
  const { owners, properties, assignments } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, ensureUserAssociation } = useAuth();
  const [formData, setFormData] = useState(null);
  
  // Store form data in component state to ensure it's available after authentication
  useEffect(() => {
    setFormData({
      owners,
      properties,
      assignments
    });
  }, [owners, properties, assignments]);
  
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
    console.log("Auth success callback triggered");
    // Close the auth modal
    setShowAuthModal(false);
    
    // Proceed with form submission immediately after successful authentication
    // Use a longer timeout to ensure auth state is fully updated
    setTimeout(async () => {
      console.log("Processing submission after authentication");
      // Check if user is authenticated after modal closes
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      
      console.log("Current user after auth:", currentUser);
      
      if (currentUser) {
        console.log("Auth success with user:", currentUser.id);
        // Ensure associations are setup
        await ensureUserAssociation(currentUser.email || '');
        handleSubmit();
      } else {
        // Check for pending user ID
        const pendingUserId = sessionStorage.getItem('pendingUserId');
        const userEmail = sessionStorage.getItem('userEmail');
        
        if (pendingUserId) {
          console.log("No user object yet, but proceeding with pending user ID:", pendingUserId);
          // Ensure associations are setup if we have an email
          if (userEmail) await ensureUserAssociation(userEmail);
          handleSubmit();
        } else {
          toast.error("Authentication required. Please sign in to continue.");
        }
      }
    }, 2000); // Increased timeout to ensure auth state is fully updated
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
      
      // Get current authenticated user or pending ID
      const currentUser = user;
      const userId = currentUser?.id || sessionStorage.getItem('pendingUserId');
      const userEmail = currentUser?.email || sessionStorage.getItem('userEmail');
      
      console.log("Submitting with user ID:", userId, "and email:", userEmail);
      
      if (!userId && !userEmail) {
        console.error("No user ID or email available for submission");
        toast.error("Authentication required. Please sign in to continue.");
        setIsSubmitting(false);
        return;
      }
      
      // Get user information to populate contact info
      const contactInfo = {
        fullName: currentUser?.user_metadata?.full_name || sessionStorage.getItem('fullName') || '',
        email: userEmail || '',
        termsAccepted: true,
        privacyAccepted: true
      };
      
      console.log("Form data being submitted:", formData || { owners, properties, assignments });
      
      // Pass the user ID explicitly to ensure data association
      // Use stored formData if available, otherwise use current state
      const dataToSubmit = formData || { owners, properties, assignments };
      await submitFormData(
        dataToSubmit.owners, 
        dataToSubmit.properties, 
        dataToSubmit.assignments, 
        contactInfo, 
        userId || null
      );
      
      // Note: The submitFormData function now handles the redirection
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper functions
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
        redirectAfterAuth={false}
      />
    </div>
  );
};

export default ReviewStep;
