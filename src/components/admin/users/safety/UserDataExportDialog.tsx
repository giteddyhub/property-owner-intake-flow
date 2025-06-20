
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Users, Home, Activity, DollarSign } from 'lucide-react';
import { UserExportData, useUserDeletionSafety } from '@/hooks/admin/useUserDeletionSafety';

interface UserDataExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  onExportComplete?: () => void;
}

export const UserDataExportDialog: React.FC<UserDataExportDialogProps> = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  onExportComplete
}) => {
  const { loading, exportUserData, downloadUserData } = useUserDeletionSafety();
  const [exportData, setExportData] = useState<UserExportData | null>(null);
  const [hasExported, setHasExported] = useState(false);

  const handlePreviewExport = async () => {
    const data = await exportUserData(userId);
    setExportData(data);
  };

  const handleDownloadExport = async () => {
    await downloadUserData(userId, userEmail);
    setHasExported(true);
    if (onExportComplete) {
      onExportComplete();
    }
  };

  const formatDataSize = (data: any[]): string => {
    return `${data.length} record${data.length !== 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export User Data
          </DialogTitle>
          <DialogDescription>
            Export all user data for compliance before deletion. This includes profile, properties, 
            owners, submissions, and activity logs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Export Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{userEmail}</p>
                  <p className="text-sm text-muted-foreground">User ID: {userId}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewExport}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Preview Data'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          {exportData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Data Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <Home className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{formatDataSize(exportData.properties)}</p>
                      <p className="text-xs text-muted-foreground">Properties</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <Users className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{formatDataSize(exportData.owners)}</p>
                      <p className="text-xs text-muted-foreground">Owners</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">{formatDataSize(exportData.submissions)}</p>
                      <p className="text-xs text-muted-foreground">Submissions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">{formatDataSize(exportData.assignments)}</p>
                      <p className="text-xs text-muted-foreground">Assignments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Activity className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">{formatDataSize(exportData.activities)}</p>
                      <p className="text-xs text-muted-foreground">Activities</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Status */}
          {hasExported && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">✓ Data Export Completed</p>
              <p className="text-green-600 text-sm">
                User data has been successfully exported and downloaded.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDownloadExport}
            disabled={loading || !exportData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Exporting...' : 'Download Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
