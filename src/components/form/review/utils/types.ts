
export interface ContactInfo {
  fullName: string;
  email: string;
}

export interface SubmissionData {
  owners: any[];
  properties: any[];
  assignments: any[];
  contactInfo: ContactInfo;
}
