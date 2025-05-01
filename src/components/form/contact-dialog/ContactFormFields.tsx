
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ContactInfo } from './types';
import { User } from '@supabase/supabase-js';

interface ContactFormFieldsProps {
  contactInfo: ContactInfo;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (checked: boolean, name: string) => void;
  isSubmitting: boolean;
  user: User | null;
}

const ContactFormFields: React.FC<ContactFormFieldsProps> = ({
  contactInfo,
  handleInputChange,
  handleCheckboxChange,
  isSubmitting,
  user
}) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default ContactFormFields;
