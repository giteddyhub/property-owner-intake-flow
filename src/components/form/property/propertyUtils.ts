
import { v4 as uuidv4 } from 'uuid';
import { 
  Property, 
  OccupancyStatus, 
  OccupancyAllocation,
  ActivityType 
} from '@/types/form';

export const PROVINCES = [
  "Agrigento (AG)", "Alessandria (AL)", "Ancona (AN)", "Aosta (AO)", "Arezzo (AR)", "Ascoli Piceno (AP)", "Asti (AT)", "Avellino (AV)", 
  "Bari (BA)", "Barletta-Andria-Trani (BT)", "Belluno (BL)", "Benevento (BN)", "Bergamo (BG)", "Biella (BI)", "Bologna (BO)", 
  "Bolzano (BZ)", "Brescia (BS)", "Brindisi (BR)", "Cagliari (CA)", "Caltanissetta (CL)", "Campobasso (CB)", "Carbonia-Iglesias (CI)", 
  "Caserta (CE)", "Catania (CT)", "Catanzaro (CZ)", "Chieti (CH)", "Como (CO)", "Cosenza (CS)", "Cremona (CR)", "Crotone (KR)", "Cuneo (CN)", 
  "Enna (EN)", "Fermo (FM)", "Ferrara (FE)", "Firenze (FI)", "Foggia (FG)", "Forlì-Cesena (FC)", "Frosinone (FR)", "Genova (GE)", "Gorizia (GO)", 
  "Grosseto (GR)", "Imperia (IM)", "Isernia (IS)", "La Spezia (SP)", "L'Aquila (AQ)", "Latina (LT)", "Lecce (LE)", "Lecco (LC)", "Livorno (LI)", 
  "Lodi (LO)", "Lucca (LU)", "Macerata (MC)", "Mantova (MN)", "Massa-Carrara (MS)", "Matera (MT)", "Messina (ME)", "Milano (MI)", "Modena (MO)", 
  "Monza e Brianza (MB)", "Napoli (NA)", "Novara (NO)", "Nuoro (NU)", "Ogliastra (OG)", "Olbia-Tempio (OT)", "Oristano (OR)", "Padova (PD)", 
  "Palermo (PA)", "Parma (PR)", "Pavia (PV)", "Perugia (PG)", "Pesaro e Urbino (PU)", "Pescara (PE)", "Piacenza (PC)", "Pisa (PI)", "Pistoia (PT)", 
  "Pordenone (PN)", "Potenza (PZ)", "Prato (PO)", "Ragusa (RG)", "Ravenna (RA)", "Reggio Calabria (RC)", "Reggio Emilia (RE)", "Rieti (RI)", 
  "Rimini (RN)", "Roma (RM)", "Rovigo (RO)", "Salerno (SA)", "Medio Campidano (VS)", "Sassari (SS)", "Savona (SV)", "Siena (SI)", "Siracusa (SR)", 
  "Sondrio (SO)", "Taranto (TA)", "Teramo (TE)", "Terni (TR)", "Torino (TO)", "Trapani (TP)", "Trento (TN)", "Treviso (TV)", "Trieste (TS)", 
  "Udine (UD)", "Varese (VA)", "Venezia (VE)", "Verbano-Cusio-Ossola (VB)", "Vercelli (VC)", "Verona (VR)", "Vibo Valentia (VV)", 
  "Vicenza (VI)", "Viterbo (VT)"
];

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

export const createEmptyProperty = (): Property => ({
  id: '',
  label: '',
  address: {
    comune: '',
    province: '',
    street: '',
    zip: ''
  },
  activity2024: 'neither',
  propertyType: 'RESIDENTIAL',
  remodeling: false,
  occupancyStatuses: [
    { status: 'LONG_TERM_RENT', months: 12 }
  ],
  rentalIncome: 0
});

