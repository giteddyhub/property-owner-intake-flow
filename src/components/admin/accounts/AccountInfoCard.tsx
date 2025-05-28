
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
  CreditCard,
  CheckCircle,
  AlertCircle
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
  // Determine account completion status
  const hasBasicInfo = account.full_name && account.email;
  const hasProperties = propertiesCount > 0;
  const hasOwners = ownersCount > 0;
  const hasSubmissions = submissionsCount > 0;
  
  const completionScore = [hasBasicInfo, hasProperties, hasOwners, hasSubmissions].filter(Boolean).length;
  const completionPercentage = (completionScore / 4) * 100;
  
  const getCompletionStatus = () => {
    if (completionPercentage === 100) return { icon: CheckCircle, text: 'Complete', color: 'text-green-600' };
    if (completionPercentage >= 75) return { icon: CheckCircle, text: 'Nearly Complete', color: 'text-blue-600' };
    if (completionPercentage >= 50) return { icon: AlertCircle, text: 'In Progress', color: 'text-yellow-600' };
    return { icon: AlertCircle, text: 'Getting Started', color: 'text-orange-600' };
  };
  
  const completionStatus = getCompletionStatus();
  const CompletionIcon = completionStatus.icon;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Detailed information about this user account and their progress</CardDescription>
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
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <div>
                    {account.is_admin ? (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">Admin User</Badge>
                    ) : (
                      <Badge variant="outline">Regular User</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CompletionIcon className={`h-5 w-5 mt-0.5 ${completionStatus.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">Account Completion</p>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${completionStatus.color}`}>
                      {completionStatus.text}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({completionPercentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${completionPercentage}%` }}
                    />
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
                  <p className="text-sm text-muted-foreground">Account Activity Summary</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center bg-muted/30 p-2 rounded">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{submissionsCount}</div>
                        <div className="text-xs text-muted-foreground">Forms</div>
                      </div>
                    </div>
                    <div className="flex items-center bg-muted/30 p-2 rounded">
                      <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{propertiesCount}</div>
                        <div className="text-xs text-muted-foreground">Properties</div>
                      </div>
                    </div>
                    <div className="flex items-center bg-muted/30 p-2 rounded">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{ownersCount}</div>
                        <div className="text-xs text-muted-foreground">Owners</div>
                      </div>
                    </div>
                    <div className="flex items-center bg-muted/30 p-2 rounded">
                      <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{paymentsCount}</div>
                        <div className="text-xs text-muted-foreground">Payments</div>
                      </div>
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
