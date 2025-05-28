
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Home, 
  Users, 
  Star, 
  CreditCard,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { UserActivityData } from '@/types/admin';

interface FormSubmission {
  id: string;
  submitted_at: string;
  state: string;
  pdf_generated: boolean;
  pdf_url: string | null;
  is_primary_submission: boolean;
}

interface TimelineEvent {
  id: string;
  type: 'submission' | 'activity' | 'milestone';
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  status?: 'completed' | 'pending' | 'error';
  action?: React.ReactNode;
  isPrimary?: boolean;
}

interface AccountTimelineTabProps {
  submissions: FormSubmission[];
  activities: UserActivityData[];
  accountCreatedAt: string;
  hasProperties: boolean;
  hasOwners: boolean;
  hasAssignments: boolean;
}

const getSubmissionIcon = (state: string) => {
  switch (state) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <FileText className="h-4 w-4 text-blue-600" />;
  }
};

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'property_added':
    case 'property_updated':
      return <Home className="h-4 w-4 text-green-600" />;
    case 'owner_added':
    case 'owner_updated':
      return <Users className="h-4 w-4 text-blue-600" />;
    case 'assignment_created':
    case 'assignment_updated':
      return <Activity className="h-4 w-4 text-purple-600" />;
    case 'profile_updated':
      return <Users className="h-4 w-4 text-orange-600" />;
    default:
      return <Activity className="h-4 w-4 text-gray-600" />;
  }
};

const getSubmissionStatus = (state: string): 'completed' | 'pending' | 'error' => {
  switch (state) {
    case 'completed':
      return 'completed';
    case 'error':
      return 'error';
    default:
      return 'pending';
  }
};

export const AccountTimelineTab: React.FC<AccountTimelineTabProps> = ({
  submissions,
  activities,
  accountCreatedAt,
  hasProperties,
  hasOwners,
  hasAssignments
}) => {
  const navigate = useNavigate();

  // Create timeline events from submissions and activities
  const timelineEvents: TimelineEvent[] = [
    // Account creation milestone
    {
      id: 'account-created',
      type: 'milestone' as const,
      title: 'Account Created',
      description: 'User registered on the platform',
      date: accountCreatedAt,
      icon: <Calendar className="h-4 w-4 text-blue-600" />,
      status: 'completed' as const
    },
    // Submissions
    ...submissions.map(submission => ({
      id: submission.id,
      type: 'submission' as const,
      title: submission.is_primary_submission ? 'Initial Setup Completed' : 'Additional Submission',
      description: `Form submission ${submission.state}${submission.pdf_generated ? ' (PDF generated)' : ''}`,
      date: submission.submitted_at,
      icon: submission.is_primary_submission ? <Star className="h-4 w-4 text-yellow-600" /> : getSubmissionIcon(submission.state),
      status: getSubmissionStatus(submission.state),
      isPrimary: submission.is_primary_submission,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/submissions/${submission.id}`)}
        >
          View Details
        </Button>
      )
    })),
    // Activities
    ...activities.slice(0, 10).map(activity => ({
      id: activity.id,
      type: 'activity' as const,
      title: activity.activity_type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      description: activity.activity_description || `${activity.entity_type || 'Entity'} ${activity.activity_type}`,
      date: activity.created_at,
      icon: getActivityIcon(activity.activity_type),
      status: 'completed' as const
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate completion milestones
  const milestones = [
    { key: 'account', label: 'Account Created', completed: true },
    { key: 'initial_setup', label: 'Initial Setup', completed: submissions.some(s => s.is_primary_submission && s.state === 'completed') },
    { key: 'properties', label: 'Properties Added', completed: hasProperties },
    { key: 'owners', label: 'Owners Added', completed: hasOwners },
    { key: 'assignments', label: 'Assignments Created', completed: hasAssignments }
  ];

  const completedMilestones = milestones.filter(m => m.completed).length;
  const completionPercentage = (completedMilestones / milestones.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Account Timeline
        </CardTitle>
        <CardDescription>
          Key events and milestones in the user's journey
        </CardDescription>
        
        {/* Progress Overview */}
        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Account Progress</span>
            <span className="text-sm text-muted-foreground">{completedMilestones}/{milestones.length} milestones</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="grid grid-cols-5 gap-1 text-xs">
            {milestones.map(milestone => (
              <div 
                key={milestone.key} 
                className={`text-center p-1 rounded ${
                  milestone.completed ? 'text-green-700 bg-green-50' : 'text-gray-500'
                }`}
              >
                {milestone.completed ? '✓' : '○'} {milestone.label}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {timelineEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-2">No Timeline Events</h3>
            <p className="text-sm">This user's timeline will appear here as they use the platform.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="flex gap-4 relative">
                {/* Timeline line */}
                {index < timelineEvents.length - 1 && (
                  <div className="absolute left-5 top-8 w-px h-12 bg-border" />
                )}
                
                {/* Event icon */}
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2
                  ${event.status === 'completed' ? 'bg-green-50 border-green-200' : 
                    event.status === 'error' ? 'bg-red-50 border-red-200' : 
                    'bg-blue-50 border-blue-200'}
                  ${event.isPrimary ? 'ring-2 ring-yellow-400' : ''}
                `}>
                  {event.icon}
                </div>
                
                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        {event.isPrimary && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            Primary
                          </Badge>
                        )}
                        {event.status && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              event.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                              event.status === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {event.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(event.date), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    {event.action && (
                      <div className="ml-4">
                        {event.action}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
