
import { Owner } from '@/types/form';

export const useOwnerSpecialFields = (setCurrentOwner: React.Dispatch<React.SetStateAction<Owner>>) => {
  const handleDateChange = (date: Date | undefined) => {
    setCurrentOwner(prev => ({ ...prev, dateOfBirth: date || null }));
  };

  const handleResidencyStatusChange = (value: string) => {
    let isResident: boolean | null = null;
    
    switch(value) {
      case 'yes':
        isResident = true;
        break;
      case 'no':
        isResident = false;
        break;
      case 'not-sure':
        isResident = null;
        break;
      default:
        isResident = null;
    }
    
    setCurrentOwner(prev => ({ 
      ...prev, 
      isResidentInItaly: isResident,
      // Initialize empty residence details if selecting 'yes'
      italianResidenceDetails: isResident === true ? {
        street: '',
        city: '',
        zip: ''
      } : undefined
    }));
  };

  const handleResidencyDetailChange = (field: string, value: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      italianResidenceDetails: {
        ...(prev.italianResidenceDetails || {}),
        [field]: value
      }
    }));
  };

  const handleCountryChange = (field: string, value: string) => {
    if (field === 'countryOfBirth') {
      setCurrentOwner(prev => ({ ...prev, countryOfBirth: value }));
    } else if (field === 'citizenship') {
      setCurrentOwner(prev => ({ ...prev, citizenship: value }));
    } else if (field === 'address.country') {
      setCurrentOwner(prev => ({
        ...prev,
        address: {
          ...prev.address,
          country: value
        }
      }));
    }
  };

  return {
    handleDateChange,
    handleResidencyStatusChange,
    handleResidencyDetailChange,
    handleCountryChange
  };
};
