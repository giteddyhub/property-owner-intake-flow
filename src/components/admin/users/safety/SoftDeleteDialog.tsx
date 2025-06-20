
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserX, Info } from 'lucide-react';
import { useUserDeletionSafety } from '@/hooks/admin/useUserDeletionSafety';

interface SoftDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  onSuccess?: () => void;
}

export const SoftDeleteDialog: React.FC<SoftDeleteDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  onSuccess
}) => {
  const { loading, softDeleteUser } = useUserDeletionSafety();
  const [reason, setReason] = useState('');

  const handleSoftDelete = async () => {
    if (!reason.trim()) return;
    
    const success = await softDeleteUser(userId, userEmail, reason.trim());
    
    if (success) {
      setReason('');
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-orange-600" />
            Deactivate User Account
          </DialogTitle>
          <DialogDescription>
            Deactivate the user account instead of permanently deleting it. 
            This preserves all data while preventing user access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Soft Delete (Deactivation):</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>User account will be marked as deactivated</li>
                  <li>All user data remains in the system</li>
                  <li>User cannot log in or access their account</li>
                  <li>Account can potentially be reactivated later</li>
                  <li>Safer alternative to permanent deletion</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* User Info */}
          <div className="p-3 border rounded-lg">
            <p className="font-medium">User to Deactivate</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="deactivation-reason">
              Reason for Deactivation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="deactivation-reason"
              placeholder="Please provide a reason for deactivating this user account..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              This reason will be logged for audit purposes.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSoftDelete}
            disabled={loading || !reason.trim()}
            variant="secondary"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loading ? 'Deactivating...' : 'Deactivate Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
