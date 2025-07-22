
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Owner, Property, OwnerPropertyAssignment } from '@/components/dashboard/types';
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
    console.log('[AssignmentForm] User ID:', userId);
    console.log('[AssignmentForm] Assignment being edited:', assignment);
    
    try {
      // Validate required fields
      if (!values.propertyId || !values.ownerId) {
        throw new Error('Property and Owner are required');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const assignmentData = {
        property_id: values.propertyId,
        owner_id: values.ownerId,
        ownership_percentage: values.ownershipPercentage,
        resident_at_property: values.residentAtProperty,
        resident_from_date: values.residentAtProperty && values.residentFromDate 
          ? values.residentFromDate.toISOString().split('T')[0]
          : null,
        resident_to_date: values.residentAtProperty && values.residentToDate
          ? values.residentToDate.toISOString().split('T')[0]
          : null,
        tax_credits: values.taxCredits || null,
        user_id: userId,
        updated_at: new Date().toISOString()
      };
      
      console.log('[AssignmentForm] Assignment data prepared for save:', assignmentData);
      
      if (assignment?.id) {
        // Update existing ownership link
        console.log('[AssignmentForm] Updating existing assignment with ID:', assignment.id);
        const { data, error } = await supabase
          .from('owner_property_assignments')
          .update(assignmentData)
          .eq('id', assignment.id)
          .select()
          .single();
          
        if (error) {
          console.error('[AssignmentForm] Update error:', error);
          throw error;
        }
        
        console.log('[AssignmentForm] Assignment updated successfully:', data);
        toast.success('Ownership link updated successfully');
      } else {
        // Check if this combination already exists
        console.log('[AssignmentForm] Checking for existing assignment combination');
        const { data: existingAssignment, error: checkError } = await supabase
          .from('owner_property_assignments')
          .select('id')
          .eq('property_id', values.propertyId)
          .eq('owner_id', values.ownerId)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (checkError) {
          console.error('[AssignmentForm] Error checking existing assignment:', checkError);
          throw checkError;
        }
          
        if (existingAssignment) {
          toast.error('This owner is already linked to this property');
          setIsSubmitting(false);
          return;
        }
        
        // Create new ownership link
        console.log('[AssignmentForm] Creating new assignment');
        const { data, error } = await supabase
          .from('owner_property_assignments')
          .insert({
            ...assignmentData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) {
          console.error('[AssignmentForm] Insert error:', error);
          throw error;
        }
        
        console.log('[AssignmentForm] Assignment created successfully:', data);
        toast.success('Ownership link added successfully');
      }

      // Close drawer and trigger refresh
      onClose();
      onSuccess();
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
