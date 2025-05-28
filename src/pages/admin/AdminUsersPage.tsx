
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AccountAdminDialog } from '@/components/admin/accounts/AccountAdminDialog';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { CreateAdminUserForm } from '@/components/admin/users/CreateAdminUserForm';
import { useAdminUsers, UserRole } from '@/hooks/admin/useAdminUsers';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { ActionsToolbar } from '@/components/dashboard/ActionsToolbar';

const AdminUsersPage: React.FC = () => {
  const { 
    users, 
    adminUsers, 
    loading, 
    error,
    diagnosticInfo,
    fetchUsers,
    addUser, 
    toggleAdminStatus, 
    isAdmin,
    filter,
    setFilter
  } = useAdminUsers('all'); // Changed default to 'all' for better overview
  
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdminDialog = (user: any) => {
    console.log("Opening admin dialog for user:", user);
    setSelectedUser(user);
    setAdminDialogOpen(true);
  };

  const handleToggleAdmin = async () => {
    if (!selectedUser) return;
    
    const userId = selectedUser.id;
    const isUserAdmin = isAdmin(userId);
    const userName = selectedUser.full_name || selectedUser.email;
    
    console.log(`Toggling admin status for ${userName} (${userId}). Current status: ${isUserAdmin ? 'admin' : 'user'}`);
    
    const success = await toggleAdminStatus(userId, isUserAdmin, userName);
    if (success) {
      setAdminDialogOpen(false);
      // After successful toggle, refresh the users list
      fetchUsers();
    }
  };

  const handleCreateAdminSuccess = (userData: any) => {
    addUser(userData);
    setFormOpen(false);
    toast({
      title: "Admin Created",
      description: "New admin user has been created successfully"
    });
  };

  const handleRowClick = (userId: string) => {
    navigate(`/admin/accounts/${userId}`);
  };

  const getPageTitle = () => {
    switch (filter) {
      case 'admin':
        return 'Admin Users';
      case 'user':
        return 'Regular Users';
      case 'all':
        return 'All Users';
      default:
        return 'All Users';
    }
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest users data..."
    });
    fetchUsers();
  };

  const handleExportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Created At'].join(','),
      ...filteredUsers.map(user => [
        user.full_name || 'N/A',
        user.email,
        isAdmin(user.id) ? 'Admin' : 'User',
        new Date(user.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `Exported ${filteredUsers.length} users to CSV`
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select users to perform bulk actions"
      });
      return;
    }
    
    toast({
      title: "Bulk Action",
      description: `${action} action for ${selectedUsers.length} users (coming soon)`
    });
  };

  return (
    <AdminLayout pageTitle="User Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{getPageTitle()}</h2>
          <div className="flex items-center gap-2">
            <ActionsToolbar onRefresh={handleRefresh} />
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
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Bulk Actions ({selectedUsers.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction('Export')}>
                    Export Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('Disable')}>
                    Disable Accounts
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('Enable')}>
                    Enable Accounts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="outline" onClick={handleExportUsers}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{getPageTitle()} ({filteredUsers.length})</CardTitle>
              <Tabs 
                value={filter} 
                onValueChange={(value) => setFilter(value as UserRole)}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="admin">Admins</TabsTrigger>
                  <TabsTrigger value="user">Regular Users</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <UsersTable
              users={filteredUsers}
              adminUsers={adminUsers}
              loading={loading}
              error={error}
              diagnosticInfo={diagnosticInfo}
              onAdminToggle={handleOpenAdminDialog}
              onRowClick={handleRowClick}
              onRefresh={handleRefresh}
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
