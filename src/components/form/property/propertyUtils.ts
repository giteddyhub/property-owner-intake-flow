
import { v4 as uuidv4 } from 'uuid';
import { 
  ActivityType, 
  Property, 
  OccupancyStatus, 
  OccupancyAllocation,
  PropertyType
} from '@/types/form';

// Normalize legacy 'neither' value to 'owned_all_year'
export const normalizeActivityType = (activity: string | ActivityType): ActivityType => {
  if (activity === 'neither') {
    return 'owned_all_year';
  }
  return activity as ActivityType;
};

// Function to create an empty property with default values
export const createEmptyProperty = (): Property => {
  return {
    id: uuidv4(),
    label: '',
    address: {
      comune: '',
      province: '',
      street: '',
      zip: ''
    },
    activity2024: 'owned_all_year', 
    propertyType: 'RESIDENTIAL',
    remodeling: false,
    occupancyStatuses: [
      { status: 'PERSONAL_USE', months: 12 }
    ]
  };
};

// Function to handle activity type changes
export const handleActivityChange = (property: Property, newActivity: ActivityType): Property => {
  const updatedProperty = { ...property, activity2024: newActivity };
  
  // Reset certain fields based on activity type
  if (newActivity === 'owned_all_year') {
    updatedProperty.purchaseDate = null;
    updatedProperty.purchasePrice = undefined;
    updatedProperty.saleDate = null;
    updatedProperty.salePrice = undefined;
  } else if (newActivity === 'purchased') {
    updatedProperty.saleDate = null;
    updatedProperty.salePrice = undefined;
  } else if (newActivity === 'sold') {
    updatedProperty.purchaseDate = null;
    updatedProperty.purchasePrice = undefined;
  }
  
  return updatedProperty;
};

// Explanations for different activity types
export const activityExplanations = {
  purchased: "Property was purchased during 2024",
  sold: "Property was sold during 2024",
  both: "Property was both purchased and sold during 2024",
  neither: "Property was owned for the entire 2024 year"
};

// Explanations for different occupancy statuses
export const occupancyExplanations = {
  LONG_TERM_RENT: "Property rented with contracts of 1+ year",
  SHORT_TERM_RENT: "Property rented short-term (e.g., Airbnb)",
  PERSONAL_USE: "Used by owners or left vacant"
};

// List of Italian provinces for select dropdowns
export const PROVINCES = [
  "Agrigento", "Alessandria", "Ancona", "Aosta", "Arezzo", "Ascoli Piceno", "Asti", "Avellino", "Bari",
  "Barletta-Andria-Trani", "Belluno", "Benevento", "Bergamo", "Biella", "Bologna", "Bolzano", "Brescia",
  "Brindisi", "Cagliari", "Caltanissetta", "Campobasso", "Carbonia-Iglesias", "Caserta", "Catania",
  "Catanzaro", "Chieti", "Como", "Cosenza", "Cremona", "Crotone", "Cuneo", "Enna", "Fermo", "Ferrara",
  "Firenze", "Foggia", "Forlì-Cesena", "Frosinone", "Genova", "Gorizia", "Grosseto", "Imperia", "Isernia",
  "La Spezia", "L'Aquila", "Latina", "Lecce", "Lecco", "Livorno", "Lodi", "Lucca", "Macerata", "Mantova",
  "Massa-Carrara", "Matera", "Messina", "Milano", "Modena", "Monza e della Brianza", "Napoli", "Novara",
  "Nuoro", "Ogliastra", "Olbia-Tempio", "Oristano", "Padova", "Palermo", "Parma", "Pavia", "Perugia",
  "Pesaro e Urbino", "Pescara", "Piacenza", "Pisa", "Pistoia", "Pordenone", "Potenza", "Prato", "Ragusa",
  "Ravenna", "Reggio Calabria", "Reggio Emilia", "Rieti", "Rimini", "Roma", "Rovigo", "Salerno", "Medio Campidano",
  "Sassari", "Savona", "Siena", "Siracusa", "Sondrio", "Taranto", "Teramo", "Terni", "Torino", "Trapani",
  "Trento", "Treviso", "Trieste", "Udine", "Varese", "Venezia", "Verbano-Cusio-Ossola", "Vercelli",
  "Verona", "Vibo Valentia", "Vicenza", "Viterbo"
];

// Function to format occupancy statuses for display
export const formatOccupancyStatuses = (allocations: OccupancyAllocation[]): string => {
  if (!allocations || allocations.length === 0) {
    return 'Not specified';
  }
  
  if (allocations.length === 1) {
    return formatOccupancyStatus(allocations[0].status) + ` (${allocations[0].months} months)`;
  }
  
  return allocations
    .map(allocation => `${formatOccupancyStatus(allocation.status)} (${allocation.months} months)`)
    .join(', ');
};

// Function to format an individual occupancy status for display
export const formatOccupancyStatus = (status: OccupancyStatus): string => {
  switch (status) {
    case 'PERSONAL_USE':
      return 'Personal Use';
    case 'LONG_TERM_RENT':
      return 'Long-term Rental';
    case 'SHORT_TERM_RENT':
      return 'Short-term Rental';
    default:
      return status;
  }
};

// Function to validate a property before submission
export const validatePropertySubmission = (property: Property, totalMonths: number): string | null => {
  if (!property.label) {
    return 'Please provide a property name';
  }
  
  if (!property.address.comune || !property.address.province || !property.address.street || !property.address.zip) {
    return 'Please complete all address fields';
  }
  
  if (property.activity2024 === 'purchased' || property.activity2024 === 'both') {
    if (!property.purchaseDate) {
      return 'Please specify the purchase date';
    }
    if (property.purchasePrice === undefined || property.purchasePrice <= 0) {
      return 'Please specify a valid purchase price';
    }
  }
  
  if (property.activity2024 === 'sold' || property.activity2024 === 'both') {
    if (!property.saleDate) {
      return 'Please specify the sale date';
    }
    if (property.salePrice === undefined || property.salePrice <= 0) {
      return 'Please specify a valid sale price';
    }
  }
  
  if (totalMonths !== 12) {
    return 'The total months allocated must equal 12';
  }
  
  // Check if any rental status is selected and rental income is provided
  const hasRentalStatus = property.occupancyStatuses.some(
    allocation => allocation.status === 'LONG_TERM_RENT' || allocation.status === 'SHORT_TERM_RENT'
  );
  
  if (hasRentalStatus && (property.rentalIncome === undefined || property.rentalIncome <= 0)) {
    return 'Please provide the rental income for 2024';
  }
  
  return null;
};

// Function to get initial occupancy months based on existing property data
export const getInitialOccupancyMonths = (property: Property) => {
  const initialOccupancyMonths: Record<OccupancyStatus, number> = {
    PERSONAL_USE: 0,
    LONG_TERM_RENT: 0,
    SHORT_TERM_RENT: 0,
  };

  const newActiveStatuses = new Set<OccupancyStatus>();
  
  if (Array.isArray(property.occupancyStatuses)) {
    property.occupancyStatuses.forEach(allocation => {
      if (typeof allocation === 'object' && 'status' in allocation && 'months' in allocation) {
        initialOccupancyMonths[allocation.status] = allocation.months;
        newActiveStatuses.add(allocation.status);
      }
    });
  }
  
  return { initialOccupancyMonths, newActiveStatuses };
};
