
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, Shield } from 'lucide-react';
import { AccountData } from '@/types/admin';

interface UserDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AccountData;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export const UserDeletionDialog: React.FC<UserDeletionDialogProps> = ({
  open,
  onOpenChange,
  user,
  onConfirm,
  loading
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const expectedText = 'DELETE';

  const handleConfirm = async () => {
    if (confirmationText === expectedText) {
      await onConfirm();
    }
  };

  const isConfirmationValid = confirmationText === expectedText;
  const totalRecords = (user.submissions_count || 0) + (user.properties_count || 0) + (user.owners_count || 0);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete User Account
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You are about to permanently delete the user account for:
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="font-medium">{user.full_name || 'No Name'}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                {user.is_admin && (
                  <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>

              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <div className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ This will permanently delete:
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• {user.submissions_count || 0} form submission(s)</li>
                  <li>• {user.properties_count || 0} property record(s)</li>
                  <li>• {user.owners_count || 0} owner record(s)</li>
                  <li>• All associated assignments and activities</li>
                  <li>• All payment records</li>
                </ul>
                <div className="mt-2 text-sm text-red-800 font-medium">
                  Total records to delete: {totalRecords}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmation" className="text-sm font-medium text-gray-700">
                  Type <code className="bg-gray-100 px-1 rounded font-mono">DELETE</code> to confirm:
                </label>
                <input
                  id="confirmation"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Type DELETE here"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmationValid || loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete User Permanently'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
