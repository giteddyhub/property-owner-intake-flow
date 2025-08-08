
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AccountInfoCard } from "@/components/admin/accounts/AccountInfoCard";
import { AccountDetailSkeleton } from "@/components/admin/accounts/AccountDetailSkeleton";
import { AccountNotFound } from "@/components/admin/accounts/AccountNotFound";
import { AccountDetailHeader } from "@/components/admin/accounts/AccountDetailHeader";
import { AccountDetailTabs } from "@/components/admin/accounts/AccountDetailTabs";
import { useOptimizedAccountDetails } from "@/hooks/admin/accountDetails/useOptimizedAccountDetails";

export const RefineAccountDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Account Details | Refine";
  }, []);

  const {
    loading,
    account,
    submissions,
    properties,
    owners,
    assignments,
    payments,
    activities,
  } = useOptimizedAccountDetails(id);

  const goBackToAccounts = () => navigate("/admin/accounts");

  if (loading) {
    return (
      <div className="space-y-4">
        <AccountDetailSkeleton onBack={goBackToAccounts} />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="space-y-4">
        <AccountNotFound onBack={goBackToAccounts} />
      </div>
    );
  }

  const hasCompletedSetup = submissions.some(
    (s) => s.is_primary_submission && s.state === "completed"
  );

  const totalPaymentAmount = payments.reduce((sum, p) => {
    const amount = Number(p.amount || 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const paidPaymentAmount = payments
    .filter((p) => p.payment_status === "paid")
    .reduce((sum, p) => {
      const amount = Number(p.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  return (
    <div className="p-6 space-y-4">
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
  );
};
