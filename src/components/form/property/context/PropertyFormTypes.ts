
import { 
  Property, 
  OccupancyStatus,
  OccupancyAllocation,
  ActivityType
} from '@/types/form';

// PropertyForm specific context types
export interface PropertyFormState {
  currentProperty: Property;
  occupancyMonths: Record<OccupancyStatus, number>;
  activeStatuses: Set<OccupancyStatus>;
  availableMonths: Record<OccupancyStatus, number[]>;
  totalMonthsAllocated: number;
  shouldShowRentalIncome: boolean;
}

export interface PropertyFormContextType extends PropertyFormState {
  setCurrentProperty: React.Dispatch<React.SetStateAction<Property>>;
  setOccupancyMonths: React.Dispatch<React.SetStateAction<Record<OccupancyStatus, number>>>;
  setActiveStatuses: React.Dispatch<React.SetStateAction<Set<OccupancyStatus>>>;
  
  // Handler functions
  handleOccupancyStatusChange: (status: OccupancyStatus) => void;
  handleOccupancyMonthsChange: (status: OccupancyStatus, months: number) => void;
  handleRemoveOccupancyStatus: (status: OccupancyStatus) => void;
  handleActivityTypeChange: (value: ActivityType) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handlePurchaseDateChange: (date: Date | undefined) => void;
  handleSaleDateChange: (date: Date | undefined) => void;
  handleRemodelingChange: (checked: boolean) => void;
}
