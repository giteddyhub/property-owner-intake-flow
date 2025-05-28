
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
    <Tabs defaultValue="submissions" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="submissions">Submissions</TabsTrigger>
        <TabsTrigger value="properties">Properties</TabsTrigger>
        <TabsTrigger value="owners">Owners</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
      </TabsList>
      
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
