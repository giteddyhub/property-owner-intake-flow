
export interface AccountData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  submissions_count: number;
  properties_count: number;
  owners_count: number;
  is_admin?: boolean;
}

export interface OwnerData {
  id: string;
  first_name: string;
  last_name: string;
  italian_tax_code: string;
  is_resident_in_italy: boolean;
  date_of_birth?: string;
  country_of_birth: string;
  citizenship: string;
  created_at: string;
}

export interface PropertyData {
  id: string;
  label: string;
  property_type: string;
  address_comune: string;
  address_province: string;
  address_street: string;
  address_zip: string;
  created_at: string;
}

export interface AssignmentData {
  id: string;
  property_id: string;
  owner_id: string;
  ownership_percentage: number;
  resident_at_property: boolean;
  property_label: string;
  owner_name: string;
  created_at: string;
}
