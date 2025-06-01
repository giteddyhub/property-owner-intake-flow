
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
  AlertTriangle
} from 'lucide-react';
import { useAdvancedUserManagement, UserAction } from '@/hooks/admin/useAdvancedUserManagement';
import { BulkActionConfirmDialog } from './BulkActionConfirmDialog';

interface BulkUserActionsProps {
  selectedUserIds: string[];
  onClearSelection: () => void;
}

export const BulkUserActions: React.FC<BulkUserActionsProps> = ({
  selectedUserIds,
  onClearSelection
}) => {
  const { loading, availableActions, executeBulkAction } = useAdvancedUserManagement();
  const [selectedAction, setSelectedAction] = useState<UserAction | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleActionSelect = (action: UserAction) => {
    setSelectedAction(action);
    setShowConfirmDialog(true);
  };

  const handleConfirmBulkAction = async (reason?: string) => {
    if (!selectedAction) return;
    
    const result = await executeBulkAction(selectedUserIds, selectedAction.type, reason);
    
    if (result.success > 0) {
      setShowConfirmDialog(false);
      setSelectedAction(null);
      onClearSelection();
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
    }
  };

  const getSeverityColor = (severity: UserAction['severity']) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
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
                  className="flex items-center justify-between"
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
                    {action.severity === 'high' && (
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

      {selectedAction && (
        <BulkActionConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          action={selectedAction}
          selectedUserIds={selectedUserIds}
          onConfirm={handleConfirmBulkAction}
          loading={loading}
        />
      )}
    </>
  );
};
