
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Crown, User } from 'lucide-react';
import { UserSafetyCheck } from '@/hooks/admin/useUserDeletionSafety';

interface UserDeletionSafetyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  safetyCheck: UserSafetyCheck;
  userEmail: string;
}

export const UserDeletionSafetyDialog: React.FC<UserDeletionSafetyDialogProps> = ({
  open,
  onOpenChange,
  safetyCheck,
  userEmail
}) => {
  const getIcon = () => {
    if (safetyCheck.isSuperAdmin) return <Crown className="h-5 w-5 text-yellow-600" />;
    if (safetyCheck.isAdmin) return <Shield className="h-5 w-5 text-blue-600" />;
    return <User className="h-5 w-5 text-gray-600" />;
  };

  const getUserTypeLabel = () => {
    if (safetyCheck.isSuperAdmin) return 'Super Admin';
    if (safetyCheck.isAdmin) return 'Admin';
    return 'Regular User';
  };

  const getUserTypeBadge = () => {
    if (safetyCheck.isSuperAdmin) return 'destructive';
    if (safetyCheck.isAdmin) return 'secondary';
    return 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Security Check Results
          </DialogTitle>
          <DialogDescription>
            Safety verification for user deletion request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Type Info */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getIcon()}
              <div>
                <p className="font-medium">{userEmail}</p>
                <p className="text-sm text-muted-foreground">User Type</p>
              </div>
            </div>
            <Badge variant={getUserTypeBadge()}>
              {getUserTypeLabel()}
            </Badge>
          </div>

          {/* Blocking Reasons */}
          {safetyCheck.blockingReasons.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Deletion Blocked:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {safetyCheck.blockingReasons.map((reason, index) => (
                      <li key={index} className="text-sm">{reason}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {safetyCheck.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Warnings:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {safetyCheck.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Safety Status */}
          <div className={`p-3 rounded-lg ${safetyCheck.canDelete ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`font-medium ${safetyCheck.canDelete ? 'text-green-800' : 'text-red-800'}`}>
              {safetyCheck.canDelete ? '✓ Deletion Allowed' : '✗ Deletion Blocked'}
            </p>
            <p className={`text-sm ${safetyCheck.canDelete ? 'text-green-600' : 'text-red-600'}`}>
              {safetyCheck.canDelete 
                ? 'This user can be safely deleted with proper authorization.'
                : 'This user cannot be deleted due to security restrictions.'
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
