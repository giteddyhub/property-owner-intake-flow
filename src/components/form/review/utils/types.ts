
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';

export interface ContactInfo {
  fullName: string;
  email: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface SubmissionData {
  owners: Owner[];
  properties: Property[];
  assignments: OwnerPropertyAssignment[];
  contactInfo: ContactInfo;
}
