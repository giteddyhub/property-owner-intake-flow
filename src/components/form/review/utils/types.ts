
export interface ContactInfo {
  fullName: string;
  email: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface SubmissionData {
  owners: any[];
  properties: any[];
  assignments: any[];
  contactInfo: ContactInfo;
  userId?: string | null;
}
