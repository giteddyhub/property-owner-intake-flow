
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
import { AlertTriangle, User, Calendar, Activity, Download, UserX, Shield } from 'lucide-react';
import { UserAction } from '@/hooks/admin/useAdvancedUserManagement';
import { useUserDeletionSafety, UserSafetyCheck } from '@/hooks/admin/useUserDeletionSafety';
import { DeleteUserConfirmDialog } from './DeleteUserConfirmDialog';
import { UserDeletionSafetyDialog } from './safety/UserDeletionSafetyDialog';
import { UserDataExportDialog } from './safety/UserDataExportDialog';
import { SoftDeleteDialog } from './safety/SoftDeleteDialog';

interface UserActionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: UserAction;
  userId: string;
  userEmail: string;
  userName?: string;
  activitySummary?: any;
  onConfirm: (reason?: string) => void;
  loading: boolean;
}

export const UserActionConfirmDialog: React.FC<UserActionConfirmDialogProps> = ({
  open,
  onOpenChange,
  action,
  userId,
  userEmail,
  userName,
  activitySummary,
  onConfirm,
  loading
}) => {
  const [reason, setReason] = useState('');
  const [safetyCheck, setSafetyCheck] = useState<UserSafetyCheck | null>(null);
  const [showSafetyDialog, setShowSafetyDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showSoftDeleteDialog, setShowSoftDeleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { checkUserSafety } = useUserDeletionSafety();

  // Check user safety when dialog opens for delete actions
  useEffect(() => {
    if (open && action.type === 'delete_account') {
      checkUserSafety(userId, userEmail).then(setSafetyCheck);
    }
  }, [open, action.type, userId, userEmail, checkUserSafety]);

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
  };

  const handleDeleteAction = () => {
    if (!safetyCheck) return;
    
    if (!safetyCheck.canDelete) {
      setShowSafetyDialog(true);
      return;
    }
    
    setShowDeleteDialog(true);
  };

  const getRiskLevel = (summary: any) => {
    if (!summary) return 'unknown';
    return summary.riskScore || 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // For delete actions, show enhanced delete interface
  if (action.type === 'delete_account') {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Account Deletion Options
              </DialogTitle>
              <DialogDescription>
                Choose how to handle this user account. Review safety checks and consider alternatives to permanent deletion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* User Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4" />
                    User Information
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
                      <p>{userEmail}</p>
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span>
                      <p className="font-mono text-xs">{userId}</p>
                    </div>
                    <div>
                      <span className="font-medium">Risk Level:</span>
                      <Badge className={getRiskColor(getRiskLevel(activitySummary))}>
                        {getRiskLevel(activitySummary)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Check Results */}
              {safetyCheck && (
                <Card className={safetyCheck.canDelete ? 'border-green-200' : 'border-red-200'}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      Safety Check
                      <Badge variant={safetyCheck.canDelete ? 'default' : 'destructive'}>
                        {safetyCheck.canDelete ? 'Safe' : 'Blocked'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {safetyCheck.blockingReasons.length > 0 && (
                      <div className="text-sm text-red-600 mb-2">
                        <p className="font-medium">Deletion blocked:</p>
                        <ul className="list-disc list-inside">
                          {safetyCheck.blockingReasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {safetyCheck.warnings.length > 0 && (
                      <div className="text-sm text-amber-600">
                        <p className="font-medium">Warnings:</p>
                        <ul className="list-disc list-inside">
                          {safetyCheck.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => setShowSoftDeleteDialog(true)}
                  className="flex items-center gap-2"
                >
                  <UserX className="h-4 w-4" />
                  Deactivate
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleDeleteAction}
                  disabled={!safetyCheck}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Permanent Delete
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Safety Dialog */}
        <UserDeletionSafetyDialog
          open={showSafetyDialog}
          onOpenChange={setShowSafetyDialog}
          safetyCheck={safetyCheck!}
          userEmail={userEmail}
        />

        {/* Export Dialog */}
        <UserDataExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          userId={userId}
          userEmail={userEmail}
        />

        {/* Soft Delete Dialog */}
        <SoftDeleteDialog
          open={showSoftDeleteDialog}
          onOpenChange={setShowSoftDeleteDialog}
          userId={userId}
          userEmail={userEmail}
          onSuccess={() => onOpenChange(false)}
        />

        {/* Permanent Delete Dialog */}
        <DeleteUserConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          userId={userId}
          userEmail={userEmail}
          userName={userName}
          dataSummary={activitySummary}
          onConfirm={onConfirm}
          loading={loading}
        />
      </>
    );
  }

  // For non-delete actions, show standard confirmation
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action.severity === 'high' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            Confirm Action: {action.label}
          </DialogTitle>
          <DialogDescription>
            {action.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                User Information
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
                  <p>{userEmail}</p>
                </div>
                <div>
                  <span className="font-medium">User ID:</span>
                  <p className="font-mono text-xs">{userId}</p>
                </div>
                <div>
                  <span className="font-medium">Risk Level:</span>
                  <Badge className={getRiskColor(getRiskLevel(activitySummary))}>
                    {getRiskLevel(activitySummary)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          {activitySummary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{activitySummary.loginCount || 0}</p>
                    <p className="text-muted-foreground">Total Logins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{activitySummary.submissionsCount || 0}</p>
                    <p className="text-muted-foreground">Submissions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{activitySummary.propertiesCount || 0}</p>
                    <p className="text-muted-foreground">Properties</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{activitySummary.accountAge || 0}</p>
                    <p className="text-muted-foreground">Days Active</p>
                  </div>
                </div>
                {activitySummary.lastLogin && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Last Login: {new Date(activitySummary.lastLogin).toLocaleString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reason Input */}
          {action.requiresConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for Action {action.severity === 'high' && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="reason"
                placeholder={`Please provide a reason for ${action.label.toLowerCase()}...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              {action.severity === 'high' && (
                <p className="text-sm text-red-600">
                  A reason is required for high-severity actions.
                </p>
              )}
            </div>
          )}

          {/* Warning for high-severity actions */}
          {action.severity === 'high' && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">High-Risk Action</h4>
                  <p className="text-sm text-red-700">
                    This action will have immediate impact on the user's access and experience. 
                    Please ensure you have proper authorization and a valid reason.
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
            {loading ? 'Processing...' : `Confirm ${action.label}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
