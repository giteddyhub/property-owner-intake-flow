
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, DollarSign, FileText } from 'lucide-react';
import { AccountData } from '@/types/admin';

interface AccountInfoCardProps {
  account: AccountData;
  submissionsCount: number;
  propertiesCount: number;
  ownersCount: number;
  paymentsCount: number;
  activitiesCount: number;
  hasCompletedSetup: boolean;
  totalPaymentAmount: number;
}

export const AccountInfoCard: React.FC<AccountInfoCardProps> = ({
  account,
  submissionsCount,
  propertiesCount,
  ownersCount,
  paymentsCount,
  activitiesCount,
  hasCompletedSetup,
  totalPaymentAmount
}) => {
  return (
    <div className="grid gap-6 mb-6">
      {/* Main Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Name</span>
              <p className="font-medium">{account.full_name || 'No Name'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              <p className="font-medium">{account.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Created</span>
              <p className="font-medium">{format(new Date(account.created_at), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <Badge variant={hasCompletedSetup ? "default" : "secondary"}>
                {hasCompletedSetup ? 'Active' : 'Setup Pending'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{propertiesCount}</p>
                <p className="text-xs text-muted-foreground">Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ownersCount}</p>
                <p className="text-xs text-muted-foreground">Owners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{submissionsCount}</p>
                <p className="text-xs text-muted-foreground">Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">€{totalPaymentAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{paymentsCount} Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
