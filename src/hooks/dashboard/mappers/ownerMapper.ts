
import { Owner, MaritalStatus } from '@/components/dashboard/types';

interface DbOwner {
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

export const mapDbOwnersToOwners = (dbOwners: DbOwner[]): Owner[] => {
  return dbOwners.map((dbOwner: DbOwner): Owner => ({
    id: dbOwner.id,
    firstName: dbOwner.first_name,
    lastName: dbOwner.last_name,
    dateOfBirth: dbOwner.date_of_birth ? new Date(dbOwner.date_of_birth) : null,
    countryOfBirth: dbOwner.country_of_birth,
    citizenship: dbOwner.citizenship,
    address: {
      street: dbOwner.address_street,
      city: dbOwner.address_city,
      zip: dbOwner.address_zip,
      country: dbOwner.address_country
    },
    italianTaxCode: dbOwner.italian_tax_code,
    maritalStatus: dbOwner.marital_status as MaritalStatus,
    isResidentInItaly: dbOwner.is_resident_in_italy,
    italianResidenceDetails: dbOwner.is_resident_in_italy ? {
      street: dbOwner.italian_residence_street,
      city: dbOwner.italian_residence_city,
      zip: dbOwner.italian_residence_zip
    } : undefined
  }));
};
