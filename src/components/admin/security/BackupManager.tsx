
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useDataBackup } from '@/hooks/admin/useDataBackup';
import { Database, Download, Trash2, RotateCcw, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const BackupManager: React.FC = () => {
  const { 
    backupJobs, 
    loading, 
    createBackup, 
    getAvailableTables, 
    downloadBackup, 
    deleteBackup, 
    restoreFromBackup,
    getBackupStats 
  } = useDataBackup();

  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [selectedBackupType, setSelectedBackupType] = useState<'full' | 'incremental' | 'table_specific'>('full');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  useEffect(() => {
    const loadTables = async () => {
      const tables = await getAvailableTables();
      setAvailableTables(tables);
    };
    loadTables();
  }, [getAvailableTables]);

  const handleCreateBackup = async () => {
    const tables = selectedBackupType === 'table_specific' ? selectedTables : undefined;
    const backupId = await createBackup(selectedBackupType, tables);
    
    if (backupId) {
      toast.success('Backup job created successfully');
      setSelectedTables([]);
    } else {
      toast.error('Failed to create backup job');
    }
  };

  const handleDownload = async (backupId: string) => {
    const success = await downloadBackup(backupId);
    if (success) {
      toast.success('Backup download started');
    } else {
      toast.error('Failed to download backup');
    }
  };

  const handleDelete = async (backupId: string) => {
    const success = await deleteBackup(backupId);
    if (success) {
      toast.success('Backup deleted successfully');
    } else {
      toast.error('Failed to delete backup');
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
      return;
    }

    const success = await restoreFromBackup(backupId);
    if (success) {
      toast.success('Database restored successfully');
    } else {
      toast.error('Failed to restore database');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const stats = getBackupStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Create New Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Backup Type</label>
              <Select value={selectedBackupType} onValueChange={(value: any) => setSelectedBackupType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Backup</SelectItem>
                  <SelectItem value="incremental">Incremental Backup</SelectItem>
                  <SelectItem value="table_specific">Table Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedBackupType === 'table_specific' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Tables</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                  {availableTables.map(table => (
                    <div key={table} className="flex items-center space-x-2">
                      <Checkbox 
                        id={table}
                        checked={selectedTables.includes(table)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTables(prev => [...prev, table]);
                          } else {
                            setSelectedTables(prev => prev.filter(t => t !== table));
                          }
                        }}
                      />
                      <label htmlFor={table} className="text-sm">{table}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={handleCreateBackup} 
              disabled={loading || (selectedBackupType === 'table_specific' && selectedTables.length === 0)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalBackups}</div>
              <div className="text-sm text-muted-foreground">Total Backups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.completedBackups}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatFileSize(stats.totalSizeBytes)}</div>
              <div className="text-sm text-muted-foreground">Total Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stats.lastBackupDate ? format(new Date(stats.lastBackupDate), 'MMM dd') : 'Never'}
              </div>
              <div className="text-sm text-muted-foreground">Last Backup</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupJobs.map((backup) => (
              <div key={backup.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getStatusColor(backup.status)}>
                        {backup.status.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{backup.type.replace('_', ' ').toUpperCase()}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(backup.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    
                    {backup.status === 'running' && backup.progress_percentage !== undefined && (
                      <div className="mb-2">
                        <Progress value={backup.progress_percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {backup.progress_percentage}% complete
                        </p>
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      {backup.tables && (
                        <div>Tables: {backup.tables.join(', ')}</div>
                      )}
                      {backup.file_size && (
                        <div>Size: {formatFileSize(backup.file_size)}</div>
                      )}
                      {backup.error_message && (
                        <div className="text-red-600">Error: {backup.error_message}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {backup.status === 'completed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(backup.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(backup.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(backup.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {backupJobs.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No backup jobs found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
