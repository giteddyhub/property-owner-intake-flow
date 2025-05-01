
import React from 'react';
import { PriceBreakdown as PriceBreakdownType } from '@/utils/pricingCalculator';
import { formatPrice, getEarlyBirdEndDateFormatted, isEarlyBirdActive } from '@/utils/pricingCalculator';

type PriceBreakdownProps = {
  priceBreakdown: PriceBreakdownType;
  showDetailedBreakdown?: boolean;
};

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ 
  priceBreakdown, 
  showDetailedBreakdown = true 
}) => {
  const {
    basePrice,
    additionalOwnersPrice,
    additionalPropertiesPrice,
    documentRetrievalFee,
    totalPrice,
    tier,
    currency
  } = priceBreakdown;
  
  const earlyBirdActive = isEarlyBirdActive();
  const earlyBirdEndDate = getEarlyBirdEndDateFormatted();
  
  return (
    <div className="space-y-2">
      {showDetailedBreakdown ? (
        <>
          <div className="flex justify-between text-sm">
            <span>Base service fee</span>
            <span className="font-medium">{formatPrice(basePrice, currency)}</span>
          </div>
          
          {additionalOwnersPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span>Additional owners</span>
              <span className="font-medium">{formatPrice(additionalOwnersPrice, currency)}</span>
            </div>
          )}
          
          {additionalPropertiesPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span>Additional properties</span>
              <span className="font-medium">{formatPrice(additionalPropertiesPrice, currency)}</span>
            </div>
          )}
          
          {documentRetrievalFee && documentRetrievalFee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Document retrieval service</span>
              <span className="font-medium">{formatPrice(documentRetrievalFee, currency)}</span>
            </div>
          )}
          
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(totalPrice, currency)}</span>
          </div>
        </>
      ) : (
        <div className="flex items-baseline">
          <span className="text-xl font-bold">{formatPrice(totalPrice, currency)}</span>
          {tier === 'earlyBird' && (
            <>
              <span className="ml-2 text-sm text-gray-500 line-through">
                {formatPrice(totalPrice + 40, currency)}
              </span>
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded">
                Early Access
              </span>
            </>
          )}
        </div>
      )}
      
      {earlyBirdActive && (
        <div className="text-xs text-green-700">
          Early bird pricing valid until {earlyBirdEndDate}
        </div>
      )}
    </div>
  );
};

export default PriceBreakdown;
