
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PaymentVerificationPanel } from '@/components/admin/payments/PaymentVerificationPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, Shield, Users } from 'lucide-react';

const AdminSettingsPage = () => {
  return (
    <AdminLayout pageTitle="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage system settings and administrative tools.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Payment Verification Section */}
          <PaymentVerificationPanel />

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Information
              </CardTitle>
              <CardDescription>
                Current system status and configuration details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Environment:</span>
                  <p>Production</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Database:</span>
                  <p>Supabase PostgreSQL</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Payments:</span>
                  <p>Stripe Integration</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Storage:</span>
                  <p>Supabase Storage</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Security and access control configurations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Row Level Security (RLS)</span>
                  <span className="text-sm font-medium text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin Authentication</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Management</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
