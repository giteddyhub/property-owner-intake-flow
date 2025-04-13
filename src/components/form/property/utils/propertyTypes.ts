
import { 
  ActivityType, 
  Property, 
  OccupancyStatus,
  OccupancyAllocation,
  PropertyType
} from '@/types/form';

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
