
import React, { useState } from 'react';
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
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ 
  assignment, 
  properties, 
  owners, 
  onSuccess, 
  onClose 
}) => {
  const form = useForm<AssignmentFormValues>({
    defaultValues: {
      propertyId: assignment?.propertyId || '',
      ownerId: assignment?.ownerId || '',
      ownershipPercentage: assignment?.ownershipPercentage || 100,
      residentAtProperty: assignment?.residentAtProperty || false,
      residentFromDate: assignment?.residentDateRange?.from || null,
      residentToDate: assignment?.residentDateRange?.to || null,
      taxCredits: assignment?.taxCredits || 0
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const residentAtProperty = form.watch('residentAtProperty');
  
  const handleSubmit = async (values: AssignmentFormValues) => {
    setIsSubmitting(true);
    
    try {
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
        updated_at: new Date().toISOString()
      };
      
      if (assignment?.id) {
        // Update existing assignment
        const { error } = await supabase
          .from('owner_property_assignments')
          .update(assignmentData)
          .eq('id', assignment.id);
          
        if (error) throw error;
        toast.success('Assignment updated successfully');
      } else {
        // Check if this combination already exists
        const { data: existingAssignment } = await supabase
          .from('owner_property_assignments')
          .select('id')
          .eq('property_id', values.propertyId)
          .eq('owner_id', values.ownerId)
          .maybeSingle();
          
        if (existingAssignment) {
          toast.error('This owner is already assigned to this property');
          setIsSubmitting(false);
          return;
        }
        
        // Create new assignment
        const { error } = await supabase
          .from('owner_property_assignments')
          .insert(assignmentData);
          
        if (error) throw error;
        toast.success('Assignment added successfully');
      }

      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Failed to save assignment');
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
            {isSubmitting ? 'Saving...' : assignment ? 'Update Assignment' : 'Add Assignment'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AssignmentForm;
