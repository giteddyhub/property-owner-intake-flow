
// Selectively export from each module to avoid name conflicts
export { submissionTracker } from './submissionTracker';
export { validateSubmission } from './submissionValidator';
export { createFormSubmission, createPurchaseEntry, saveFormData } from './databaseService';
export { submitFormData } from './submissionService';

// Export types from one location to avoid duplication
export * from './types';
export { saveOwners } from './ownerService';
export { saveProperties } from './propertyService';
export { saveAssignments } from './assignmentService';
