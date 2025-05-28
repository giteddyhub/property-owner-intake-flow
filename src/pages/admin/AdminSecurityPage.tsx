
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityMonitor } from '@/components/admin/security/SecurityMonitor';
import { PermissionManager } from '@/components/admin/security/PermissionManager';
import { SessionManager } from '@/components/admin/security/SessionManager';
import { BackupManager } from '@/components/admin/security/BackupManager';
import { usePermissionSystem } from '@/hooks/admin/usePermissionSystem';
import { Shield, UserCog, Monitor, Database } from 'lucide-react';

const AdminSecurityPage: React.FC = () => {
  const { hasPermission } = usePermissionSystem();
  const [activeTab, setActiveTab] = useState('monitor');

  return (
    <AdminLayout pageTitle="Security & Administration">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Security Center</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Monitor
            </TabsTrigger>
            <TabsTrigger 
              value="permissions" 
              className="flex items-center gap-2"
              disabled={!hasPermission('system.settings')}
            >
              <UserCog className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger 
              value="backup" 
              className="flex items-center gap-2"
              disabled={!hasPermission('system.backup')}
            >
              <Database className="h-4 w-4" />
              Backup & Recovery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-6">
            <SecurityMonitor />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <PermissionManager />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <SessionManager />
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <BackupManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurityPage;
