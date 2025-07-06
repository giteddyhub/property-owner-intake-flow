
import React from 'react';
import { Owner } from '@/types/form';
import OwnerBasicInfoSection from './OwnerBasicInfoSection';
import OwnerAddressSection from './OwnerAddressSection';
import OwnerItalianResidenceSection from './OwnerItalianResidenceSection';
import FormHeader from './form/FormHeader';
import FormActions from './form/FormActions';
import { useOwnerFormActions } from './hooks/useOwnerForm.actions';

interface OwnerFormProps {
  owner: Owner;
  editingIndex: number | null;
  onSubmit: () => void;
  onCancel: () => void;
  onOwnerChange: (field: string, value: any) => void;
  onCountryChange: (field: string, value: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResidencyStatusChange: (value: string) => void;
  onResidencyDetailChange?: (field: string, value: string) => void;
  onStateChange?: (state: string) => void;
  showResidencyDialog?: boolean;
  setShowResidencyDialog?: (show: boolean) => void;
  hideCancel?: boolean;
}

const OwnerForm: React.FC<OwnerFormProps> = ({ 
  owner, 
  editingIndex, 
  onSubmit, 
  onCancel, 
  onOwnerChange, 
  onCountryChange, 
  onDateChange, 
  onInputChange, 
  onResidencyStatusChange, 
  onResidencyDetailChange,
  onStateChange,
  showResidencyDialog,
  setShowResidencyDialog,
  hideCancel = false
}) => {
  const {
    handleSubmit,
    formTitle,
    submitButtonText
  } = useOwnerFormActions({
    owner,
    editingIndex,
    onSubmit,
    onCancel,
    hideCancel
  });

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <FormHeader title={formTitle} />
      
      <OwnerBasicInfoSection 
        owner={owner} 
        onOwnerChange={onOwnerChange} 
        onCountryChange={onCountryChange}
        onDateChange={onDateChange}
      />
      
      <OwnerAddressSection 
        owner={owner} 
        onInputChange={onInputChange} 
        onCountryChange={onCountryChange}
        onStateChange={onStateChange}
      />
      
      <OwnerItalianResidenceSection 
        owner={owner} 
        onResidencyStatusChange={onResidencyStatusChange}
        onResidencyDetailChange={onResidencyDetailChange}
        forceShowDialog={showResidencyDialog}
        onDialogVisibilityChange={setShowResidencyDialog}
      />
      
      <FormActions 
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitText={submitButtonText}
        hideCancel={hideCancel}
      />
    </div>
  );
};

export default OwnerForm;
