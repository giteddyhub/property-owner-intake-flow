
import { Owner } from '@/types/form';
import { toast } from 'sonner';

export const validateOwner = (owner: Owner): boolean => {
  if (!owner.firstName.trim() || !owner.lastName.trim()) {
    toast.error('Please enter first and last name');
    return false;
  }
  
  if (!owner.dateOfBirth) {
    toast.error('Please enter date of birth');
    return false;
  }
  
  if (!owner.countryOfBirth) {
    toast.error('Please select country of birth');
    return false;
  }
  
  if (!owner.citizenship) {
    toast.error('Please select citizenship');
    return false;
  }
  
  if (!owner.address.street || !owner.address.city || 
      !owner.address.zip || !owner.address.country) {
    toast.error('Please complete all address fields');
    return false;
  }

  if (!owner.italianTaxCode) {
    toast.error('Please enter Italian Tax Code');
    return false;
  }
  
  if (owner.isResidentInItaly === null) {
    toast.error('Please specify if you are a registered resident in Italy');
    return false;
  }
  
  if (owner.isResidentInItaly === true) {
    // For Italian residents, just verify the popup has been shown
    // They will be redirected to a different service
    // The address fields check has been removed since we no longer collect this information
    
    toast.error('Italian residents need to use our specialized service. Please select "No" or "Not sure"');
    return false;
  }
  
  return true;
};

export const validateHasOwners = (owners: Owner[]): boolean => {
  if (owners.length === 0) {
    toast.error('Please add at least one owner before proceeding');
    return false;
  }
  return true;
};
