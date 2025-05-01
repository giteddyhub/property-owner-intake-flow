
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
    const parsedDocuments: PropertyDocument[] = parsePropertyDocuments(dbProperty.documents);
    
    // Parse occupancy statuses with explicit typing
    const parsedOccupancyStatuses: OccupancyAllocation[] = parseOccupancyStatuses(dbProperty.occupancy_statuses);

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

interface RawPropertyDocument {
  id?: string;
  name?: string;
  type?: string;
  size?: number;
  uploadDate?: string | number;
}

export const parsePropertyDocuments = (documents: any[] | undefined): PropertyDocument[] => {
  if (!documents || !Array.isArray(documents)) return [];
  
  return documents.map((docItem): PropertyDocument => {
    if (typeof docItem === 'string') {
      try {
        const parsed = JSON.parse(docItem) as RawPropertyDocument;
        return {
          id: parsed.id || 'unknown',
          name: parsed.name || 'Unknown document',
          type: parsed.type || 'unknown',
          size: parsed.size || 0,
          uploadDate: new Date(parsed.uploadDate || Date.now())
        };
      } catch (e) {
        return {
          id: 'unknown',
          name: typeof docItem === 'string' ? docItem : 'Unknown document',
          type: 'unknown',
          size: 0,
          uploadDate: new Date()
        };
      }
    }
    
    const docObject = docItem as RawPropertyDocument;
    return {
      id: docObject.id || 'unknown',
      name: docObject.name || 'Unknown document',
      type: docObject.type || 'unknown',
      size: docObject.size || 0,
      uploadDate: new Date(docObject.uploadDate || Date.now())
    };
  });
};

interface RawOccupancyAllocation {
  status?: string;
  months?: number;
}

export const parseOccupancyStatuses = (occupancyStatuses: any[] | string | undefined): OccupancyAllocation[] => {
  // Default value if parsing fails
  const defaultOccupancy: OccupancyAllocation[] = [{ status: 'PERSONAL_USE' as OccupancyStatus, months: 12 }];
  
  try {
    if (typeof occupancyStatuses === 'string') {
      try {
        const parsed = JSON.parse(occupancyStatuses);
        return Array.isArray(parsed) ? parsed.map(normalizeOccupancyItem) : defaultOccupancy;
      } catch (e) {
        return defaultOccupancy;
      }
    } 
    
    if (Array.isArray(occupancyStatuses)) {
      const parsed = occupancyStatuses.map((item): OccupancyAllocation | null => {
        if (typeof item === 'string') {
          try {
            const parsedItem = JSON.parse(item);
            return normalizeOccupancyItem(parsedItem);
          } catch (e) {
            console.error('Failed to parse occupancy status item:', item);
            return null;
          }
        }
        return normalizeOccupancyItem(item);
      }).filter((item): item is OccupancyAllocation => item !== null);
      
      return parsed.length > 0 ? parsed : defaultOccupancy;
    }
  } catch (e) {
    console.error('Error parsing occupancy statuses:', e, occupancyStatuses);
  }
  
  return defaultOccupancy;
};

function normalizeOccupancyItem(item: RawOccupancyAllocation): OccupancyAllocation {
  return {
    status: (item.status || 'PERSONAL_USE') as OccupancyStatus,
    months: item.months || 12
  };
}
