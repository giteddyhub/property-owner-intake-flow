
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AccountsFilterBar } from '@/components/admin/accounts/AccountsFilterBar';
import { AccountStatsCards } from '@/components/admin/accounts/AccountStatsCards';
import { AccountsTable } from '@/components/admin/accounts/AccountsTable';
import { useAccountsData } from '@/hooks/admin/useAccountsData';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminAccountsPage: React.FC = () => {
  const navigate = useNavigate();
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

  // Handle view account details
  const handleViewAccount = (accountId: string) => {
    navigate(`/admin/accounts/${accountId}`);
  };

  const handleRefresh = () => {
    toast.info("Refreshing accounts data...");
    fetchAccounts();
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
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAccountsPage;
