
import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  UserX, 
  UserCheck, 
  Key, 
  Mail,
  AlertTriangle,
  Info,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAdvancedUserManagement, UserAction } from '@/hooks/admin/useAdvancedUserManagement';
import { UserActionConfirmDialog } from './UserActionConfirmDialog';

interface UserActionsDropdownProps {
  userId: string;
  userEmail: string;
  userName?: string;
  isDisabled?: boolean;
  onUserDeleted?: () => void;
}

export const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  userId,
  userEmail,
  userName,
  isDisabled = false,
  onUserDeleted
}) => {
  const { 
    loading, 
    availableActions, 
    executeUserAction, 
    getUserActivitySummary,
    getUserDataSummary 
  } = useAdvancedUserManagement();
  
  const [selectedAction, setSelectedAction] = useState<UserAction | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activitySummary, setActivitySummary] = useState<any>(null);

  const handleActionSelect = async (action: UserAction) => {
    setSelectedAction(action);
    
    // Fetch appropriate data based on action type
    if (action.type === 'delete_account') {
      const summary = await getUserDataSummary(userId);
      setActivitySummary(summary);
    } else {
      const summary = await getUserActivitySummary(userId);
      setActivitySummary(summary);
    }
    
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!selectedAction) return;
    
    const success = await executeUserAction(userId, userEmail, selectedAction.type, reason);
    
    if (success) {
      setShowConfirmDialog(false);
      setSelectedAction(null);
      
      // If this was a delete action and it succeeded, notify parent
      if (selectedAction.type === 'delete_account' && onUserDeleted) {
        onUserDeleted();
      }
    }
  };

  const getSeverityIcon = (severity: UserAction['severity']) => {
    switch (severity) {
      case 'critical':
        return <Trash2 className="h-3 w-3 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'medium':
        return <Info className="h-3 w-3 text-yellow-500" />;
      case 'low':
        return <Info className="h-3 w-3 text-blue-500" />;
    }
  };

  const getActionIcon = (type: UserAction['type']) => {
    switch (type) {
      case 'suspend':
        return <UserX className="h-4 w-4" />;
      case 'activate':
        return <UserCheck className="h-4 w-4" />;
      case 'reset_password':
        return <Key className="h-4 w-4" />;
      case 'send_email':
        return <Mail className="h-4 w-4" />;
      case 'delete_account':
        return <Trash2 className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: UserAction['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0"
            disabled={isDisabled || loading}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5 text-sm font-medium">
            User Actions
          </div>
          <DropdownMenuSeparator />
          
          {availableActions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={() => handleActionSelect(action)}
              className={`flex items-center justify-between ${
                action.type === 'delete_account' ? 'text-red-600 focus:text-red-600' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {getActionIcon(action.type)}
                <span>{action.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {getSeverityIcon(action.severity)}
                <Badge 
                  variant={getSeverityVariant(action.severity)} 
                  className="text-xs"
                >
                  {action.severity}
                </Badge>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedAction && (
        <UserActionConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          action={selectedAction}
          userId={userId}
          userEmail={userEmail}
          userName={userName}
          activitySummary={activitySummary}
          onConfirm={handleConfirmAction}
          loading={loading}
        />
      )}
    </>
  );
};
