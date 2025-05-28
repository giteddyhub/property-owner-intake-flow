
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export const useUserManagementActions = (
  addUser: (userData: any) => void,
  toggleAdminStatus: (userId: string, isUserAdmin: boolean, userName: string) => Promise<boolean>,
  isAdmin: (userId: string) => boolean,
  fetchUsers: () => void,
  filteredUsers: any[]
) => {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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

  return {
    formOpen,
    setFormOpen,
    adminDialogOpen,
    setAdminDialogOpen,
    selectedUser,
    selectedUsers,
    setSelectedUsers,
    handleOpenAdminDialog,
    handleToggleAdmin,
    handleCreateAdminSuccess,
    handleRowClick,
    handleRefresh,
    handleExportUsers,
    handleBulkAction,
    handleImportComplete
  };
};