export const activityExplanations = {
  purchased: "Select this if you purchased the property during 2024 but did not sell it. You'll need to provide the purchase date and price.",
  sold: "Select this if you sold the property during 2024 but did not purchase it in the same year. You'll need to provide the sale date and price.",
  both: "Select this if you both purchased and sold this property during 2024. You'll need to provide details for both transactions.",
  neither: "Select this if you owned the property throughout 2024 without purchasing or selling it."
};

export const occupancyExplanations = {
  PERSONAL_USE: "Select this if the property was used personally by you or your family, or if it was vacant during the period.",
  LONG_TERM_RENT: "Select this if the property was rented out with a long-term lease agreement (typically more than 30 days).",
  SHORT_TERM_RENT: "Select this if the property was rented out for short periods (less than 30 days), such as vacation rentals or Airbnb."
};

export const formatOccupancyStatuses = (allocations: OccupancyAllocation[] | OccupancyStatus[]) => {
  const statusMap = {
    PERSONAL_USE: 'Personal Use',
    LONG_TERM_RENT: 'Long-term Rental',
    SHORT_TERM_RENT: 'Short-term Rental'
  };
  
  if (allocations.length === 0) return 'Not specified';
  
  if (typeof allocations[0] === 'object' && 'status' in allocations[0]) {
    return (allocations as OccupancyAllocation[])
      .map(allocation => `${statusMap[allocation.status]} (${allocation.months} months)`)
      .join(', ');
  }
  
  return (allocations as unknown as OccupancyStatus[])
    .map(status => statusMap[status])
    .join(', ');
};

export const getInitialOccupancyMonths = (property: Property) => {
  let initialOccupancyMonths = {
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
      } else if (typeof allocation === 'string') {
        initialOccupancyMonths[allocation as OccupancyStatus] = 12 / property.occupancyStatuses.length;
        newActiveStatuses.add(allocation as OccupancyStatus);
      }
    });
  }
  
  return { initialOccupancyMonths, newActiveStatuses };
};

export const handleActivityChange = (property: Property, value: ActivityType): Property => {
  let updatedProperty = { ...property, activity2024: value };
  
  if (value === 'neither' || value === 'sold') {
    updatedProperty.purchaseDate = null;
    updatedProperty.purchasePrice = undefined;
  }
  
  if (value === 'neither' || value === 'purchased') {
    updatedProperty.saleDate = null;
    updatedProperty.salePrice = undefined;
  }
  
  return updatedProperty;
};

export const validatePropertySubmission = (property: Property, totalMonths: number): string | null => {
  if (!property.label?.trim()) {
    return 'Please enter a property name';
  }
  
  if (!property.address.comune.trim()) {
    return 'Please enter a comune name';
  }
  
  if (!property.address.province) {
    return 'Please select a province';
  }
  
  if (!property.address.street.trim()) {
    return 'Please enter a street address';
  }
  
  if (!property.address.zip.trim()) {
    return 'Please enter a ZIP code';
  }
  
  if (!property.propertyType) {
    return 'Please select a property type';
  }
  
  if (property.activity2024 === 'purchased' || property.activity2024 === 'both') {
    if (!property.purchaseDate) {
      return 'Please select a purchase date';
    }
    
    if (property.purchasePrice === undefined) {
      return 'Please enter a purchase price';
    }
  }
  
  if (property.activity2024 === 'sold' || property.activity2024 === 'both') {
    if (!property.saleDate) {
      return 'Please select a sale date';
    }
    
    if (property.salePrice === undefined) {
      return 'Please enter a sale price';
    }
  }
  
  if (property.occupancyStatuses.length === 0) {
    return 'Please select at least one rental status';
  }
  
  const hasRentalStatus = property.occupancyStatuses.some(
    allocation => allocation.status === 'LONG_TERM_RENT' || allocation.status === 'SHORT_TERM_RENT'
  );
  
  if (hasRentalStatus) {
    if (property.rentalIncome === undefined || property.rentalIncome <= 0) {
      return 'Please enter a valid rental income amount greater than 0';
    }
  }
  
  if (totalMonths !== 12) {
    return 'Total months must equal 12';
  }
  
  return null;
};
