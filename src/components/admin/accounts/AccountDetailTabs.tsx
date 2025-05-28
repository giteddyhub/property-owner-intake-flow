
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
import { OwnerData, PropertyData, AssignmentData, PaymentData } from '@/types/admin';

interface FormSubmission {
  id: string;
  submitted_at: string;
  state: string;
  pdf_generated: boolean;
  pdf_url: string | null;
}

interface AccountDetailTabsProps {
  submissions: FormSubmission[];
  properties: PropertyData[];
  owners: OwnerData[];
  assignments: AssignmentData[];
  payments: PaymentData[];
}

export const AccountDetailTabs: React.FC<AccountDetailTabsProps> = ({
  submissions,
  properties,
  owners,
  assignments,
  payments
}) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="submissions">
          Form Submissions ({submissions.length})
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
            <h3 className="font-semibold text-sm text-muted-foreground">Form Submissions</h3>
            <p className="text-2xl font-bold">{submissions.length}</p>
            <p className="text-xs text-muted-foreground">
              {submissions.filter(s => s.state === 'completed').length} completed
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
            <h3 className="font-semibold text-sm text-muted-foreground">Payments</h3>
            <p className="text-2xl font-bold">{payments.length}</p>
            <p className="text-xs text-muted-foreground">
              €{payments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toFixed(2)} total
            </p>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="submissions">
        <AccountSubmissionsTab submissions={submissions} />
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
