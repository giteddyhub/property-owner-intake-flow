
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AccountsFilterBar } from '@/components/admin/accounts/AccountsFilterBar';
import { AccountStatsCards } from '@/components/admin/accounts/AccountStatsCards';
import { AccountsTable } from '@/components/admin/accounts/AccountsTable';
import { UserOverviewModal } from '@/components/admin/overview/UserOverviewModal';
import { useAccountsData } from '@/hooks/admin/useAccountsData';
import { useUserOverview } from '@/hooks/admin/useUserOverview';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [overviewContext, setOverviewContext] = useState<{ type: 'property' | 'owner' | 'assignment'; id: string } | undefined>();
  
  const { 
    accounts,
    loading,
    error,
    diagnosticInfo,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredAccounts,
    currentItems,
    totalPages,
    fetchAccounts
  } = useAccountsData();

  const {
    loading: overviewLoading,
    data: overviewData,
    fetchUserOverview,
    clearData: clearOverviewData
  } = useUserOverview();

  // Handle view account details
  const handleViewAccount = (accountId: string) => {
    navigate(`/admin/accounts/${accountId}`);
  };

  const handleRefresh = () => {
    toast.info("Refreshing accounts data...");
    fetchAccounts();
  };

  const handleShowUserOverview = async (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => {
    setSelectedUserId(userId);
    setOverviewContext(context);
    await fetchUserOverview(userId);
  };

  const handleCloseUserOverview = () => {
    setSelectedUserId(null);
    setOverviewContext(undefined);
    clearOverviewData();
  };

  return (
    <AdminLayout pageTitle="Accounts">
      <div className="space-y-6">
        {/* Filter and Search Controls */}
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <AccountsFilterBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              fetchAccounts={fetchAccounts}
              loading={loading}
            />
          </div>
          <Button variant="outline" onClick={handleRefresh} className="ml-4">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Account Stats Cards */}
        <AccountStatsCards accounts={accounts} />
        
        {/* Accounts Table */}
        <AccountsTable 
          loading={loading}
          error={error}
          diagnosticInfo={diagnosticInfo}
          currentItems={currentItems}
          handleViewAccount={handleViewAccount}
          currentPage={currentPage}
          filteredAccounts={filteredAccounts}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          onRefresh={handleRefresh}
          onShowUserOverview={handleShowUserOverview}
        />

        {/* User Overview Modal */}
        <UserOverviewModal
          open={!!selectedUserId}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseUserOverview();
            }
          }}
          userId={selectedUserId || ''}
          userData={overviewData || { owners: [], properties: [], assignments: [] }}
          triggerContext={overviewContext}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAccountsPage;
