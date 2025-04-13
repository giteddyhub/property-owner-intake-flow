
import { Property, ActivityType } from '@/types/form';

/**
 * Validates the purchase information for a property
 * @param property The property to validate
 * @returns Error message or null if valid
 */
export const validatePurchaseInformation = (property: Property): string | null => {
  if (property.activity2024 === 'purchased' || property.activity2024 === 'both') {
    if (!property.purchaseDate) {
      return 'Please specify the purchase date';
    }
    
    if (property.purchasePrice === undefined || property.purchasePrice <= 0) {
      return 'Please specify a valid purchase price';
    }
  }
  
  return null;
};

/**
 * Validates the sale information for a property
 * @param property The property to validate
 * @returns Error message or null if valid
 */
export const validateSaleInformation = (property: Property): string | null => {
  if (property.activity2024 === 'sold' || property.activity2024 === 'both') {
    if (!property.saleDate) {
      return 'Please specify the sale date';
    }
    
    if (property.salePrice === undefined || property.salePrice <= 0) {
      return 'Please specify a valid sale price';
    }
    
    // Optional: Add date comparison validation for "both" activity
    if (property.activity2024 === 'both' && property.purchaseDate && property.saleDate) {
      if (property.purchaseDate > property.saleDate) {
        return 'The purchase date cannot be after the sale date';
      }
    }
  }
  
  return null;
};
