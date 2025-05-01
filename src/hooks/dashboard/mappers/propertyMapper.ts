
import { 
  Property, 
  PropertyDocument, 
  OccupancyAllocation, 
  OccupancyStatus,
  PropertyType,
  ActivityType 
} from '@/components/dashboard/types';
import { DbProperty } from '../types';

export const mapDbPropertiesToProperties = (dbProperties: DbProperty[]): Property[] => {
  return dbProperties.map((dbProperty: DbProperty): Property => {
    // Parse documents with explicit typing
    const parsedDocuments: PropertyDocument[] = parsePropertyDocuments(dbProperty.documents || []);
    
    // Parse occupancy statuses with explicit typing
    const parsedOccupancyStatuses: OccupancyAllocation[] = parseOccupancyStatuses(dbProperty.occupancy_statuses || []);

    return {
      id: dbProperty.id,
      label: dbProperty.label,
      address: {
        comune: dbProperty.address_comune,
        province: dbProperty.address_province,
        street: dbProperty.address_street,
        zip: dbProperty.address_zip
      },
      activity2024: dbProperty.activity_2024 as ActivityType,
      purchaseDate: dbProperty.purchase_date ? new Date(dbProperty.purchase_date) : null,
      purchasePrice: dbProperty.purchase_price ? Number(dbProperty.purchase_price) : undefined,
      saleDate: dbProperty.sale_date ? new Date(dbProperty.sale_date) : null,
      salePrice: dbProperty.sale_price ? Number(dbProperty.sale_price) : undefined,
      propertyType: dbProperty.property_type as PropertyType,
      remodeling: dbProperty.remodeling,
      occupancyStatuses: parsedOccupancyStatuses,
      rentalIncome: dbProperty.rental_income ? Number(dbProperty.rental_income) : undefined,
      documents: parsedDocuments,
      useDocumentRetrievalService: Boolean(dbProperty.use_document_retrieval_service)
    };
  });
};

// Define strict interfaces to avoid recursive type problems
interface RawPropertyDocument {
  id?: string;
  name?: string;
  type?: string;
  size?: number;
  uploadDate?: string | number;
}

export const parsePropertyDocuments = (documents: any[]): PropertyDocument[] => {
  if (!Array.isArray(documents)) return [];
  
  return documents.map((docItem): PropertyDocument => {
    // Handle string case (JSON string)
    if (typeof docItem === 'string') {
      try {
        const parsed = JSON.parse(docItem) as RawPropertyDocument;
        return createPropertyDocument(parsed);
      } catch (e) {
        return createPropertyDocument({
          id: 'unknown',
          name: typeof docItem === 'string' ? docItem : 'Unknown document',
        });
      }
    }
    
    // Handle object case
    return createPropertyDocument(docItem as RawPropertyDocument);
  });
};

// Helper function to create a PropertyDocument with default values
function createPropertyDocument(doc: RawPropertyDocument): PropertyDocument {
  return {
    id: doc.id || 'unknown',
    name: doc.name || 'Unknown document',
    type: doc.type || 'unknown',
    size: doc.size || 0,
    uploadDate: new Date(doc.uploadDate || Date.now())
  };
}

interface RawOccupancyAllocation {
  status?: string;
  months?: number;
}

export const parseOccupancyStatuses = (occupancyStatuses: any[] | string | undefined): OccupancyAllocation[] => {
  // Default value if parsing fails
  const defaultOccupancy: OccupancyAllocation[] = [{ status: 'PERSONAL_USE' as OccupancyStatus, months: 12 }];
  
  try {
    // Handle string case (JSON string)
    if (typeof occupancyStatuses === 'string') {
      try {
        const parsed = JSON.parse(occupancyStatuses);
        return Array.isArray(parsed) ? parsed.map(normalizeOccupancyItem) : defaultOccupancy;
      } catch (e) {
        return defaultOccupancy;
      }
    } 
    
    // Handle array case
    if (Array.isArray(occupancyStatuses)) {
      const parsed = occupancyStatuses
        .map((item): OccupancyAllocation | null => {
          if (typeof item === 'string') {
            try {
              return normalizeOccupancyItem(JSON.parse(item));
            } catch (e) {
              console.error('Failed to parse occupancy status item:', item);
              return null;
            }
          }
          return normalizeOccupancyItem(item as RawOccupancyAllocation);
        })
        .filter((item): item is OccupancyAllocation => item !== null);
      
      return parsed.length > 0 ? parsed : defaultOccupancy;
    }
  } catch (e) {
    console.error('Error parsing occupancy statuses:', e, occupancyStatuses);
  }
  
  return defaultOccupancy;
};

function normalizeOccupancyItem(item: RawOccupancyAllocation): OccupancyAllocation {
  if (!item) return { status: 'PERSONAL_USE' as OccupancyStatus, months: 12 };
  
  return {
    status: ((item.status || 'PERSONAL_USE') as OccupancyStatus),
    months: typeof item.months === 'number' ? item.months : 12
  };
}
