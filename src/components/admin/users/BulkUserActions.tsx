
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  Users, 
  UserX, 
  UserCheck, 
  Key, 
  Mail,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { useAdvancedUserManagement, UserAction } from '@/hooks/admin/useAdvancedUserManagement';
import { BulkActionConfirmDialog } from './BulkActionConfirmDialog';
import { BulkDeleteConfirmDialog } from './BulkDeleteConfirmDialog';

interface BulkUserActionsProps {
  selectedUserIds: string[];
  selectedUsers?: Array<{ id: string; email: string; full_name?: string }>;
  onClearSelection: () => void;
  onBulkActionComplete?: () => void;
}

export const BulkUserActions: React.FC<BulkUserActionsProps> = ({
  selectedUserIds,
  selectedUsers = [],
  onClearSelection,
  onBulkActionComplete
}) => {
  const { loading, availableActions, executeBulkAction, bulkDeleteUserAccounts } = useAdvancedUserManagement();
  const [selectedAction, setSelectedAction] = useState<UserAction | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleActionSelect = (action: UserAction) => {
    setSelectedAction(action);
    
    if (action.type === 'delete_account') {
      setShowDeleteDialog(true);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmBulkAction = async (reason?: string) => {
    if (!selectedAction) return;
    
    const result = await executeBulkAction(selectedUserIds, selectedAction.type, reason);
    
    if (result.success > 0) {
      setShowConfirmDialog(false);
      setSelectedAction(null);
      onClearSelection();
      
      if (onBulkActionComplete) {
        onBulkActionComplete();
      }
    }
  };

  const handleConfirmBulkDelete = async (reason: string) => {
    const userEmails = selectedUsers.map(user => user.email);
    
    const result = await bulkDeleteUserAccounts(
      selectedUserIds,
      userEmails,
      reason
    );
    
    if (result.success > 0) {
      setShowDeleteDialog(false);
      setSelectedAction(null);
      onClearSelection();
      
      if (onBulkActionComplete) {
        onBulkActionComplete();
      }
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

  const getSeverityColor = (severity: UserAction['severity']) => {
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

  if (selectedUserIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={loading}>
                Bulk Actions <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-1.5 text-sm font-medium">
                Apply to {selectedUserIds.length} users
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
                    <div>
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {action.severity === 'critical' && (
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                    )}
                    <Badge variant={getSeverityColor(action.severity)} className="text-xs">
                      {action.severity}
                    </Badge>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {selectedAction && selectedAction.type !== 'delete_account' && (
        <BulkActionConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          action={selectedAction}
          selectedUserIds={selectedUserIds}
          onConfirm={handleConfirmBulkAction}
          loading={loading}
        />
      )}

      <BulkDeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        selectedUsers={selectedUsers}
        onConfirm={handleConfirmBulkDelete}
        loading={loading}
      />
    </>
  );
};
