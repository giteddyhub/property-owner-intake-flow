
import { Property } from '@/types/form';

/**
 * Validates the property name/label
 * @param property The property to validate
 * @returns Error message or null if valid
 */
export const validatePropertyLabel = (property: Property): string | null => {
  if (!property.label || property.label.trim() === '') {
    return 'Please provide a property name';
  }
  
  return null;
};
