
import { 
  Property, 
  PropertyDocument, 
  OccupancyAllocation, 
  OccupancyStatus,
  PropertyType,
  ActivityType 
} from '@/components/dashboard/types';

interface DbProperty {
  id: string;
  label: string;
  address_comune: string;
  address_province: string;
  address_street: string;
  address_zip: string;
  activity_2024: string;
  purchase_date: string | null;
  purchase_price: number | null;
  sale_date: string | null;
  sale_price: number | null;
  property_type: string;
  remodeling: boolean;
  occupancy_statuses: any[] | string;
  rental_income?: number;
  documents?: any[];
  use_document_retrieval_service: boolean;
}

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

export const parsePropertyDocuments = (documents: any[] | undefined): PropertyDocument[] => {
  if (!documents || !Array.isArray(documents)) return [];
  
  return documents.map((docItem: any): PropertyDocument => {
    if (typeof docItem === 'string') {
      try {
        const parsed = JSON.parse(docItem);
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
          name: docItem || 'Unknown document',
          type: 'unknown',
          size: 0,
          uploadDate: new Date()
        };
      }
    }
    return {
      id: docItem.id || 'unknown',
      name: docItem.name || 'Unknown document',
      type: docItem.type || 'unknown',
      size: docItem.size || 0,
      uploadDate: new Date(docItem.uploadDate || Date.now())
    };
  });
};

export const parseOccupancyStatuses = (occupancyStatuses: any[] | string | undefined): OccupancyAllocation[] => {
  // Default value if parsing fails
  const defaultOccupancy: OccupancyAllocation[] = [{ status: 'PERSONAL_USE' as OccupancyStatus, months: 12 }];
  
  try {
    if (typeof occupancyStatuses === 'string') {
      const parsed = JSON.parse(occupancyStatuses);
      return Array.isArray(parsed) ? parsed as OccupancyAllocation[] : defaultOccupancy;
    } 
    
    if (Array.isArray(occupancyStatuses)) {
      const parsed = occupancyStatuses.map((item: any): OccupancyAllocation | null => {
        if (typeof item === 'string') {
          try {
            return JSON.parse(item) as OccupancyAllocation;
          } catch (e) {
            console.error('Failed to parse occupancy status item:', item);
            return null;
          }
        }
        return {
          status: (item.status || 'PERSONAL_USE') as OccupancyStatus,
          months: item.months || 12
        };
      }).filter((item): item is OccupancyAllocation => item !== null);
      
      return parsed.length > 0 ? parsed : defaultOccupancy;
    }
  } catch (e) {
    console.error('Error parsing occupancy statuses:', e, occupancyStatuses);
  }
  
  return defaultOccupancy;
};
