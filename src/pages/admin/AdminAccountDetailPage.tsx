
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AccountInfoCard } from '@/components/admin/accounts/AccountInfoCard';
import { AccountDetailSkeleton } from '@/components/admin/accounts/AccountDetailSkeleton';
import { AccountNotFound } from '@/components/admin/accounts/AccountNotFound';
import { AccountDetailHeader } from '@/components/admin/accounts/AccountDetailHeader';
import { AccountDetailTabs } from '@/components/admin/accounts/AccountDetailTabs';
import { useAccountDetails } from '@/hooks/admin/useAccountDetails';

const AdminAccountDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    loading,
    account,
    submissions,
    properties,
    owners,
    assignments,
    payments,
    activities
  } = useAccountDetails(id);

  // Navigate back to accounts page
  const goBackToAccounts = () => navigate('/admin/accounts');

  if (loading) {
    return (
      <AdminLayout pageTitle="Account Details">
        <AccountDetailSkeleton onBack={goBackToAccounts} />
      </AdminLayout>
    );
  }

  if (!account) {
    return (
      <AdminLayout pageTitle="Account Not Found">
        <AccountNotFound onBack={goBackToAccounts} />
      </AdminLayout>
    );
  }

  // Calculate enhanced metrics
  const hasCompletedSetup = submissions.some(s => s.is_primary_submission && s.state === 'completed');
  const totalPaymentAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <AdminLayout pageTitle={`Account: ${account.full_name || account.email}`}>
      <div className="p-6">
        <AccountDetailHeader 
          accountName={account.full_name || account.email}
          onBack={goBackToAccounts}
        />
        
        <AccountInfoCard 
          account={account}
          submissionsCount={submissions.length}
          propertiesCount={properties.length}
          ownersCount={owners.length}
          paymentsCount={payments.length}
          activitiesCount={activities.length}
          hasCompletedSetup={hasCompletedSetup}
          totalPaymentAmount={totalPaymentAmount}
        />
        
        <AccountDetailTabs
          account={account}
          submissions={submissions}
          properties={properties}
          owners={owners}
          assignments={assignments}
          payments={payments}
          activities={activities}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAccountDetailPage;
