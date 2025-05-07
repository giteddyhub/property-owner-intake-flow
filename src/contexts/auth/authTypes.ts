
import React from 'react';

export interface AuthContextType {
  user: any | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signOut: () => Promise<any>;
  loading: boolean;
  processingSubmission: boolean;
  setProcessingSubmission: (value: boolean) => void;
  submissionCompleted: boolean;
  setSubmissionCompleted: (value: boolean) => void;
  isAdmin: boolean;
  checkAdminStatus: () => Promise<boolean>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
