
import { Owner, Property, OwnerPropertyAssignment } from '@/types/form';

// Re-export the refactored services for backward compatibility
export { createFormSubmission, createPurchaseEntry } from './submissionCreationService';
export { saveFormData } from './formDataSavingService';
export { logUserActivity } from './activityLoggingService';
