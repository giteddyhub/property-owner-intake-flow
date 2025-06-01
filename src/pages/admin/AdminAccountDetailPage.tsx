
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AccountInfoCard } from '@/components/admin/accounts/AccountInfoCard';
import { AccountDetailSkeleton } from '@/components/admin/accounts/AccountDetailSkeleton';
import { AccountNotFound } from '@/components/admin/accounts/AccountNotFound';
import { AccountDetailHeader } from '@/components/admin/accounts/AccountDetailHeader';
import { AccountDetailTabs } from '@/components/admin/accounts/AccountDetailTabs';
import { useOptimizedAccountDetails } from '@/hooks/admin/accountDetails/useOptimizedAccountDetails';

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
  } = useOptimizedAccountDetails(id);

  console.log(`[AdminAccountDetailPage] 🎯 Page render with final data:`, {
    userId: id,
    loading,
    accountEmail: account?.email,
    submissionsCount: submissions.length,
    paymentsCount: payments.length,
    paymentsExist: payments.length > 0,
    paymentData: payments.map(p => ({ 
      id: p.id, 
      amount: p.amount, 
      status: p.payment_status 
    }))
  });

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

  // Calculate enhanced metrics with proper validation
  const hasCompletedSetup = submissions.some(s => s.is_primary_submission && s.state === 'completed');
  
  // Calculate total payment amount (all payments) for the tabs
  const totalPaymentAmount = payments.reduce((sum, p) => {
    const amount = Number(p.amount || 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Calculate paid payment amount (only paid payments) for the overview
  const paidPaymentAmount = payments
    .filter(p => p.payment_status === 'paid')
    .reduce((sum, p) => {
      const amount = Number(p.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  console.log(`[AdminAccountDetailPage] 📊 Final UI calculations:`, {
    hasCompletedSetup,
    totalPaymentAmount,
    paidPaymentAmount,
    paymentsForUI: payments.length,
    paidPaymentsCount: payments.filter(p => p.payment_status === 'paid').length,
    calculationDetails: payments.map(p => ({ 
      id: p.id, 
      originalAmount: p.amount, 
      numericAmount: Number(p.amount || 0),
      status: p.payment_status,
      isPaid: p.payment_status === 'paid',
      isValid: !isNaN(Number(p.amount || 0))
    }))
  });

  return (
    <AdminLayout pageTitle={`Account: ${account.full_name || account.email}`}>
      <div className="p-6">
        <div className="mb-4">
          <AccountDetailHeader 
            accountName={account.full_name || account.email}
            onBack={goBackToAccounts}
          />
        </div>
        
        <AccountInfoCard 
          account={account}
          submissionsCount={submissions.length}
          propertiesCount={properties.length}
          ownersCount={owners.length}
          paymentsCount={payments.length}
          activitiesCount={activities.length}
          hasCompletedSetup={hasCompletedSetup}
          paidPaymentAmount={paidPaymentAmount}
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
