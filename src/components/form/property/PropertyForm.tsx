
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Property, OccupancyStatus, OccupancyAllocation, PropertyType, ActivityType } from '@/types/form';
import { RadioGroup } from '@/components/ui/radio-group';
import { CardRadioGroupItem } from '@/components/ui/radio-group';
import FormNavigation from '@/components/form/FormNavigation';
import { PROVINCES } from './propertyUtils';
import PropertyAddressSection from './PropertyAddressSection';
import PropertyActivitySection from './PropertyActivitySection';
import PropertyOccupancySection from './PropertyOccupancySection';
import PropertyRentalIncomeSection from './PropertyRentalIncomeSection';
import { handleActivityChange, validatePropertySubmission } from './propertyUtils';
import { toast } from 'sonner';

interface PropertyFormProps {
  property: Property;
  editingIndex: number | null;
  onSubmit: (property: Property, occupancyMonths: Record<OccupancyStatus, number>) => void;
  onCancel: () => void;
  hideCancel?: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ 
  property, 
  editingIndex, 
  onSubmit, 
  onCancel,
  hideCancel = false
}) => {
  const [currentProperty, setCurrentProperty] = useState<Property>(property);
  const [activeStatuses, setActiveStatuses] = useState<Set<OccupancyStatus>>(new Set(['LONG_TERM_RENT']));
  const [occupancyMonths, setOccupancyMonths] = useState<Record<OccupancyStatus, number>>({
    PERSONAL_USE: 0,
    LONG_TERM_RENT: 12,
    SHORT_TERM_RENT: 0,
  });
  const [availableMonths, setAvailableMonths] = useState<Record<OccupancyStatus, number[]>>({
    PERSONAL_USE: [],
    LONG_TERM_RENT: [],
    SHORT_TERM_RENT: [],
  });

  useEffect(() => {
    const totalMonthsUsed = Object.values(occupancyMonths).reduce((sum, months) => sum + months, 0);
    const remainingMonths = 12 - totalMonthsUsed;
    
    const newAvailableMonths: Record<OccupancyStatus, number[]> = {
      PERSONAL_USE: [],
      LONG_TERM_RENT: [],
      SHORT_TERM_RENT: [],
    };
    
    Object.keys(newAvailableMonths).forEach((status) => {
      const statusKey = status as OccupancyStatus;
      const currentValue = occupancyMonths[statusKey];
      const maxAvailable = remainingMonths + currentValue;
      
      if (maxAvailable > 0) {
        newAvailableMonths[statusKey] = Array.from(
          { length: maxAvailable }, 
          (_, i) => i + 1
        );
      } else {
        newAvailableMonths[statusKey] = [];
      }
    });
    
    setAvailableMonths(newAvailableMonths);
  }, [occupancyMonths]);

  useEffect(() => {
    const newOccupancyStatuses: OccupancyAllocation[] = [];
    
    (Object.entries(occupancyMonths) as [OccupancyStatus, number][]).forEach(([status, months]) => {
      if (months > 0) {
        newOccupancyStatuses.push({ status, months });
      }
    });
    
    if (newOccupancyStatuses.length > 0) {
      setCurrentProperty(prev => ({
        ...prev,
        occupancyStatuses: newOccupancyStatuses
      }));
    }
  }, [occupancyMonths]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      
      if (parentKey === 'address') {
        setCurrentProperty(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [childKey]: value
          }
        }));
      }
    } else {
      setCurrentProperty(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes('.')) {
      setCurrentProperty(prev => {
        if (name === 'address.province') {
          return {
            ...prev,
            address: {
              ...prev.address,
              province: value
            }
          };
        }
        return prev;
      });
    } else {
      setCurrentProperty(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleActivityTypeChange = (value: ActivityType) => {
    setCurrentProperty(prev => handleActivityChange(prev, value));
  };

  const handlePurchaseDateChange = (date: Date | undefined) => {
    setCurrentProperty(prev => ({ ...prev, purchaseDate: date || null }));
  };

  const handleSaleDateChange = (date: Date | undefined) => {
    setCurrentProperty(prev => ({ ...prev, saleDate: date || null }));
  };

  const handleRemodelingChange = (checked: boolean) => {
    setCurrentProperty(prev => ({ ...prev, remodeling: checked }));
  };

  const handleOccupancyStatusChange = (status: OccupancyStatus) => {
    if (activeStatuses.has(status) && occupancyMonths[status] === 0) {
      setActiveStatuses(prev => {
        const newStatuses = new Set(prev);
        newStatuses.delete(status);
        return newStatuses;
      });
      
      return;
    }
    
    setActiveStatuses(prev => {
      const newStatuses = new Set(prev);
      newStatuses.add(status);
      return newStatuses;
    });
  };

  const handleOccupancyMonthsChange = (status: OccupancyStatus, months: number) => {
    setOccupancyMonths(prev => ({
      ...prev,
      [status]: months
    }));
    
    if (months > 0) {
      setActiveStatuses(prev => {
        const newStatuses = new Set(prev);
        newStatuses.add(status);
        return newStatuses;
      });
    }
  };

  const handleRemoveOccupancyStatus = (status: OccupancyStatus) => {
    setOccupancyMonths(prev => ({
      ...prev,
      [status]: 0
    }));
    
    setActiveStatuses(prev => {
      const newStatuses = new Set(prev);
      newStatuses.delete(status);
      return newStatuses;
    });
  };

  const handleSubmit = () => {
    const totalMonths = Object.values(occupancyMonths).reduce((sum, val) => sum + val, 0);
    const validationError = validatePropertySubmission(currentProperty, totalMonths);
    
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const activeOccupancyStatuses: OccupancyAllocation[] = Object.entries(occupancyMonths)
      .filter(([_, months]) => months > 0)
      .map(([status, months]) => ({ 
        status: status as OccupancyStatus, 
        months 
      }));

    const finalProperty = {
      ...currentProperty,
      occupancyStatuses: activeOccupancyStatuses
    };

    onSubmit(finalProperty, occupancyMonths);
  };

  const shouldShowRentalIncome = () => {
    return currentProperty.occupancyStatuses.some(
      allocation => allocation.status === 'LONG_TERM_RENT' || allocation.status === 'SHORT_TERM_RENT'
    ) || activeStatuses.has('LONG_TERM_RENT') || activeStatuses.has('SHORT_TERM_RENT') ||
    occupancyMonths.LONG_TERM_RENT > 0 || occupancyMonths.SHORT_TERM_RENT > 0;
  };

  const calculateTotalMonths = () => {
    return Object.values(occupancyMonths).reduce((sum, months) => sum + months, 0);
  };

  const totalMonthsAllocated = calculateTotalMonths();

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">
        {editingIndex !== null ? 'Edit Property' : 'Add New Property'}
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="label">Property Name*</Label>
          <Input 
            id="label" 
            name="label" 
            placeholder="e.g. Vacation Home in Venice" 
            value={currentProperty.label || ''} 
            onChange={handleInputChange} 
            className="mt-1"
            required
          />
        </div>
      </div>
      
      <PropertyAddressSection 
        address={currentProperty.address}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        provinces={PROVINCES}
      />
      
      <div className="mt-6">
        <Label htmlFor="propertyType">Property Type*</Label>
        <Select 
          value={currentProperty.propertyType} 
          onValueChange={(value) => handleSelectChange('propertyType', value as PropertyType)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RESIDENTIAL">Residential</SelectItem>
            <SelectItem value="B&B">B&B</SelectItem>
            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
            <SelectItem value="LAND">Land</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <PropertyActivitySection 
        activity={currentProperty.activity2024}
        onActivityChange={handleActivityTypeChange}
        purchaseDate={currentProperty.purchaseDate}
        purchasePrice={currentProperty.purchasePrice}
        saleDate={currentProperty.saleDate}
        salePrice={currentProperty.salePrice}
        onPurchaseDateChange={handlePurchaseDateChange}
        onSaleDateChange={handleSaleDateChange}
        onPriceChange={(name, value) => {
          const numValue = value === '' ? undefined : Number(value);
          setCurrentProperty(prev => ({ ...prev, [name]: numValue }));
        }}
      />
      
      <div className="mt-6">
        <div className="flex items-center space-x-2">
          <Switch 
            id="remodeling" 
            checked={currentProperty.remodeling}
            onCheckedChange={handleRemodelingChange}
          />
          <Label htmlFor="remodeling">Remodeling or improvements done for which a building permit was filed in the past 10 years</Label>
        </div>
      </div>
      
      <PropertyOccupancySection 
        occupancyMonths={occupancyMonths}
        activeStatuses={activeStatuses}
        availableMonths={availableMonths}
        totalMonthsAllocated={totalMonthsAllocated}
        onOccupancyStatusChange={handleOccupancyStatusChange}
        onOccupancyMonthsChange={handleOccupancyMonthsChange}
        onRemoveOccupancyStatus={handleRemoveOccupancyStatus}
        currentProperty={currentProperty}
      />
      
      {shouldShowRentalIncome() && (
        <PropertyRentalIncomeSection 
          rentalIncome={currentProperty.rentalIncome}
          onInputChange={handleInputChange}
        />
      )}
      
      <FormNavigation 
        isFormMode={true} 
        onCancel={onCancel} 
        onSubmit={handleSubmit} 
        cancelText="Cancel" 
        submitButtonText={editingIndex !== null ? "Update Property" : "Add Property"}
        hideCancel={hideCancel}
      />
    </div>
  );
};

export default PropertyForm;
