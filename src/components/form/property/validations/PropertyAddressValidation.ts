
import { PropertyAddress } from '@/types/form';

/**
 * Validates the property address fields
 * @param address The property address to validate
 * @returns Error message or null if valid
 */
export const validatePropertyAddress = (address: PropertyAddress): string | null => {
  if (!address.comune) {
    return 'Please enter the Comune';
  }
  
  if (!address.province) {
    return 'Please select a Province';
  }
  
  if (!address.street) {
    return 'Please enter the Street Address';
  }
  
  if (!address.zip) {
    return 'Please enter the ZIP Code';
  }
  
  // Validate ZIP format if needed (add here)
  
  return null;
};
