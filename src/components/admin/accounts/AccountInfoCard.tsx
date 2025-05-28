
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
  AlertCircle,
  TrendingUp,
  Activity
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
  // Determine account completion status
  const hasBasicInfo = account.full_name && account.email;
  const hasProperties = propertiesCount > 0;
  const hasOwners = ownersCount > 0;
  const hasActivities = activitiesCount > 0;
  
  const completionItems = [
    { key: 'basic', label: 'Profile Information', completed: hasBasicInfo },
    { key: 'setup', label: 'Initial Setup', completed: hasCompletedSetup },
    { key: 'properties', label: 'Properties Added', completed: hasProperties },
    { key: 'owners', label: 'Owners Added', completed: hasOwners },
    { key: 'active', label: 'Platform Activity', completed: hasActivities }
  ];
  
  const completedItems = completionItems.filter(item => item.completed).length;
  const completionPercentage = (completedItems / completionItems.length) * 100;
  
  const getCompletionStatus = () => {
    if (completionPercentage === 100) return { 
      icon: CheckCircle, 
      text: 'Fully Active', 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
    if (completionPercentage >= 80) return { 
      icon: CheckCircle, 
      text: 'Nearly Complete', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    };
    if (completionPercentage >= 40) return { 
      icon: Activity, 
      text: 'Active User', 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    };
    return { 
      icon: AlertCircle, 
      text: 'Getting Started', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    };
  };
  
  const completionStatus = getCompletionStatus();
  const CompletionIcon = completionStatus.icon;

  // Calculate engagement score
  const engagementScore = Math.min(100, (activitiesCount * 5) + (propertiesCount * 10) + (ownersCount * 8));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Complete profile and activity overview for this user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <User className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{account.full_name || 'No name provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{account.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <ShieldCheck className="h-4 w-4 text-muted-foreground mt-1" />
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

              <div className="flex items-start space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {account.created_at ? format(new Date(account.created_at), 'MMMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CompletionIcon className={`h-5 w-5 ${completionStatus.color}`} />
              Account Status
            </h3>

            <div className={`p-4 rounded-lg border ${completionStatus.bgColor} ${completionStatus.borderColor}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-medium ${completionStatus.color}`}>
                  {completionStatus.text}
                </span>
                <span className="text-sm text-muted-foreground">
                  {completedItems}/{completionItems.length} complete
                </span>
              </div>
              
              <div className="w-full bg-white/50 rounded-full h-2 mb-3">
                <div 
                  className="bg-current h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              
              <div className="space-y-1">
                {completionItems.map(item => (
                  <div key={item.key} className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={item.completed ? 'text-green-700' : 'text-gray-600'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement Score */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement Score</span>
                <span className="text-lg font-bold text-blue-600">{engagementScore}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${engagementScore}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Activity Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Forms</span>
                </div>
                <div className="text-xl font-bold text-blue-700">{submissionsCount}</div>
                <div className="text-xs text-blue-600">
                  {hasCompletedSetup ? 'Setup complete' : 'Setup pending'}
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Home className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Properties</span>
                </div>
                <div className="text-xl font-bold text-green-700">{propertiesCount}</div>
                <div className="text-xs text-green-600">Properties managed</div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Owners</span>
                </div>
                <div className="text-xl font-bold text-purple-700">{ownersCount}</div>
                <div className="text-xs text-purple-600">Property owners</div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Activities</span>
                </div>
                <div className="text-xl font-bold text-orange-700">{activitiesCount}</div>
                <div className="text-xs text-orange-600">User actions</div>
              </div>
            </div>

            {/* Payment Summary */}
            {paymentsCount > 0 && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Payment Summary</span>
                </div>
                <div className="text-2xl font-bold text-emerald-700">€{totalPaymentAmount.toFixed(2)}</div>
                <div className="text-xs text-emerald-600">{paymentsCount} payment(s) completed</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
