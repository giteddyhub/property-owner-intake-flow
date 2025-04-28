
import React from 'react';
import { Property, OccupancyStatus } from '@/types/form';
import FormNavigation from '@/components/form/FormNavigation';
import { validatePropertySubmission } from './PropertyFormValidation';
import { toast } from 'sonner';
import { PropertyFormProvider, usePropertyForm } from './context/PropertyFormContext';
import PropertyFormHeader from './PropertyFormHeader';
import PropertyAddressSection from './PropertyAddressSection';
import PropertyTypeSection from './PropertyTypeSection';
import PropertyActivitySection from './PropertyActivitySection';
import PropertyRemodelingSection from './PropertyRemodelingSection';
import PropertyOccupancySection from './PropertyOccupancySection';
import PropertyRentalIncomeSection from './PropertyRentalIncomeSection';
import PropertyDocumentsSection from './PropertyDocumentsSection';

interface PropertyFormProps {
  property: Property;
  editingIndex: number | null;
  onSubmit: (property: Property, occupancyMonths: Record<OccupancyStatus, number>) => void;
  onCancel: () => void;
  hideCancel?: boolean;
  standalone?: boolean; // Added for standalone mode
}

const PropertyFormContent: React.FC<PropertyFormProps> = ({ 
  editingIndex, 
  onSubmit, 
  onCancel,
  hideCancel = false,
  standalone = false 
}) => {
  const { 
    currentProperty, 
    occupancyMonths, 
    totalMonthsAllocated,
    shouldShowRentalIncome 
  } = usePropertyForm();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    const validationError = validatePropertySubmission(currentProperty, totalMonthsAllocated);
    
    if (validationError) {
      toast.error(validationError);
      return;
    }

    scrollToTop();
    onSubmit(currentProperty, occupancyMonths);
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <PropertyFormHeader editingIndex={editingIndex} />
      <PropertyAddressSection />
      <PropertyTypeSection />
      <PropertyActivitySection />
      <PropertyRemodelingSection />
      <PropertyOccupancySection />
      
      {shouldShowRentalIncome && <PropertyRentalIncomeSection />}
      
      <PropertyDocumentsSection />
      
      <FormNavigation 
        isFormMode={true} 
        onCancel={onCancel} 
        onSubmit={handleSubmit} 
        cancelText="Cancel" 
        submitButtonText={editingIndex !== null ? "Update Property" : "Add Property"}
        hideCancel={hideCancel}
        standalone={standalone}
      />
    </div>
  );
};

// Main component with provider
const PropertyForm: React.FC<PropertyFormProps> = (props) => {
  return (
    <PropertyFormProvider property={props.property}>
      <PropertyFormContent {...props} />
    </PropertyFormProvider>
  );
};

export default PropertyForm;
