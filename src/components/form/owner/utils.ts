
import { Owner, MaritalStatus, ItalianResidenceDetails } from '@/types/form';
import { v4 as uuidv4 } from 'uuid';

export const createEmptyOwner = (): Owner => ({
  id: '',
  firstName: '',
  lastName: '',
  dateOfBirth: null,
  countryOfBirth: '',
  citizenship: '',
  address: {
    street: '',
    city: '',
    zip: '',
    country: ''
  },
  maritalStatus: 'UNMARRIED',
  isResidentInItaly: false,
  italianTaxCode: ''
});
