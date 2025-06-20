
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity,
  FileText, 
  Home, 
  Users, 
  DollarSign,
  Calendar
} from 'lucide-react';
import { UserDataSummary } from '@/hooks/admin/useAdvancedUserManagement';

interface DataSummaryCardProps {
  dataSummary: UserDataSummary;
}

export const DataSummaryCard: React.FC<DataSummaryCardProps> = ({ dataSummary }) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0.00';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-orange-700">
          <Activity className="h-4 w-4" />
          Data to be Permanently Deleted
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <Home className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-xl font-bold text-red-600">{dataSummary.properties_count}</p>
              <p className="text-muted-foreground">Properties</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <Users className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-xl font-bold text-red-600">{dataSummary.owners_count}</p>
              <p className="text-muted-foreground">Owners</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <FileText className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-xl font-bold text-red-600">{dataSummary.submissions_count}</p>
              <p className="text-muted-foreground">Submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <Activity className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-xl font-bold text-red-600">{dataSummary.assignments_count}</p>
              <p className="text-muted-foreground">Assignments</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-xl font-bold text-red-600">{formatCurrency(dataSummary.total_revenue)}</p>
              <p className="text-muted-foreground">Revenue</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <Calendar className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-xl font-bold text-red-600">{dataSummary.activities_count}</p>
              <p className="text-muted-foreground">Activities</p>
            </div>
          </div>
        </div>
        {dataSummary.last_login && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Last Login: {new Date(dataSummary.last_login).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
