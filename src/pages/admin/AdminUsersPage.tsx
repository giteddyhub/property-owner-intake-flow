
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, Download, Filter, BarChart3, FileText } from 'lucide-react';
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
import { AdvancedFilters } from '@/components/admin/users/AdvancedFilters';
import { UserEngagementAnalytics } from '@/components/admin/users/UserEngagementAnalytics';
import { UserImportExport } from '@/components/admin/users/UserImportExport';
import { useAdminUsers, UserRole } from '@/hooks/admin/useAdminUsers';
import { useAdvancedFiltering } from '@/hooks/admin/useAdvancedFiltering';
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
  } = useAdminUsers('all');
  
  const {
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredUsers,
    usersWithMetrics,
    resetFilters,
    applyQuickFilter
  } = useAdvancedFiltering(users, adminUsers);
  
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

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

  const handleImportComplete = (importedUsers: any[]) => {
    // Add imported users to the list
    importedUsers.forEach(user => addUser(user));
    fetchUsers(); // Refresh to get updated data
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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="import-export" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Import/Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Advanced Filters
              </Button>

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

            {/* Advanced Filters */}
            {showFilters && (
              <AdvancedFilters
                filters={filters}
                setFilters={setFilters}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                resetFilters={resetFilters}
                applyQuickFilter={applyQuickFilter}
                resultCount={filteredUsers.length}
              />
            )}
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Users ({filteredUsers.length})</CardTitle>
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
          </TabsContent>

          <TabsContent value="analytics">
            <UserEngagementAnalytics users={usersWithMetrics} />
          </TabsContent>

          <TabsContent value="import-export">
            <UserImportExport 
              users={usersWithMetrics} 
              onImportComplete={handleImportComplete}
            />
          </TabsContent>
        </Tabs>
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
