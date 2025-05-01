
export interface DbOwner {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  country_of_birth: string;
  citizenship: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  address_country: string;
  italian_tax_code: string;
  marital_status: string;
  is_resident_in_italy: boolean;
  italian_residence_street?: string;
  italian_residence_city?: string;
  italian_residence_zip?: string;
  user_id: string;
}

export interface DbProperty {
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

export interface DbAssignment {
  id: string;
  property_id: string;
  owner_id: string;
  ownership_percentage: number;
  resident_at_property: boolean;
  resident_from_date?: string;
  resident_to_date?: string;
  tax_credits?: number;
}
