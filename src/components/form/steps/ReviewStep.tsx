
import React, { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import ContactInfoDialog from '../ContactInfoDialog';
import { Owner } from '@/types/form';
import OwnerReviewCard from '../review/OwnerReviewCard';
import PropertyReviewCard from '../review/PropertyReviewCard';
import AssignmentReviewCard from '../review/AssignmentReviewCard';
import SubmissionSummary from '../review/SubmissionSummary';
import SectionHeader from '../review/SectionHeader';
import ReviewActions from '../review/ReviewActions';
import { submitFormData, ContactInfo } from '../review/submitUtils';
import {
  Accordion
} from "@/components/ui/accordion";

const ReviewStep: React.FC = () => {
  const { state, goToStep, prevStep } = useFormContext();
  const { owners, properties, assignments } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  
  const handleSubmitButtonClick = () => {
    setShowContactDialog(true);
  };
  
  const handleSubmit = async (contactInfo: ContactInfo) => {
    try {
      setIsSubmitting(true);
      await submitFormData(owners, properties, assignments, contactInfo);
    } catch (error) {
      console.error('Error during submission:', error);
    } finally {
      setIsSubmitting(false);
      setShowContactDialog(false);
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
      
      <ContactInfoDialog 
        open={showContactDialog} 
        onClose={() => setShowContactDialog(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ReviewStep;
