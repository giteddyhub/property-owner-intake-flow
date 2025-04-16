
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
    // For Italian residents, we want to show the dialog
    // We don't return false immediately as we want the dialog to handle this case
    // We'll return false from the validateAndProceed function in useOwnerActions
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
  
  // Check if any owner is an Italian resident
  const hasItalianResident = owners.some(owner => owner.isResidentInItaly === true);
  
  if (hasItalianResident) {
    toast.error('One or more owners are Italian residents. Please change their status or use our specialized service.');
    return false;
  }
  
  return true;
};
