
import { Owner } from '@/components/dashboard/types';
import { Dispatch, SetStateAction } from 'react';

export interface UseOwnerFieldHandlersProps {
  setCurrentOwner: Dispatch<SetStateAction<Owner>>;
}

export const useOwnerFieldHandlers = ({ setCurrentOwner }: UseOwnerFieldHandlersProps) => {
  const handleOwnerChange = (field: string, value: any) => {
    setCurrentOwner(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Fix for address fields handling
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (parent === 'address') {
        setCurrentOwner(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value
          }
        }));
      } else {
        handleOwnerChange(name, value);
      }
    } else {
      handleOwnerChange(name, value);
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setCurrentOwner(prev => ({
      ...prev,
      dateOfBirth: date || null
    }));
  };
  
  const handleCountryChange = (field: string, value: string) => {
    if (field === 'address.country') {
      setCurrentOwner(prev => ({
        ...prev,
        address: {
          ...prev.address,
          country: value
        }
      }));
    } else {
      setCurrentOwner(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  const handleResidencyStatusChange = (value: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      isResidentInItaly: value === 'true'
    }));
  };
  
  const handleResidencyDetailChange = (field: string, value: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      italianResidenceDetails: {
        ...prev.italianResidenceDetails,
        [field]: value
      }
    }));
  };
  
  // Handler for US state field in address
  const handleStateChange = (state: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      address: {
        ...prev.address,
        state
      }
    }));
  };

  // Handler for special US state fields (birth/citizenship)
  const handleSpecialStateChange = (field: string, value: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return {
    handleOwnerChange,
    handleInputChange,
    handleDateChange,
    handleCountryChange,
    handleResidencyStatusChange,
    handleResidencyDetailChange,
    handleStateChange,
    handleSpecialStateChange
  };
};
