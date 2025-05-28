
import React from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { AccountSubmissionsTab } from './tabs/AccountSubmissionsTab';
import { AccountPropertiesTab } from './tabs/AccountPropertiesTab';
import { AccountOwnersTab } from './tabs/AccountOwnersTab';
import { AccountAssignmentsTab } from './tabs/AccountAssignmentsTab';
import { AccountPaymentsTab } from './tabs/AccountPaymentsTab';
import { AccountActivitiesTab } from './tabs/AccountActivitiesTab';
import { OwnerData, PropertyData, AssignmentData, PaymentData, UserActivityData } from '@/types/admin';

interface FormSubmission {
  id: string;
  submitted_at: string;
  state: string;
  pdf_generated: boolean;
  pdf_url: string | null;
  is_primary_submission: boolean;
}

interface AccountDetailTabsProps {
  submissions: FormSubmission[];
  properties: PropertyData[];
  owners: OwnerData[];
  assignments: AssignmentData[];
  payments: PaymentData[];
  activities: UserActivityData[];
}

export const AccountDetailTabs: React.FC<AccountDetailTabsProps> = ({
  submissions,
  properties,
  owners,
  assignments,
  payments,
  activities
}) => {
  const primarySubmissions = submissions.filter(s => s.is_primary_submission);
  const hasCompletedPrimarySubmission = primarySubmissions.some(s => s.state === 'completed');

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="submissions">
          Initial Setup ({primarySubmissions.length})
        </TabsTrigger>
        <TabsTrigger value="activities">
          Activities ({activities.length})
        </TabsTrigger>
        <TabsTrigger value="properties">
          Properties ({properties.length})
        </TabsTrigger>
        <TabsTrigger value="owners">
          Owners ({owners.length})
        </TabsTrigger>
        <TabsTrigger value="assignments">
          Assignments ({assignments.length})
        </TabsTrigger>
        <TabsTrigger value="payments">
          Payments ({payments.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-sm text-muted-foreground">Initial Setup</h3>
            <p className="text-2xl font-bold">{primarySubmissions.length}</p>
            <p className="text-xs text-muted-foreground">
              {hasCompletedPrimarySubmission ? 'Setup completed' : 'Setup pending'}
            </p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-sm text-muted-foreground">Properties</h3>
            <p className="text-2xl font-bold">{properties.length}</p>
            <p className="text-xs text-muted-foreground">Properties managed</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-sm text-muted-foreground">Owners</h3>
            <p className="text-2xl font-bold">{owners.length}</p>
            <p className="text-xs text-muted-foreground">Property owners</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-sm text-muted-foreground">Activities</h3>
            <p className="text-2xl font-bold">{activities.length}</p>
            <p className="text-xs text-muted-foreground">User actions recorded</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-sm text-muted-foreground">Account Status</h3>
            <div className="mt-2">
              {hasCompletedPrimarySubmission ? (
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Active User</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Setup In Progress</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold text-sm text-muted-foreground">Total Payments</h3>
            <p className="text-2xl font-bold">€{payments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{payments.length} payment(s)</p>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="submissions">
        <AccountSubmissionsTab submissions={submissions} />
      </TabsContent>
      
      <TabsContent value="activities">
        <AccountActivitiesTab activities={activities} />
      </TabsContent>
      
      <TabsContent value="properties">
        <AccountPropertiesTab properties={properties} />
      </TabsContent>
      
      <TabsContent value="owners">
        <AccountOwnersTab owners={owners} />
      </TabsContent>
      
      <TabsContent value="assignments">
        <AccountAssignmentsTab assignments={assignments} />
      </TabsContent>
      
      <TabsContent value="payments">
        <AccountPaymentsTab payments={payments} />
      </TabsContent>
    </Tabs>
  );
};
