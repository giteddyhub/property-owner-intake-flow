
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface DeletionFormFieldsProps {
  reason: string;
  setReason: (reason: string) => void;
  confirmEmail: string;
  setConfirmEmail: (email: string) => void;
  userEmail: string;
  confirmDeletion: boolean;
  setConfirmDeletion: (confirmed: boolean) => void;
  confirmUnderstanding: boolean;
  setConfirmUnderstanding: (confirmed: boolean) => void;
}

export const DeletionFormFields: React.FC<DeletionFormFieldsProps> = ({
  reason,
  setReason,
  confirmEmail,
  setConfirmEmail,
  userEmail,
  confirmDeletion,
  setConfirmDeletion,
  confirmUnderstanding,
  setConfirmUnderstanding
}) => {
  const handleConfirmDeletionChange = (checked: boolean | "indeterminate") => {
    setConfirmDeletion(checked === true);
  };

  const handleConfirmUnderstandingChange = (checked: boolean | "indeterminate") => {
    setConfirmUnderstanding(checked === true);
  };

  return (
    <>
      {/* Reason Input */}
      <div className="space-y-2">
        <Label htmlFor="deletion-reason" className="text-base font-medium">
          Reason for Account Deletion <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="deletion-reason"
          placeholder="Please provide a detailed reason for deleting this user account (minimum 10 characters)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground">
          Characters: {reason.length}/10 minimum
        </p>
      </div>

      {/* Email Confirmation */}
      <div className="space-y-2">
        <Label htmlFor="email-confirm" className="text-base font-medium">
          Type the user's email to confirm <span className="text-red-500">*</span>
        </Label>
        <input
          id="email-confirm"
          type="email"
          placeholder={`Type "${userEmail}" to confirm`}
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Confirmation Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="confirm-deletion"
            checked={confirmDeletion}
            onCheckedChange={handleConfirmDeletionChange}
          />
          <Label htmlFor="confirm-deletion" className="text-sm leading-5">
            I understand that this will permanently delete the user account and all associated data,
            and this action cannot be undone.
          </Label>
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="confirm-understanding"
            checked={confirmUnderstanding}
            onCheckedChange={handleConfirmUnderstandingChange}
          />
          <Label htmlFor="confirm-understanding" className="text-sm leading-5">
            I have proper authorization to perform this deletion and understand the consequences
            of this action.
          </Label>
        </div>
      </div>
    </>
  );
};
