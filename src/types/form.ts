// Owner types
export type MaritalStatus = 'UNMARRIED' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

export interface Address {
  street: string;
  city: string;
  zip: string;
  country: string;
}

// Simplified ItalianResidenceDetails interface without address fields
export interface ItalianResidenceDetails {
  // All address fields have been removed
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  countryOfBirth: string;
  citizenship: string;
  address: Address;
  italianTaxCode: string;
  maritalStatus: MaritalStatus;
  isResidentInItaly: boolean;
  italianResidenceDetails?: ItalianResidenceDetails;
}

// Property document type
export interface PropertyDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  url?: string;
}

// Property types
export type ActivityType = 'purchased' | 'sold' | 'both' | 'owned_all_year';
export type PropertyType = 'RESIDENTIAL' | 'B&B' | 'COMMERCIAL' | 'LAND' | 'OTHER';
export type OccupancyStatus = 'LONG_TERM_RENT' | 'SHORT_TERM_RENT' | 'PERSONAL_USE';

// New type for occupancy data with months
export interface OccupancyAllocation {
  status: OccupancyStatus;
  months: number;
}

export interface PropertyAddress {
  comune: string;
  province: string;
  street: string;
  zip: string;
}

export interface Property {
  id: string;
  label: string;
  address: PropertyAddress;
  activity2024: ActivityType;
  purchaseDate?: Date | null;
  purchasePrice?: number;
  saleDate?: Date | null;
  salePrice?: number;
  propertyType: PropertyType;
  remodeling: boolean;
  occupancyStatuses: OccupancyAllocation[]; // Changed to include months per status
  rentalIncome?: number; // Added rental income field
  documents?: PropertyDocument[]; // Documents related to the property
  useDocumentRetrievalService?: boolean; // Option to use the document retrieval service
}

// Owner-Property assignments
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface OwnerPropertyAssignment {
  propertyId: string;
  ownerId: string;
  ownershipPercentage: number;
  residentAtProperty: boolean;
  residentDateRange?: DateRange;
  taxCredits?: number;
}

// Form state
export interface FormState {
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
  currentStep: number;
}

export interface FormContextType {
  state: FormState;
  addOwner: (owner: Owner) => void;
  updateOwner: (index: number, owner: Owner) => void;
  removeOwner: (index: number) => void;
  addProperty: (property: Property) => void;
  updateProperty: (index: number, property: Property) => void;
  removeProperty: (index: number) => void;
  addAssignment: (assignment: OwnerPropertyAssignment) => void;
  updateAssignment: (index: number, assignment: OwnerPropertyAssignment) => void;
  removeAssignment: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}
