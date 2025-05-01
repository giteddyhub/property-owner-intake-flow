
import { format, parseISO, isBefore } from 'date-fns';

// Early bird pricing ends on May 30, 2025
const EARLY_BIRD_END_DATE = '2025-05-30T23:59:59Z';

export type PricingTier = 'earlyBird' | 'regular';

export interface PriceBreakdown {
  basePrice: number;
  additionalOwnersPrice: number;
  additionalPropertiesPrice: number;
  documentRetrievalFee: number | null;
  totalPrice: number;
  tier: PricingTier;
  currency: 'EUR';
}

/**
 * Calculate pricing based on the number of owners, properties, and whether document retrieval is needed
 */
export const calculatePricing = (
  ownersCount: number,
  propertiesCount: number,
  hasDocumentRetrieval: boolean = false,
): PriceBreakdown => {
  // Determine if early bird pricing applies
  const now = new Date();
  const earlyBirdEndDate = parseISO(EARLY_BIRD_END_DATE);
  const isEarlyBird = isBefore(now, earlyBirdEndDate);
  const tier: PricingTier = isEarlyBird ? 'earlyBird' : 'regular';
  
  // Set base pricing constants based on tier - updated to match pricing table
  const baseOwnerPrice = tier === 'earlyBird' ? 295 : 400; // Base price for a single owner filing
  
  // Additional owner price (per owner after the first)
  // From pricing table: €147.50 for second owner, €88.50 for 3+ owners in early bird
  // €200 for second owner, €120 for 3+ owners in regular pricing
  const secondOwnerPrice = tier === 'earlyBird' ? 147.50 : 200;
  const thirdPlusOwnerPrice = tier === 'earlyBird' ? 88.50 : 120;
  
  // Additional property price (per property after the first)
  // From pricing table: €80 for second property, €60 for 3+ properties in early bird
  // €120 for second property, €90 for 3+ properties in regular pricing
  const secondPropertyPrice = tier === 'earlyBird' ? 80 : 120;
  const thirdPlusPropertyPrice = tier === 'earlyBird' ? 60 : 90;
  
  const documentRetrievalFee = hasDocumentRetrieval ? 28 : 0;
  
  // Calculate additional owners cost (first owner is included in base price)
  let additionalOwnersPrice = 0;
  if (ownersCount > 1) {
    // Add the second owner at the second owner rate
    additionalOwnersPrice += secondOwnerPrice;
    
    // Add any owners beyond the second at the third+ owner rate
    if (ownersCount > 2) {
      additionalOwnersPrice += (ownersCount - 2) * thirdPlusOwnerPrice;
    }
  }
  
  // Calculate additional properties cost (first property is included in base price)
  let additionalPropertiesPrice = 0;
  if (propertiesCount > 1) {
    // Add the second property at the second property rate
    additionalPropertiesPrice += secondPropertyPrice;
    
    // Add any properties beyond the second at the third+ property rate
    if (propertiesCount > 2) {
      additionalPropertiesPrice += (propertiesCount - 2) * thirdPlusPropertyPrice;
    }
  }
  
  // Calculate total price
  const totalPrice = baseOwnerPrice + additionalOwnersPrice + additionalPropertiesPrice + documentRetrievalFee;
  
  return {
    basePrice: baseOwnerPrice,
    additionalOwnersPrice,
    additionalPropertiesPrice,
    documentRetrievalFee: hasDocumentRetrieval ? documentRetrievalFee : null,
    totalPrice,
    tier,
    currency: 'EUR'
  };
};

/**
 * Format a price for display
 */
export const formatPrice = (price: number, currency: 'EUR' = 'EUR'): string => {
  return `€${price}`;
};

/**
 * Get early bird end date formatted for display
 */
export const getEarlyBirdEndDateFormatted = (): string => {
  return format(parseISO(EARLY_BIRD_END_DATE), 'MMMM d, yyyy');
};

/**
 * Check if early bird pricing is still active
 */
export const isEarlyBirdActive = (): boolean => {
  const now = new Date();
  const earlyBirdEndDate = parseISO(EARLY_BIRD_END_DATE);
  return isBefore(now, earlyBirdEndDate);
};
