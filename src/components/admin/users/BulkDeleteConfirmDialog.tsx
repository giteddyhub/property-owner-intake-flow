
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
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Users, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAdvancedUserManagement, UserDataSummary } from '@/hooks/admin/useAdvancedUserManagement';

interface SelectedUser {
  id: string;
  email: string;
  full_name?: string;
}

interface BulkDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUsers: SelectedUser[];
  onConfirm: (reason: string) => void;
  loading: boolean;
}

interface DeletionProgress {
  completed: number;
  total: number;
  currentUser?: string;
  results: Array<{ user: SelectedUser; status: 'pending' | 'success' | 'error'; error?: string }>;
}

export const BulkDeleteConfirmDialog: React.FC<BulkDeleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  selectedUsers,
  onConfirm,
  loading
}) => {
  const { getUserDataSummary, bulkDeleteUserAccounts } = useAdvancedUserManagement();
  const [reason, setReason] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [confirmUnderstanding, setConfirmUnderstanding] = useState(false);
  const [aggregateData, setAggregateData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [deletionInProgress, setDeletionInProgress] = useState(false);
  const [progress, setProgress] = useState<DeletionProgress>({
    completed: 0,
    total: 0,
    results: []
  });

  const confirmationText = `DELETE ${selectedUsers.length} USERS`;
  const isFormValid = reason.trim().length >= 10 && 
                     confirmEmail === confirmationText && 
                     confirmDeletion && 
                     confirmUnderstanding;

  // Load aggregate data when dialog opens
  useEffect(() => {
    if (open && selectedUsers.length > 0) {
      loadAggregateData();
    }
  }, [open, selectedUsers]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setReason('');
      setConfirmEmail('');
      setConfirmDeletion(false);
      setConfirmUnderstanding(false);
      setDeletionInProgress(false);
      setProgress({ completed: 0, total: 0, results: [] });
    }
  }, [open]);

  const loadAggregateData = async () => {
    setLoadingData(true);
    try {
      const summaries = await Promise.all(
        selectedUsers.map(user => getUserDataSummary(user.id))
      );

      const aggregate = summaries.reduce((acc, summary) => {
        if (summary) {
          acc.properties_count += summary.properties_count;
          acc.owners_count += summary.owners_count;
          acc.submissions_count += summary.submissions_count;
          acc.assignments_count += summary.assignments_count;
          acc.activities_count += summary.activities_count;
          acc.total_revenue += summary.total_revenue || 0;
        }
        return acc;
      }, {
        properties_count: 0,
        owners_count: 0,
        submissions_count: 0,
        assignments_count: 0,
        activities_count: 0,
        total_revenue: 0
      });

      setAggregateData(aggregate);
    } catch (error) {
      console.error('Failed to load aggregate data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleConfirm = async () => {
    if (!isFormValid) return;
    
    setDeletionInProgress(true);
    setProgress({
      completed: 0,
      total: selectedUsers.length,
      results: selectedUsers.map(user => ({ user, status: 'pending' }))
    });

    const userIds = selectedUsers.map(u => u.id);
    const userEmails = selectedUsers.map(u => u.email);

    try {
      await bulkDeleteUserAccounts(
        userIds,
        userEmails,
        reason.trim(),
        (completed, total, currentUser) => {
          setProgress(prev => ({
            ...prev,
            completed,
            total,
            currentUser,
            results: prev.results.map((result, index) => {
              if (index < completed) {
                return { ...result, status: 'success' };
              }
              if (index === completed && currentUser) {
                return { ...result, status: 'pending' };
              }
              return result;
            })
          }));
        }
      );

      // Close dialog after successful completion
      setTimeout(() => {
        onOpenChange(false);
        onConfirm(reason.trim());
      }, 2000);
    } catch (error: any) {
      console.error('Bulk deletion failed:', error);
      setProgress(prev => ({
        ...prev,
        results: prev.results.map(result => 
          result.status === 'pending' 
            ? { ...result, status: 'error', error: error.message }
            : result
        )
      }));
    } finally {
      setDeletionInProgress(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0.00';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleConfirmDeletionChange = (checked: boolean | "indeterminate") => {
    setConfirmDeletion(checked === true);
  };

  const handleConfirmUnderstandingChange = (checked: boolean | "indeterminate") => {
    setConfirmUnderstanding(checked === true);
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Bulk Delete User Accounts - CRITICAL ACTION
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete {selectedUsers.length} user accounts and ALL associated data. 
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Users to be deleted */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-red-700">
                <Users className="h-4 w-4" />
                Users to be Deleted ({selectedUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {selectedUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded">
                      {deletionInProgress && getStatusIcon(progress.results[index]?.status || 'pending')}
                      <span className="font-medium">{user.full_name || 'No Name'}</span>
                      <span className="text-muted-foreground">({user.email})</span>
                      {progress.results[index]?.error && (
                        <span className="text-red-600 text-xs ml-auto">{progress.results[index].error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Aggregate data summary */}
          {aggregateData && !loadingData && (
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-orange-700">
                  <AlertTriangle className="h-4 w-4" />
                  Total Data to be Permanently Deleted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-xl font-bold text-red-600">{aggregateData.properties_count}</p>
                      <p className="text-muted-foreground">Properties</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-xl font-bold text-red-600">{aggregateData.owners_count}</p>
                      <p className="text-muted-foreground">Owners</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-xl font-bold text-red-600">{aggregateData.submissions_count}</p>
                      <p className="text-muted-foreground">Submissions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-xl font-bold text-red-600">{aggregateData.assignments_count}</p>
                      <p className="text-muted-foreground">Assignments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(aggregateData.total_revenue)}</p>
                      <p className="text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-xl font-bold text-red-600">{aggregateData.activities_count}</p>
                      <p className="text-muted-foreground">Activities</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress tracking */}
          {deletionInProgress && (
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-blue-700">
                  <Clock className="h-4 w-4" />
                  Deletion Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress: {progress.completed} of {progress.total}</span>
                    <span>{Math.round((progress.completed / progress.total) * 100)}%</span>
                  </div>
                  <Progress value={(progress.completed / progress.total) * 100} className="w-full" />
                </div>
                {progress.currentUser && (
                  <p className="text-sm text-muted-foreground">
                    Currently processing: {progress.currentUser}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!deletionInProgress && (
            <>
              {/* Critical Warning */}
              <div className="p-4 border-2 border-red-300 bg-red-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-bold text-red-800">CRITICAL: Mass Data Deletion</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• {selectedUsers.length} user accounts will be permanently deleted</li>
                      <li>• All associated data will be completely removed</li>
                      <li>• This action affects multiple users simultaneously</li>
                      <li>• This action cannot be undone or reversed</li>
                      <li>• Ensure you have proper authorization for mass deletion</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              <div className="space-y-2">
                <Label htmlFor="deletion-reason" className="text-base font-medium">
                  Reason for Bulk Account Deletion <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="deletion-reason"
                  placeholder="Please provide a detailed reason for deleting these user accounts (minimum 10 characters)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Characters: {reason.length}/10 minimum
                </p>
              </div>

              {/* Confirmation Text Input */}
              <div className="space-y-2">
                <Label htmlFor="confirm-text" className="text-base font-medium">
                  Type the following text to confirm <span className="text-red-500">*</span>
                </Label>
                <div className="p-2 bg-gray-100 rounded font-mono text-sm">
                  {confirmationText}
                </div>
                <input
                  id="confirm-text"
                  type="text"
                  placeholder={`Type "${confirmationText}" to confirm`}
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
                    onCheckedChange={handleConfirmDeletionChange}
                  />
                  <Label htmlFor="confirm-deletion" className="text-sm leading-5">
                    I understand that this will permanently delete {selectedUsers.length} user accounts and all 
                    associated data, and this action cannot be undone.
                  </Label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="confirm-understanding"
                    checked={confirmUnderstanding}
                    onCheckedChange={handleConfirmUnderstandingChange}
                  />
                  <Label htmlFor="confirm-understanding" className="text-sm leading-5">
                    I have proper authorization to perform this mass deletion and understand the severe
                    consequences of this action.
                  </Label>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading || deletionInProgress}
          >
            Cancel
          </Button>
          {!deletionInProgress && (
            <Button
              onClick={handleConfirm}
              disabled={loading || !isFormValid}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Processing...' : `DELETE ${selectedUsers.length} ACCOUNTS PERMANENTLY`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
