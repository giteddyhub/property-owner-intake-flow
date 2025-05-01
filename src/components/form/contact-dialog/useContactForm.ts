
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useFormContext } from '@/contexts/FormContext';
import { ContactInfo } from './types';

export const useContactForm = (
  onSubmit: (contactInfo: ContactInfo) => void,
  onClose: () => void
) => {
  const { state } = useFormContext();
  const { user } = useAuth();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    fullName: '',
    email: user?.email || '',
    termsAccepted: false,
    privacyAccepted: false,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Update email when user logs in
  useEffect(() => {
    if (user?.email) {
      setContactInfo(prev => ({ ...prev, email: user.email || '' }));
    }
    
    // If user is already logged in, also attempt to populate full name from user metadata
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

  const handleSubmit = () => {
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

    // Store form data in sessionStorage before proceeding to authentication
    sessionStorage.setItem('pendingFormData', JSON.stringify({
      owners: state.owners,
      properties: state.properties,
      assignments: state.assignments,
      contactInfo: contactInfo
    }));
    
    console.log("Storing form data in sessionStorage for later submission", {
      owners: state.owners.length,
      properties: state.properties.length,
      assignments: state.assignments.length
    });

    // If user is not logged in, show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // If user is logged in, proceed with submission
    onSubmit(contactInfo);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Short delay to let the auth state update
    setTimeout(() => {
      // If user is authenticated after modal closes, submit the form
      if (user) {
        if (validateEmail(contactInfo.email) && contactInfo.termsAccepted && contactInfo.privacyAccepted) {
          onSubmit(contactInfo);
        }
      }
    }, 1500); // Increased timeout for better reliability
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
