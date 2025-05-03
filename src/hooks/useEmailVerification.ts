
import { useEmailVerification as useEmailVerificationHook } from './email-verification/useEmailVerification';

// Re-export the hook with the same name to maintain backward compatibility
export const useEmailVerification = useEmailVerificationHook;
