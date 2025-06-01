
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AuthModal } from '../auth/AuthModal';
import { ContactInfo, ContactDialogProps } from './contact-dialog/types';
import ContactFormFields from './contact-dialog/ContactFormFields';
import ContactSubmitButton from './contact-dialog/ContactSubmitButton';
import { useImprovedContactForm } from './contact-dialog/useImprovedContactForm';

const AuthContactInfoDialog: React.FC<ContactDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const {
    contactInfo,
    showAuthModal,
    setShowAuthModal,
    handleInputChange,
    handleCheckboxChange,
    handleSubmit,
    handleAuthSuccess,
    user
  } = useImprovedContactForm(onSubmit, onClose);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <ContactFormFields 
              contactInfo={contactInfo}
              handleInputChange={handleInputChange}
              handleCheckboxChange={handleCheckboxChange}
              isSubmitting={isSubmitting}
              user={user}
            />
            <ContactSubmitButton 
              onClick={handleSubmit}
              isSubmitting={isSubmitting}
              user={user}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
        title="Create an Account"
        description="Create an account to save your submission and access it later."
        defaultTab="sign-up"
      />
    </>
  );
};

export default AuthContactInfoDialog;
