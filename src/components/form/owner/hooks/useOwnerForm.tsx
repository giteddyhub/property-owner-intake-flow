
import { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { Owner, ItalianResidenceDetails } from '@/types/form';
import { createEmptyOwner } from '../utils';
import { toast } from 'sonner';

export const useOwnerForm = () => {
  const { state, addOwner, updateOwner, removeOwner } = useFormContext();
  const { owners } = state;
  
  const [currentOwner, setCurrentOwner] = useState<Owner>(createEmptyOwner());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(owners.length === 0);

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
      italianResidenceDetails: isResident === false 
        ? (prev.italianResidenceDetails || { 
            comuneName: '', 
            street: '',
            city: '',
            zip: '',
            spentOver182Days: undefined
          })
        : undefined
    }));
  };

  const handleResidencyDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentOwner(prev => ({
      ...prev,
      italianResidenceDetails: {
        ...(prev.italianResidenceDetails || { 
          comuneName: '', 
          street: '',
          city: '',
          zip: '',
          spentOver182Days: undefined
        }),
        [name]: value
      }
    }));
  };

  const handleDaysInItalyChange = (value: string) => {
    const spentOver182Days = value === 'over182';
    setCurrentOwner(prev => ({
      ...prev,
      italianResidenceDetails: {
        ...(prev.italianResidenceDetails || {
          comuneName: '',
          street: '',
          city: '',
          zip: '',
        }),
        spentOver182Days
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    owners,
    currentOwner,
    editingIndex,
    showForm,
    setShowForm,
    setCurrentOwner,
    setEditingIndex,
    handleInputChange,
    handleOwnerChange,
    handleSelectChange,
    handleDateChange,
    handleResidencyStatusChange,
    handleResidencyDetailChange,
    handleDaysInItalyChange,
    handleCountryChange,
    scrollToTop,
    addOwner,
    updateOwner,
    removeOwner
  };
};
