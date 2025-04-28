
import { ResidentContact } from '@/hooks/useResidentContactForm';
import { toast } from 'sonner';

export const validateResidentContact = (contact: ResidentContact): boolean => {
  if (!contact.firstName.trim() || !contact.lastName.trim()) {
    toast.error("Please enter your first and last name");
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!contact.email.trim() || !emailRegex.test(contact.email)) {
    toast.error("Please enter a valid email address");
    return false;
  }
  
  return true;
};
