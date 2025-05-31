
import React from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
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
  is_primary_submission: boolean;
}

interface AccountDetailTabsProps {
  account: {
    created_at: string;
  };
  submissions: FormSubmission[];
  properties: PropertyData[];
  owners: OwnerData[];
  assignments: AssignmentData[];
  payments: PaymentData[];
  activities: any[];
}

export const AccountDetailTabs: React.FC<AccountDetailTabsProps> = ({
  account,
  submissions,
  properties,
  owners,
  assignments,
  payments,
  activities
}) => {
  console.log(`[AccountDetailTabs] Received payments:`, payments);
  console.log(`[AccountDetailTabs] Payments length:`, payments.length);
  
  return (
    <Tabs defaultValue="properties" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
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
