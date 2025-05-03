
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

export interface SubmissionResult {
  success: boolean;
  submissionId?: string;
  purchaseId?: string;
  error?: string;
}
