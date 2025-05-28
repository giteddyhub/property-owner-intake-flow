
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Download, Upload, FileText, Users, Check, AlertTriangle } from 'lucide-react';
import { UserWithMetrics } from '@/hooks/admin/useAdvancedFiltering';

interface UserImportExportProps {
  users: UserWithMetrics[];
  onImportComplete?: (importedUsers: any[]) => void;
}

export const UserImportExport: React.FC<UserImportExportProps> = ({ 
  users, 
  onImportComplete 
}) => {
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const exportToCSV = (format: 'basic' | 'detailed') => {
    let headers: string[];
    let rows: string[][];

    if (format === 'basic') {
      headers = ['Name', 'Email', 'Role', 'Status', 'Registration Date'];
      rows = users.map(user => [
        user.full_name || 'N/A',
        user.email,
        user.is_admin ? 'Admin' : 'User',
        user.account_status,
        new Date(user.created_at).toLocaleDateString()
      ]);
    } else {
      headers = [
        'Name', 'Email', 'Role', 'Status', 'Registration Date', 
        'Last Login', 'Activity Score', 'Submissions', 'Properties', 'Login Frequency'
      ];
      rows = users.map(user => [
        user.full_name || 'N/A',
        user.email,
        user.is_admin ? 'Admin' : 'User',
        user.account_status,
        new Date(user.created_at).toLocaleDateString(),
        user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
        user.activity_score.toString(),
        user.submissions_count.toString(),
        user.properties_count.toString(),
        user.login_frequency
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${format}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${users.length} users to CSV (${format} format)`
    });
  };

  const exportToJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      totalUsers: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin,
        account_status: user.account_status,
        created_at: user.created_at,
        last_login: user.last_login,
        activity_score: user.activity_score,
        submissions_count: user.submissions_count,
        properties_count: user.properties_count,
        login_frequency: user.login_frequency
      }))
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${users.length} users to JSON format`
    });
  };

  const handleFileImport = async (file: File) => {
    setImporting(true);
    setImportProgress(0);
    setImportResults(null);

    try {
      const text = await file.text();
      let importData: any[] = [];

      if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
            const user: any = {};
            headers.forEach((header, index) => {
              user[header.toLowerCase().replace(' ', '_')] = values[index];
            });
            importData.push(user);
          }
        }
      } else if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        importData = Array.isArray(jsonData) ? jsonData : jsonData.users || [];
      }

      // Simulate import process with progress
      const results = { success: 0, failed: 0, errors: [] as string[] };
      
      for (let i = 0; i < importData.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
        
        const user = importData[i];
        
        // Basic validation
        if (!user.email || !user.email.includes('@')) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Invalid email`);
        } else {
          results.success++;
        }
        
        setImportProgress(((i + 1) / importData.length) * 100);
      }

      setImportResults(results);

      if (results.success > 0 && onImportComplete) {
        onImportComplete(importData.slice(0, results.success));
      }

      toast({
        title: "Import Complete",
        description: `Successfully imported ${results.success} users. ${results.failed} failed.`
      });

    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        type: "error"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" onClick={() => exportToCSV('basic')}>
              <FileText className="h-4 w-4 mr-2" />
              Basic CSV
            </Button>
            <Button variant="outline" onClick={() => exportToCSV('detailed')}>
              <FileText className="h-4 w-4 mr-2" />
              Detailed CSV
            </Button>
            <Button variant="outline" onClick={exportToJSON}>
              <FileText className="h-4 w-4 mr-2" />
              JSON Export
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Export {users.length} users in various formats for backup or analysis.
          </p>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="import-file">Upload CSV or JSON file</Label>
            <Input
              id="import-file"
              type="file"
              accept=".csv,.json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileImport(file);
                }
              }}
              disabled={importing}
            />
          </div>

          {importing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing users...</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}

          {importResults && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Import Results</h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Success: {importResults.success}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Failed: {importResults.failed}</span>
                </div>
              </div>
              {importResults.errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Errors:</p>
                  <div className="text-xs text-red-600 space-y-1">
                    {importResults.errors.slice(0, 5).map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                    {importResults.errors.length > 5 && (
                      <div>...and {importResults.errors.length - 5} more errors</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Supported formats: CSV, JSON</p>
            <p>Required fields: email</p>
            <p>Optional fields: name, role, status</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
