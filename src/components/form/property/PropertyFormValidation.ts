
import { Property } from '@/types/form';
import { validatePropertyLabel } from './validations/PropertyBasicValidation';
import { validatePropertyAddress } from './validations/PropertyAddressValidation';
import { validatePurchaseInformation, validateSaleInformation } from './validations/PropertyActivityValidation';
import { validateOccupancyMonths, validateRentalIncome } from './validations/PropertyOccupancyValidation';

/**
 * Main validation function that combines all property validation checks
 * @param property The property to validate
 * @param totalMonths Total months allocated across all occupancy statuses
 * @returns Error message or null if everything is valid
 */
export const validatePropertySubmission = (
  property: Property, 
  totalMonths: number
): string | null => {
  // Basic validation
  const labelError = validatePropertyLabel(property);
  if (labelError) return labelError;
  
  // Address validation
  const addressError = validatePropertyAddress(property.address);
  if (addressError) return addressError;
  
  // Activity validation
  const purchaseError = validatePurchaseInformation(property);
  if (purchaseError) return purchaseError;
  
  const saleError = validateSaleInformation(property);
  if (saleError) return saleError;
  
  // Occupancy validation
  const occupancyError = validateOccupancyMonths(totalMonths);
  if (occupancyError) return occupancyError;
  
  // Rental income validation
  const rentalError = validateRentalIncome(property);
  if (rentalError) return rentalError;
  
  return null;
};
