import React, { useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { toast } from 'sonner';
import { Owner, ItalianResidenceDetails } from '@/types/form';
import FormNavigation from '@/components/form/FormNavigation';
import { createEmptyOwner } from '../owner/utils';
import OwnerList from '../owner/OwnerList';
import OwnerForm from '../owner/OwnerForm';
import EmptyOwnerPrompt from '../owner/EmptyOwnerPrompt';

const OwnerStep: React.FC = () => {
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

  const handleSwitchChange = (checked: boolean) => {
    setCurrentOwner(prev => ({ 
      ...prev, 
      isResidentInItaly: checked,
      italianResidenceDetails: checked 
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

  const validateOwner = () => {
    if (!currentOwner.firstName.trim() || !currentOwner.lastName.trim()) {
      toast.error('Please enter first and last name');
      return false;
    }
    
    if (!currentOwner.dateOfBirth) {
      toast.error('Please enter date of birth');
      return false;
    }
    
    if (!currentOwner.countryOfBirth) {
      toast.error('Please select country of birth');
      return false;
    }
    
    if (!currentOwner.citizenship) {
      toast.error('Please select citizenship');
      return false;
    }
    
    if (!currentOwner.address.street || !currentOwner.address.city || 
        !currentOwner.address.zip || !currentOwner.address.country) {
      toast.error('Please complete all address fields');
      return false;
    }

    if (!currentOwner.italianTaxCode) {
      toast.error('Please enter Italian Tax Code');
      return false;
    }
    
    if (currentOwner.isResidentInItaly === null) {
      toast.error('Please specify if you are a registered resident in Italy');
      return false;
    }
    
    if (currentOwner.isResidentInItaly === false) {
      if (!currentOwner.italianResidenceDetails?.comuneName) {
        toast.error('Please enter comune name for Italian residence');
        return false;
      }
      
      if (!currentOwner.italianResidenceDetails?.street || 
          !currentOwner.italianResidenceDetails?.city || 
          !currentOwner.italianResidenceDetails?.zip) {
        toast.error('Please complete the Italian address fields');
        return false;
      }

      if (currentOwner.italianResidenceDetails?.spentOver182Days === undefined) {
        toast.error('Please specify if you spent more than 182 days in Italy in 2024');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateOwner()) return;

    if (editingIndex !== null) {
      updateOwner(editingIndex, currentOwner);
      toast.success('Owner updated successfully');
    } else {
      addOwner(currentOwner);
      toast.success('Owner added successfully');
    }
    
    setCurrentOwner(createEmptyOwner());
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleEdit = (index: number) => {
    setCurrentOwner({ ...owners[index] });
    setEditingIndex(index);
    setShowForm(true);
    scrollToTop();
  };

  const handleDelete = (index: number) => {
    removeOwner(index);
    toast.success('Owner removed successfully');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateAndProceed = () => {
    if (owners.length === 0) {
      toast.error('Please add at least one owner before proceeding');
      return false;
    }
    return true;
  };

  const handleAddOwner = () => {
    setCurrentOwner(createEmptyOwner());
    setEditingIndex(null);
    setShowForm(true);
    scrollToTop();
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentOwner(createEmptyOwner());
    setEditingIndex(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-form-400">Owner Information</h2>
      
      {owners.length > 0 && !showForm && (
        <OwnerList 
          owners={owners} 
          onAddOwner={handleAddOwner} 
          onEditOwner={handleEdit} 
          onDeleteOwner={handleDelete} 
        />
      )}
      
      {showForm && (
        <OwnerForm 
          owner={currentOwner}
          editingIndex={editingIndex}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onOwnerChange={handleOwnerChange}
          onCountryChange={handleCountryChange}
          onDateChange={handleDateChange}
          onInputChange={handleInputChange}
          onResidencyStatusChange={handleResidencyStatusChange}
          onResidencyDetailChange={handleResidencyDetailChange}
          onDaysInItalyChange={handleDaysInItalyChange}
          hideCancel={owners.length === 0 && editingIndex === null}
        />
      )}
      
      {!showForm && owners.length === 0 && (
        <EmptyOwnerPrompt onAddOwner={handleAddOwner} />
      )}
      
      <FormNavigation onNext={validateAndProceed} />
    </div>
  );
};

export default OwnerStep;
