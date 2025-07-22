
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  Form
} from '@/components/ui/form';
import PropertySection from './PropertySection';
import OwnerSection from './OwnerSection';
import OwnershipSection from './OwnershipSection';
import ResidencySection from './ResidencySection';
import TaxCreditsSection from './TaxCreditsSection';

export interface AssignmentFormValues {
  propertyId: string;
  ownerId: string;
  ownershipPercentage: number;
  residentAtProperty: boolean;
  residentFromDate?: Date | null;
  residentToDate?: Date | null;
  taxCredits?: number;
}

interface AssignmentFormProps {
  assignment?: OwnerPropertyAssignment;
  properties: Property[];
  owners: Owner[];
  onSuccess: () => void;
  onClose: () => void;
  userId: string;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ 
  assignment, 
  properties, 
  owners, 
  onSuccess, 
  onClose,
  userId
}) => {
  const { createAssignment, updateAssignment } = useDashboardData();
  const form = useForm<AssignmentFormValues>({
    defaultValues: {
      propertyId: '',
      ownerId: '',
      ownershipPercentage: 100,
      residentAtProperty: false,
      residentFromDate: null,
      residentToDate: null,
      taxCredits: 0
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const residentAtProperty = form.watch('residentAtProperty');

  // Reset form values when assignment prop changes
  useEffect(() => {
    console.log('[AssignmentForm] Assignment prop changed, resetting form:', assignment);
    
    if (assignment) {
      const formValues = {
        propertyId: assignment.propertyId || '',
        ownerId: assignment.ownerId || '',
        ownershipPercentage: assignment.ownershipPercentage || 100,
        residentAtProperty: assignment.residentAtProperty || false,
        residentFromDate: assignment.residentDateRange?.from || null,
        residentToDate: assignment.residentDateRange?.to || null,
        taxCredits: assignment.taxCredits || 0
      };
      
      console.log('[AssignmentForm] Setting form values:', formValues);
      form.reset(formValues);
    } else {
      // Reset to default values for new assignment
      const defaultValues = {
        propertyId: '',
        ownerId: '',
        ownershipPercentage: 100,
        residentAtProperty: false,
        residentFromDate: null,
        residentToDate: null,
        taxCredits: 0
      };
      
      console.log('[AssignmentForm] Resetting to default values:', defaultValues);
      form.reset(defaultValues);
    }
  }, [assignment, form]);
  
  const handleSubmit = async (values: AssignmentFormValues) => {
    setIsSubmitting(true);
    console.log('[AssignmentForm] Form submission started with values:', values);
    console.log('[AssignmentForm] Assignment being edited:', assignment);
    
    try {
      // Validate required fields
      if (!values.propertyId || !values.ownerId) {
        throw new Error('Property and Owner are required');
      }
      
      const assignmentData = {
        propertyId: values.propertyId,
        ownerId: values.ownerId,
        ownershipPercentage: values.ownershipPercentage,
        residentAtProperty: values.residentAtProperty,
        residentDateRange: {
          from: values.residentAtProperty && values.residentFromDate 
            ? values.residentFromDate
            : null,
          to: values.residentAtProperty && values.residentToDate
            ? values.residentToDate
            : null
        },
        taxCredits: values.taxCredits || 0
      };
      
      console.log('[AssignmentForm] Assignment data prepared for save:', assignmentData);
      
      let result;
      if (assignment?.id) {
        // Update existing assignment using centralized CRUD
        console.log('[AssignmentForm] Updating existing assignment with ID:', assignment.id);
        result = await updateAssignment(assignment.id, assignmentData);
      } else {
        // Create new assignment using centralized CRUD
        console.log('[AssignmentForm] Creating new assignment');
        result = await createAssignment(assignmentData);
      }

      if (result) {
        console.log('[AssignmentForm] Assignment saved successfully via centralized CRUD');
        onSuccess();
        onClose();
      } else {
        console.error('[AssignmentForm] Failed to save assignment via centralized CRUD');
        toast.error('Failed to save ownership link. Please try again.');
      }
    } catch (error: any) {
      console.error('[AssignmentForm] Error saving assignment:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(`Failed to save ownership link: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <PropertySection control={form.control} disabled={!!assignment} properties={properties} />
        
        <OwnerSection control={form.control} disabled={!!assignment} owners={owners} />
        
        <OwnershipSection control={form.control} />
        
        <ResidencySection 
          control={form.control} 
          residentAtProperty={residentAtProperty} 
        />
        
        <TaxCreditsSection control={form.control} />
        
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : assignment ? 'Update Ownership Link' : 'Add Ownership Link'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AssignmentForm;
