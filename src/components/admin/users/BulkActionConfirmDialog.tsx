
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
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Zap } from 'lucide-react';
import { UserAction } from '@/hooks/admin/useAdvancedUserManagement';

interface BulkActionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: UserAction;
  selectedUserIds: string[];
  onConfirm: (reason?: string) => void;
  loading: boolean;
}

export const BulkActionConfirmDialog: React.FC<BulkActionConfirmDialogProps> = ({
  open,
  onOpenChange,
  action,
  selectedUserIds,
  onConfirm,
  loading
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action.severity === 'high' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            <Zap className="h-5 w-5" />
            Bulk Action: {action.label}
          </DialogTitle>
          <DialogDescription>
            This action will be applied to {selectedUserIds.length} selected users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Bulk Operation</span>
              </div>
              <Badge variant={action.severity === 'high' ? 'destructive' : 'outline'}>
                {action.severity} risk
              </Badge>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Action:</strong> {action.label}</p>
              <p><strong>Description:</strong> {action.description}</p>
              <p><strong>Target Users:</strong> {selectedUserIds.length} selected</p>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="bulk-reason">
              Reason for Bulk Action {action.severity === 'high' && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="bulk-reason"
              placeholder={`Please provide a reason for bulk ${action.label.toLowerCase()}...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            {action.severity === 'high' && (
              <p className="text-sm text-red-600">
                A reason is required for high-severity bulk actions.
              </p>
            )}
          </div>

          {/* Warning for bulk actions */}
          <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800">Bulk Operation Warning</h4>
                <p className="text-sm text-orange-700">
                  This action will affect {selectedUserIds.length} users simultaneously. 
                  Please ensure you have reviewed the user selection and have proper authorization.
                </p>
              </div>
            </div>
          </div>

          {/* High-severity additional warning */}
          {action.severity === 'high' && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">High-Risk Bulk Operation</h4>
                  <p className="text-sm text-red-700">
                    This is a high-risk operation that will immediately impact {selectedUserIds.length} users. 
                    All affected users will receive immediate notification of this action.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || (action.severity === 'high' && !reason.trim())}
            variant={action.severity === 'high' ? 'destructive' : 'default'}
          >
            {loading ? 'Processing...' : `Apply to ${selectedUserIds.length} Users`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
