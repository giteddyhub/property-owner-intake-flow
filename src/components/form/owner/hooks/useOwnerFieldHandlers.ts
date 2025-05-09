
import { useState } from 'react';
import { Owner, ItalianResidenceDetails } from '@/types/form';

export const useOwnerFieldHandlers = (setCurrentOwner: React.Dispatch<React.SetStateAction<Owner>>) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCurrentOwner(prev => {
        if (parent === 'address') {
          return {
            ...prev,
            address: {
              ...prev.address,
              [child]: value
            }
          };
        } else if (parent === 'italianResidenceDetails' && prev.italianResidenceDetails) {
          return {
            ...prev,
            italianResidenceDetails: {
              ...prev.italianResidenceDetails,
              [child]: value
            }
          };
        } else if (parent === 'italianResidenceDetails') {
          return {
            ...prev,
            italianResidenceDetails: {
              comuneName: '',
              street: '',
              city: '',
              zip: '',
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setCurrentOwner(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOwnerChange = (field: string, value: any) => {
    setCurrentOwner(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCurrentOwner(prev => {
        if (parent === 'address') {
          return {
            ...prev,
            address: {
              ...prev.address,
              [child]: value
            }
          };
        } else if (parent === 'italianResidenceDetails' && prev.italianResidenceDetails) {
          return {
            ...prev,
            italianResidenceDetails: {
              ...prev.italianResidenceDetails,
              [child]: value
            }
          };
        } else if (parent === 'italianResidenceDetails') {
          return {
            ...prev,
            italianResidenceDetails: {
              comuneName: '',
              street: '',
              city: '',
              zip: '',
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setCurrentOwner(prev => ({ ...prev, [name]: value }));
    }
  };

  // New handler for US state field
  const handleStateChange = (state: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      address: {
        ...prev.address,
        state
      }
    }));
  };

  // New handler for special US state fields
  const handleSpecialStateChange = (field: string, value: string) => {
    setCurrentOwner(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    handleInputChange,
    handleOwnerChange,
    handleSelectChange,
    handleStateChange,
    handleSpecialStateChange
  };
};
