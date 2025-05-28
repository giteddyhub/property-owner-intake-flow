
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminAnalytics } from '@/hooks/admin/useAdminAnalytics';
import { Users, Home, ClipboardList, FileText, TrendingUp, UserCheck } from 'lucide-react';

interface AdminAnalyticsCardsProps {
  analytics: AdminAnalytics;
}

export const AdminAnalyticsCards: React.FC<AdminAnalyticsCardsProps> = ({ analytics }) => {
  const cards = [
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      icon: <Users className="h-6 w-6 text-primary" />,
      change: `+${analytics.newUsersThisMonth} this month`
    },
    {
      title: 'Active Users',
      value: analytics.activeUsers,
      icon: <UserCheck className="h-6 w-6 text-green-600" />,
      change: `${Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}% of total`
    },
    {
      title: 'Properties',
      value: analytics.totalProperties,
      icon: <Home className="h-6 w-6 text-blue-600" />,
      change: 'Registered properties'
    },
    {
      title: 'Submissions',
      value: analytics.totalSubmissions,
      icon: <ClipboardList className="h-6 w-6 text-purple-600" />,
      change: `${analytics.completedSubmissions} completed`
    },
    {
      title: 'Owners',
      value: analytics.totalOwners,
      icon: <FileText className="h-6 w-6 text-orange-600" />,
      change: 'Property owners'
    },
    {
      title: 'Growth Rate',
      value: `${Math.round((analytics.newUsersThisMonth / analytics.totalUsers) * 100)}%`,
      icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
      change: 'Monthly growth'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                <h2 className="text-3xl font-bold">{card.value}</h2>
                <p className="text-xs text-muted-foreground mt-1">{card.change}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
