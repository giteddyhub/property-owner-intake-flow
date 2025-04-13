
import React from 'react';
import { Owner, ItalianResidenceDetails } from '@/types/form';
import { Button } from '@/components/ui/button';
import OwnerBasicInfoSection from './OwnerBasicInfoSection';
import OwnerAddressSection from './OwnerAddressSection';
import OwnerItalianResidenceSection from './OwnerItalianResidenceSection';

interface OwnerFormProps {
  owner: Owner;
  editingIndex: number | null;
  onSubmit: () => void;
  onCancel: () => void;
  onOwnerChange: (field: string, value: any) => void;
  onCountryChange: (field: string, value: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchChange: (checked: boolean) => void;
  onResidencyDetailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDaysInItalyChange: (value: string) => void;
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
  onSwitchChange, 
  onResidencyDetailChange, 
  onDaysInItalyChange,
  hideCancel = false
}) => {
  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">
        {editingIndex !== null ? 'Edit Owner' : 'Add New Owner'}
      </h3>
      
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
      />
      
      <OwnerItalianResidenceSection 
        owner={owner} 
        onInputChange={onResidencyDetailChange} 
        onSwitchChange={onSwitchChange} 
        onDaysInItalyChange={onDaysInItalyChange} 
      />
      
      <div className="flex justify-end space-x-3 mt-6">
        {!hideCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="button" 
          onClick={onSubmit}
          className="bg-form-300 hover:bg-form-400 text-white"
        >
          {editingIndex !== null ? 'Update Owner' : 'Add Owner'}
        </Button>
      </div>
    </div>
  );
};

export default OwnerForm;
