
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';
import { ContactInfo } from './utils/types';
import { submitFormData as submitData } from './utils/submissionService';

// Change from `export` to `export type` for type re-exports
export type { ContactInfo };

export const submitFormData = async (
  owners: Owner[],
  properties: Property[],
  assignments: OwnerPropertyAssignment[],
  contactInfo: ContactInfo
): Promise<void> => {
  return submitData(owners, properties, assignments, contactInfo);
};
