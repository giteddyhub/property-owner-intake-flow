
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Calendar,
  Clock,
  FileText,
  Home,
  Users,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface AccountInfoCardProps {
  account: {
    full_name: string;
    email: string;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
  };
  submissionsCount: number;
  propertiesCount: number;
  ownersCount: number;
  paymentsCount: number;
}

export const AccountInfoCard: React.FC<AccountInfoCardProps> = ({
  account,
  submissionsCount,
  propertiesCount,
  ownersCount,
  paymentsCount
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Detailed information about this user account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{account.full_name || 'No name provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{account.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <div>
                    {account.is_admin ? (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">Admin User</Badge>
                    ) : (
                      <Badge variant="outline">Regular User</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Account Created</p>
                  <p className="font-medium">
                    {account.created_at ? format(new Date(account.created_at), 'MMMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {account.updated_at ? format(new Date(account.updated_at), 'MMMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Account Activity</p>
                  <div className="flex space-x-3 mt-1">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{submissionsCount} submissions</span>
                    </div>
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{propertiesCount} properties</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{ownersCount} owners</span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{paymentsCount} payments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
