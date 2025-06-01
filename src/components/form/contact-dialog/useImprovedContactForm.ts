
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useFormContext } from '@/contexts/FormContext';
import { usePendingFormData } from '@/hooks/usePendingFormData';
import { ContactInfo } from './types';

export const useImprovedContactForm = (
  onSubmit: (contactInfo: ContactInfo) => void,
  onClose: () => void
) => {
  const { state } = useFormContext();
  const { user } = useAuth();
  const { savePendingFormData } = usePendingFormData();
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    fullName: '',
    email: user?.email || '',
    termsAccepted: false,
    privacyAccepted: false,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Update contact info when user logs in
  useEffect(() => {
    if (user?.email) {
      setContactInfo(prev => ({ ...prev, email: user.email || '' }));
    }
    
    if (user?.user_metadata?.full_name) {
      setContactInfo(prev => ({ ...prev, fullName: user.user_metadata.full_name || '' }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo({ ...contactInfo, [name]: value });
  };

  const handleCheckboxChange = (checked: boolean, name: string) => {
    setContactInfo({ ...contactInfo, [name]: checked });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!contactInfo.fullName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!contactInfo.email.trim() || !validateEmail(contactInfo.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!contactInfo.termsAccepted) {
      toast.error('You must accept the terms and conditions');
      return;
    }

    if (!contactInfo.privacyAccepted) {
      toast.error('You must accept the privacy policy');
      return;
    }

    // Validate form data before proceeding
    if (!state.owners.length || !state.properties.length || !state.assignments.length) {
      toast.error('Please complete the form before submitting');
      return;
    }

    console.log("[ImprovedContactForm] Form validation passed, proceeding with submission");

    // If user is authenticated, save to database and proceed with submission
    if (user) {
      try {
        // Save pending form data to database
        const pendingId = await savePendingFormData(
          state.owners,
          state.properties,
          state.assignments,
          contactInfo,
          user.id
        );

        if (pendingId) {
          console.log("[ImprovedContactForm] Saved pending data to database:", pendingId);
        }

        // Proceed with immediate submission
        onSubmit(contactInfo);
      } catch (error) {
        console.error("[ImprovedContactForm] Error saving pending data:", error);
        toast.error('Failed to save form data. Please try again.');
        return;
      }
    } else {
      // If user is not logged in, save to sessionStorage and show auth modal
      try {
        await savePendingFormData(
          state.owners,
          state.properties,
          state.assignments,
          contactInfo
        );

        console.log("[ImprovedContactForm] Saved pending data to sessionStorage for unauthenticated user");
        setShowAuthModal(true);
      } catch (error) {
        console.error("[ImprovedContactForm] Error saving pending data:", error);
        toast.error('Failed to save form data. Please try again.');
      }
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    
    // Short delay to let the auth state update
    setTimeout(() => {
      if (user && validateEmail(contactInfo.email) && contactInfo.termsAccepted && contactInfo.privacyAccepted) {
        console.log("[ImprovedContactForm] Auth successful, proceeding with submission");
        onSubmit(contactInfo);
      } else {
        console.log("[ImprovedContactForm] Auth successful but validation failed, user needs to retry");
        toast.info('Please complete the submission process again.');
      }
    }, 1500);
  };

  return {
    contactInfo,
    showAuthModal,
    setShowAuthModal,
    handleInputChange,
    handleCheckboxChange,
    handleSubmit,
    handleAuthSuccess,
    validateEmail,
    user
  };
};
