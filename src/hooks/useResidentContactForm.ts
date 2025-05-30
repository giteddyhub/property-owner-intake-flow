import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { validateResidentContact } from '@/components/form/owner/validation/residentContactValidation';

export interface ResidentContact {
  firstName: string;
  lastName: string;
  email: string;
}

export const useResidentContactForm = () => {
  const [contact, setContact] = useState<ResidentContact>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact(prev => ({ ...prev, [name]: value }));
  };

  const saveResidentContact = async () => {
    if (!validateResidentContact(contact)) return;
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('resident_contacts')
        .insert({
          first_name: contact.firstName,
          last_name: contact.lastName,
          email: contact.email
        })
        .select();
      
      if (error) {
        console.error('Error saving resident contact:', error);
        toast.error('Error saving your information. Please try again.');
        return;
      }
      
      console.log('Resident contact saved successfully:', data);
      toast.success('Thank you! Your information has been saved.');
      setIsContactSubmitted(true);
      
    } catch (err) {
      console.error('Error in saveResidentContact:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    contact,
    isSubmitting,
    isContactSubmitted,
    handleContactChange,
    saveResidentContact
  };
};
