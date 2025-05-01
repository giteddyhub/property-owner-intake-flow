
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

interface ContactInfo {
  fullName: string;
  email: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

interface AuthContactInfoDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (contactInfo: ContactInfo) => void;
  isSubmitting: boolean;
}

const AuthContactInfoDialog: React.FC<AuthContactInfoDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
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

    // If user is not logged in, show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // If user is logged in, proceed with submission
    onSubmit(contactInfo);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Short delay to let the auth state update
    setTimeout(() => {
      if (validateEmail(contactInfo.email) && contactInfo.termsAccepted && contactInfo.privacyAccepted) {
        onSubmit(contactInfo);
      }
    }, 500);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Your full name"
                value={contactInfo.fullName}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={contactInfo.email}
                onChange={handleInputChange}
                disabled={isSubmitting || !!user}
              />
              {user && (
                <p className="text-xs text-muted-foreground">
                  Using your account email
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={contactInfo.termsAccepted}
                  onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'termsAccepted')}
                  disabled={isSubmitting}
                />
                <label htmlFor="terms" className="text-sm">
                  I accept the{' '}
                  <a
                    href="https://www.italiantaxes.com/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privacy"
                  checked={contactInfo.privacyAccepted}
                  onCheckedChange={(checked) => handleCheckboxChange(!!checked, 'privacyAccepted')}
                  disabled={isSubmitting}
                />
                <label htmlFor="privacy" className="text-sm">
                  I accept the{' '}
                  <a
                    href="https://www.italiantaxes.com/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-form-300 hover:bg-form-400"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : !user ? (
                  'Continue to Sign In'
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
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
