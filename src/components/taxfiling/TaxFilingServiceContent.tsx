
import React from 'react';
import { Button } from '@/components/ui/button';
import SuccessHeader from '@/components/success/SuccessHeader';
import PremiumServiceCard from '@/components/success/PremiumServiceCard';
import LawFirmPartnership from '@/components/success/LawFirmPartnership';
import ConsultationBooking from '@/components/success/ConsultationBooking';
import Footer from '@/components/layout/Footer';

interface TaxFilingServiceContentProps {
  ownersCount: number;
  propertiesCount: number;
  hasDocumentRetrieval: boolean;
  checkoutLoading: boolean;
  onCheckout: () => Promise<void>;
  onToggleDocumentRetrieval: () => void;
  onReturnToDashboard: () => void;
}

const TaxFilingServiceContent: React.FC<TaxFilingServiceContentProps> = ({
  ownersCount,
  propertiesCount,
  hasDocumentRetrieval,
  checkoutLoading,
  onCheckout,
  onToggleDocumentRetrieval,
  onReturnToDashboard
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <SuccessHeader />
          
          <PremiumServiceCard 
            ownersCount={ownersCount}
            propertiesCount={propertiesCount}
            hasDocumentRetrieval={hasDocumentRetrieval}
            loading={checkoutLoading}
            onCheckout={onCheckout}
            onToggleDocumentRetrieval={onToggleDocumentRetrieval}
          />
          
          <LawFirmPartnership />
          
          <ConsultationBooking />
          
          <div className="text-center mt-8">
            <Button variant="outline" onClick={onReturnToDashboard}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TaxFilingServiceContent;
