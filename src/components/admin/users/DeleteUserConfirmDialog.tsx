
import React, { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertTriangle, 
  User, 
  Trash2, 
  FileText, 
  Home, 
  Users, 
  Activity,
  DollarSign,
  Calendar
} from 'lucide-react';
import { UserDataSummary } from '@/hooks/admin/useAdvancedUserManagement';

interface DeleteUserConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  userName?: string;
  dataSummary?: UserDataSummary;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

export const DeleteUserConfirmDialog: React.FC<DeleteUserConfirmDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  userName,
  dataSummary,
  onConfirm,
  loading
}) => {
  const [reason, setReason] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [confirmUnderstanding, setConfirmUnderstanding] = useState(false);

  const isFormValid = reason.trim().length >= 10 && 
                     confirmEmail === userEmail && 
                     confirmDeletion && 
                     confirmUnderstanding;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setReason('');
      setConfirmEmail('');
      setConfirmDeletion(false);
      setConfirmUnderstanding(false);
    }
  }, [open]);

  const handleConfirm = () => {
    if (isFormValid) {
      onConfirm(reason.trim());
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0.00';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete User Account - CRITICAL ACTION
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete the user account and ALL associated data. 
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-red-700">
                <User className="h-4 w-4" />
                User to be Deleted
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span>
                  <p>{userName || 'No Name'}</p>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="font-mono">{userEmail}</p>
                </div>
                <div>
                  <span className="font-medium">User ID:</span>
                  <p className="font-mono text-xs">{userId}</p>
                </div>
                <div>
                  <span className="font-medium">Account Age:</span>
                  <p>{dataSummary?.account_age_days || 0} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Summary */}
          {dataSummary && (
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-orange-700">
                  <Activity className="h-4 w-4" />
                  Data to be Permanently Deleted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Home className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-xl font-bold text-red-600">{dataSummary.properties_count}</p>
                      <p className="text-muted-foreground">Properties</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Users className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-xl font-bold text-red-600">{dataSummary.owners_count}</p>
                      <p className="text-muted-foreground">Owners</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <FileText className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-xl font-bold text-red-600">{dataSummary.submissions_count}</p>
                      <p className="text-muted-foreground">Submissions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Activity className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-xl font-bold text-red-600">{dataSummary.assignments_count}</p>
                      <p className="text-muted-foreground">Assignments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(dataSummary.total_revenue)}</p>
                      <p className="text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-xl font-bold text-red-600">{dataSummary.activities_count}</p>
                      <p className="text-muted-foreground">Activities</p>
                    </div>
                  </div>
                </div>
                {dataSummary.last_login && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Last Login: {new Date(dataSummary.last_login).toLocaleString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Critical Warning */}
          <div className="p-4 border-2 border-red-300 bg-red-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-bold text-red-800">CRITICAL: Permanent Data Loss</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• All user data will be permanently deleted from the database</li>
                  <li>• Properties, owners, and tax submissions will be completely removed</li>
                  <li>• Payment and transaction history will be deleted</li>
                  <li>• User account and authentication data will be erased</li>
                  <li>• This action cannot be undone or reversed</li>
                </ul>
              </div>
            </div>
          </div>

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
                onCheckedChange={setConfirmDeletion}
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
                onCheckedChange={setConfirmUnderstanding}
              />
              <Label htmlFor="confirm-understanding" className="text-sm leading-5">
                I have proper authorization to perform this deletion and understand the consequences
                of this action.
              </Label>
            </div>
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
            onClick={handleConfirm}
            disabled={loading || !isFormValid}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Deleting...' : 'DELETE ACCOUNT PERMANENTLY'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
