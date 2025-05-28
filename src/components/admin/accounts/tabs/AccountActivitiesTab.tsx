
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, FileText, Home, Users, UserPlus, Plus } from 'lucide-react';
import { UserActivityData } from '@/types/admin';

interface AccountActivitiesTabProps {
  activities: UserActivityData[];
}

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'property_added':
    case 'property_updated':
      return <Home className="h-4 w-4" />;
    case 'owner_added':
    case 'owner_updated':
      return <UserPlus className="h-4 w-4" />;
    case 'assignment_created':
    case 'assignment_updated':
      return <Users className="h-4 w-4" />;
    case 'submission_created':
    case 'submission_updated':
      return <FileText className="h-4 w-4" />;
    case 'profile_updated':
      return <UserPlus className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActivityColor = (activityType: string) => {
  switch (activityType) {
    case 'property_added':
    case 'owner_added':
    case 'assignment_created':
    case 'submission_created':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'property_updated':
    case 'owner_updated':
    case 'assignment_updated':
    case 'submission_updated':
    case 'profile_updated':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const formatActivityType = (activityType: string) => {
  return activityType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const AccountActivitiesTab: React.FC<AccountActivitiesTabProps> = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          User Activities
        </CardTitle>
        <CardDescription>
          {activities.length === 0 
            ? 'No activities recorded for this user yet.' 
            : `${activities.length} activity record(s) showing user actions and system events.`}
        </CardDescription>
        <div className="bg-muted/30 p-3 rounded-lg text-sm">
          <strong>Note:</strong> Activities represent all user actions after their initial registration, 
          including adding properties, owners, assignments, and profile updates. This provides a complete 
          audit trail of user engagement with the platform.
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-2">No Activities Yet</h3>
            <p className="text-sm">This user hasn't performed any tracked activities yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.activity_type)}
                      <Badge
                        variant="outline"
                        className={getActivityColor(activity.activity_type)}
                      >
                        {formatActivityType(activity.activity_type)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {activity.activity_description || 'No description available'}
                  </TableCell>
                  <TableCell>
                    {activity.entity_type ? (
                      <Badge variant="outline" className="bg-muted text-muted-foreground">
                        {activity.entity_type}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {Object.keys(activity.metadata).length > 0 ? (
                      <details className="cursor-pointer">
                        <summary className="text-sm text-blue-600 hover:text-blue-800">
                          View metadata
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-w-xs">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
