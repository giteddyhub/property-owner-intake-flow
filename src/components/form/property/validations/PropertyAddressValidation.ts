
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

/**
 * Validates an owner address including state field for US addresses
 * @param address The owner address to validate
 * @returns Error message or null if valid
 */
export const validateOwnerAddress = (address: { 
  street: string; 
  city: string; 
  zip: string; 
  country: string;
  state?: string;
}): string | null => {
  if (!address.street) {
    return 'Please enter the Street Address';
  }
  
  if (!address.city) {
    return 'Please enter the City';
  }
  
  if (!address.zip) {
    return 'Please enter the ZIP/Postal Code';
  }
  
  if (!address.country) {
    return 'Please select a Country';
  }
  
  // Check for US state
  if (address.country === 'United States' && !address.state) {
    return 'Please select a State for US address';
  }
  
  return null;
};
