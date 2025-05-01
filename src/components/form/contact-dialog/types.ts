
export interface ContactInfo {
  fullName: string;
  email: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

export interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (contactInfo: ContactInfo) => void;
  isSubmitting: boolean;
}
