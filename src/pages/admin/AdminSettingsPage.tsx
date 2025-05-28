
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, RefreshCw, Database, Mail, Shield, Bell } from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    userRegistration: true,
    requireEmailVerification: true,
    autoApproveSubmissions: false,
    maintenanceMode: false,
    maxUsersPerAccount: 10,
    sessionTimeout: 24,
    systemName: 'Italian Tax Platform',
    supportEmail: 'support@italiantax.com',
    welcomeMessage: 'Welcome to the Italian Tax Platform. We help you manage your tax residency status and property declarations.',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      emailNotifications: true,
      userRegistration: true,
      requireEmailVerification: true,
      autoApproveSubmissions: false,
      maintenanceMode: false,
      maxUsersPerAccount: 10,
      sessionTimeout: 24,
      systemName: 'Italian Tax Platform',
      supportEmail: 'support@italiantax.com',
      welcomeMessage: 'Welcome to the Italian Tax Platform. We help you manage your tax residency status and property declarations.',
    });
    toast.info('Settings reset to defaults');
  };

  return (
    <AdminLayout pageTitle="System Settings">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">System Settings</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings({...settings, welcomeMessage: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="userRegistration">Allow User Registration</Label>
                <Switch
                  id="userRegistration"
                  checked={settings.userRegistration}
                  onCheckedChange={(checked) => setSettings({...settings, userRegistration: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users per Account</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={settings.maxUsersPerAccount}
                  onChange={(e) => setSettings({...settings, maxUsersPerAccount: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Email & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                Configure email templates and notification preferences for user communications.
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoApprove">Auto-approve Submissions</Label>
                <Switch
                  id="autoApprove"
                  checked={settings.autoApproveSubmissions}
                  onCheckedChange={(checked) => setSettings({...settings, autoApproveSubmissions: checked})}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Database Status</span>
                  <span className="text-green-600">Connected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Email Service</span>
                  <span className="text-green-600">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Storage</span>
                  <span className="text-green-600">Available</span>
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
