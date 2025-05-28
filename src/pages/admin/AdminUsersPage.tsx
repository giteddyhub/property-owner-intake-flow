
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AccountAdminDialog } from '@/components/admin/accounts/AccountAdminDialog';
import { UserManagementHeader } from '@/components/admin/users/UserManagementHeader';
import { UserManagementTabs } from '@/components/admin/users/UserManagementTabs';
import { useAdminUsers, UserRole } from '@/hooks/admin/useAdminUsers';
import { useAdvancedFiltering } from '@/hooks/admin/useAdvancedFiltering';
import { useUserManagementActions } from '@/hooks/admin/useUserManagementActions';

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
  
  const {
    formOpen,
    setFormOpen,
    adminDialogOpen,
    setAdminDialogOpen,
    selectedUser,
    selectedUsers,
    handleOpenAdminDialog,
    handleToggleAdmin,
    handleCreateAdminSuccess,
    handleRowClick,
    handleRefresh,
    handleExportUsers,
    handleBulkAction,
    handleImportComplete
  } = useUserManagementActions(addUser, toggleAdminStatus, isAdmin, fetchUsers, filteredUsers);

  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

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

  return (
    <AdminLayout pageTitle="User Management">
      <div className="space-y-6">
        <UserManagementHeader
          pageTitle={getPageTitle()}
          onRefresh={handleRefresh}
          formOpen={formOpen}
          setFormOpen={setFormOpen}
          onCreateAdminSuccess={handleCreateAdminSuccess}
        />

        <UserManagementTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filter={filter}
          setFilter={setFilter}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          selectedUsers={selectedUsers}
          filters={filters}
          setFilters={setFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={(sort: string) => setSortBy(sort as any)}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          resetFilters={resetFilters}
          applyQuickFilter={applyQuickFilter}
          filteredUsers={filteredUsers}
          usersWithMetrics={usersWithMetrics}
          adminUsers={adminUsers}
          loading={loading}
          error={error}
          diagnosticInfo={diagnosticInfo}
          onAdminToggle={handleOpenAdminDialog}
          onRowClick={handleRowClick}
          onRefresh={handleRefresh}
          onBulkAction={handleBulkAction}
          onExportUsers={handleExportUsers}
          onImportComplete={handleImportComplete}
        />
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
