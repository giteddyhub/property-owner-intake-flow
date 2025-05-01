
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
  
  // Set base pricing constants based on tier
  const baseOwnerPrice = tier === 'earlyBird' ? 245 : 285; // Base price for the first owner
  const additionalOwnerPrice = tier === 'earlyBird' ? 60 : 70; // Price for each additional owner
  const additionalPropertyPrice = tier === 'earlyBird' ? 40 : 50; // Price for each additional property
  const documentRetrievalFee = hasDocumentRetrieval ? 28 : 0;
  
  // Calculate additional owners cost (first owner is included in base price)
  const additionalOwners = Math.max(0, ownersCount - 1);
  const additionalOwnersPrice = additionalOwners * additionalOwnerPrice;
  
  // Calculate additional properties cost (first property is included in base price)
  const additionalProperties = Math.max(0, propertiesCount - 1);
  const additionalPropertiesPrice = additionalProperties * additionalPropertyPrice;
  
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
