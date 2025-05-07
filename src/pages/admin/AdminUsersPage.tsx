
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AccountAdminDialog } from '@/components/admin/accounts/AccountAdminDialog';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { CreateAdminUserForm } from '@/components/admin/users/CreateAdminUserForm';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';

const AdminUsersPage: React.FC = () => {
  const { 
    users, 
    adminUsers, 
    loading, 
    addUser, 
    toggleAdminStatus, 
    isAdmin 
  } = useAdminUsers();
  
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleOpenAdminDialog = (user: any) => {
    setSelectedUser(user);
    setAdminDialogOpen(true);
  };

  const handleToggleAdmin = async () => {
    if (!selectedUser) return;
    
    const userId = selectedUser.id;
    const isUserAdmin = isAdmin(userId);
    const userName = selectedUser.full_name || selectedUser.email;
    
    const success = await toggleAdminStatus(userId, isUserAdmin, userName);
    if (success) {
      setAdminDialogOpen(false);
    }
  };

  const handleCreateAdminSuccess = (userData: any) => {
    addUser(userData);
    setFormOpen(false);
  };

  const handleRowClick = (userId: string) => {
    navigate(`/admin/accounts/${userId}`);
  };

  return (
    <AdminLayout pageTitle="Users">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Management</h2>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Admin User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Administrator Account</DialogTitle>
                <DialogDescription>
                  Create a new user account with administrative privileges.
                </DialogDescription>
              </DialogHeader>
              
              <CreateAdminUserForm 
                onSuccess={handleCreateAdminSuccess}
                onCancel={() => setFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent>
            <UsersTable
              users={users}
              adminUsers={adminUsers}
              loading={loading}
              onAdminToggle={handleOpenAdminDialog}
              onRowClick={handleRowClick}
            />
          </CardContent>
        </Card>
      </div>
      
      {selectedUser && (
        <AccountAdminDialog
          open={adminDialogOpen}
          onOpenChange={setAdminDialogOpen}
          onConfirm={handleToggleAdmin}
          accountName={selectedUser.full_name || selectedUser.email}
          isAdmin={isAdmin(selectedUser.id)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage;
