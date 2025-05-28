
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdvancedUserManagement, UserAction } from '@/hooks/admin/useAdvancedUserManagement';
import { MoreHorizontal, AlertTriangle, Clock, Activity } from 'lucide-react';

interface AdvancedUserActionsProps {
  userId: string;
  userEmail: string;
  isAdmin: boolean;
  onActionComplete?: () => void;
}

export const AdvancedUserActions: React.FC<AdvancedUserActionsProps> = ({
  userId,
  userEmail,
  isAdmin,
  onActionComplete
}) => {
  const { loading, availableActions, executeUserAction, getUserActivitySummary } = useAdvancedUserManagement();
  const [selectedAction, setSelectedAction] = useState<UserAction | null>(null);
  const [reason, setReason] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [activitySummary, setActivitySummary] = useState<any>(null);

  const handleActionSelect = async (action: UserAction) => {
    setSelectedAction(action);
    setReason('');
    
    // Fetch user activity for context
    const summary = await getUserActivitySummary(userId);
    setActivitySummary(summary);
    
    if (action.requiresConfirmation) {
      setConfirmDialogOpen(true);
    } else {
      await executeAction(action);
    }
  };

  const executeAction = async (action: UserAction) => {
    if (!action) return;
    
    const success = await executeUserAction(userId, userEmail, action.type, reason);
    if (success && onActionComplete) {
      onActionComplete();
    }
    
    setConfirmDialogOpen(false);
    setSelectedAction(null);
    setReason('');
  };

  const getActionIcon = (severity: UserAction['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Activity className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: UserAction['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 hover:text-red-700';
      case 'medium':
        return 'text-yellow-600 hover:text-yellow-700';
      case 'low':
        return 'text-green-600 hover:text-green-700';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleActionSelect(action)}
              className={`cursor-pointer ${getSeverityColor(action.severity)}`}
            >
              <div className="flex items-center gap-2">
                {getActionIcon(action.severity)}
                <div>
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction && getActionIcon(selectedAction.severity)}
              Confirm {selectedAction?.label}
            </DialogTitle>
            <DialogDescription>
              You are about to {selectedAction?.label.toLowerCase()} for user: <strong>{userEmail}</strong>
              <br />
              {selectedAction?.description}
            </DialogDescription>
          </DialogHeader>
          
          {activitySummary && (
            <div className="my-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">User Activity Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Last Login: {activitySummary.lastLogin ? new Date(activitySummary.lastLogin).toLocaleDateString() : 'Never'}</div>
                <div>Login Count: {activitySummary.loginCount}</div>
                <div>Submissions: {activitySummary.submissionsCount}</div>
                <div>Properties: {activitySummary.propertiesCount}</div>
                <div>Account Age: {activitySummary.accountAge} days</div>
                <div>Risk Score: <Badge variant={activitySummary.riskScore === 'low' ? 'outline' : 'destructive'}>{activitySummary.riskScore}</Badge></div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for this action..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedAction && executeAction(selectedAction)}
              disabled={loading}
              variant={selectedAction?.severity === 'high' ? 'destructive' : 'default'}
            >
              {loading ? 'Processing...' : `Confirm ${selectedAction?.label}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
