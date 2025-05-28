
import React from 'react';
import { Search, BarChart3, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserFiltersToolbar } from './UserFiltersToolbar';
import { AdvancedFilters } from './AdvancedFilters';
import { UsersTable } from './UsersTable';
import { UserEngagementAnalytics } from './UserEngagementAnalytics';
import { UserImportExport } from './UserImportExport';
import { UserRole } from '@/hooks/admin/useAdminUsers';
import { FilterOptions } from '@/hooks/admin/useAdvancedFiltering';

interface UserManagementTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filter: UserRole;
  setFilter: (filter: UserRole) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedUsers: string[];
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  resetFilters: () => void;
  applyQuickFilter: (preset: string) => void;
  filteredUsers: any[];
  usersWithMetrics: any[];
  adminUsers: string[];
  loading: boolean;
  error: string | null;
  diagnosticInfo: any;
  onAdminToggle: (user: any) => void;
  onRowClick: (userId: string) => void;
  onRefresh: () => void;
  onBulkAction: (action: string) => void;
  onExportUsers: () => void;
  onImportComplete: (users: any[]) => void;
}

export const UserManagementTabs: React.FC<UserManagementTabsProps> = ({
  activeTab,
  setActiveTab,
  filter,
  setFilter,
  showFilters,
  setShowFilters,
  selectedUsers,
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  resetFilters,
  applyQuickFilter,
  filteredUsers,
  usersWithMetrics,
  adminUsers,
  loading,
  error,
  diagnosticInfo,
  onAdminToggle,
  onRowClick,
  onRefresh,
  onBulkAction,
  onExportUsers,
  onImportComplete
}) => {
  return (
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
        <UserFiltersToolbar
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          selectedUsers={selectedUsers}
          onBulkAction={onBulkAction}
          onExportUsers={onExportUsers}
        />

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
              onAdminToggle={onAdminToggle}
              onRowClick={onRowClick}
              onRefresh={onRefresh}
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
          onImportComplete={onImportComplete}
        />
      </TabsContent>
    </Tabs>
  );
};
