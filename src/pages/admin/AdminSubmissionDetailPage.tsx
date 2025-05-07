import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  RefreshCw,
  User,
  Home,
  LinkIcon,
  Download,
  CalendarIcon,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AdminSubmissionProperties } from '@/components/admin/submissions/AdminSubmissionProperties';
import { AdminSubmissionOwners } from '@/components/admin/submissions/AdminSubmissionOwners';
import { AdminSubmissionAssignments } from '@/components/admin/submissions/AdminSubmissionAssignments';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormSubmission {
  id: string;
  user_id: string | null;
  state: string;
  submitted_at: string;
  pdf_generated: boolean;
  pdf_url: string | null;
  has_document_retrieval: boolean;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

const AdminSubmissionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch submission details
        const { data: submissionData, error: submissionError } = await supabase
          .from('form_submissions')
          .select('*')
          .eq('id', id)
          .single();
        
        if (submissionError) throw submissionError;
        if (!submissionData) throw new Error('Submission not found');
        
        setSubmission(submissionData);
        
        // Fetch user profile if user_id exists
        if (submissionData.user_id) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', submissionData.user_id)
            .single();
          
          if (!userError && userData) {
            setUserProfile(userData);
          }
        }
      } catch (error: any) {
        console.error('Error fetching submission details:', error);
        toast.error('Failed to load submission details', {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissionDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!submission) return;
    
    setStatusUpdating(true);
    try {
      const { error } = await supabase
        .from('form_submissions')
        .update({ state: newStatus })
        .eq('id', submission.id);
      
      if (error) throw error;
      
      setSubmission({
        ...submission,
        state: newStatus
      });
      
      toast.success('Submission status updated successfully');
    } catch (error: any) {
      console.error('Error updating submission status:', error);
      toast.error('Failed to update submission status', {
        description: error.message
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!submission) return;
    
    setLoading(true);
    try {
      // First, delete all related records in the correct order to avoid foreign key constraints
      
      // 1. Delete owner-property assignments related to this submission
      const { error: assignmentsError } = await supabase
        .from('owner_property_assignments')
        .delete()
        .eq('form_submission_id', submission.id);
      
      if (assignmentsError) {
        console.error('Error deleting related assignments:', assignmentsError);
        toast.error('Failed to delete related assignments');
        setLoading(false);
        return;
      }
      
      // 2. Delete owners related to this submission
      const { error: ownersError } = await supabase
        .from('owners')
        .delete()
        .eq('form_submission_id', submission.id);
      
      if (ownersError) {
        console.error('Error deleting related owners:', ownersError);
        toast.error('Failed to delete related owners');
        setLoading(false);
        return;
      }
      
      // 3. Delete properties related to this submission
      const { error: propertiesError } = await supabase
        .from('properties')
        .delete()
        .eq('form_submission_id', submission.id);
      
      if (propertiesError) {
        console.error('Error deleting related properties:', propertiesError);
        toast.error('Failed to delete related properties');
        setLoading(false);
        return;
      }

      // 4. Delete any purchase records related to this submission
      const { error: purchasesError } = await supabase
        .from('purchases')
        .delete()
        .eq('form_submission_id', submission.id);
      
      if (purchasesError) {
        console.error('Error deleting related purchases:', purchasesError);
        toast.warning('Could not delete some related purchase records');
        // Continue with deletion even if purchase deletion fails
      }
      
      // 5. Finally, delete the submission itself
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', submission.id);
      
      if (submissionError) {
        throw submissionError;
      }
      
      toast.success('Submission deleted successfully');
      navigate('/admin/submissions');
    } catch (error: any) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return { color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-4 w-4 mr-1" /> };
      case 'processing':
        return { color: 'bg-yellow-100 text-yellow-700', icon: <RefreshCw className="h-4 w-4 mr-1" /> };
      case 'completed':
        return { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-4 w-4 mr-1" /> };
      case 'error':
        return { color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="h-4 w-4 mr-1" /> };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-4 w-4 mr-1" /> };
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Submission Details">
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </AdminLayout>
    );
  }

  if (!submission) {
    return (
      <AdminLayout pageTitle="Submission Details">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Submission Not Found</h2>
          <p className="text-muted-foreground mb-6">The submission you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/admin/submissions')}>Return to Submissions</Button>
        </div>
      </AdminLayout>
    );
  }

  const statusBadge = getStatusBadge(submission.state);

  return (
    <AdminLayout pageTitle={`Submission Details - ${id?.substring(0, 8)}...`}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/submissions">Submissions</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{id?.substring(0, 8)}...</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Submission Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Submission {id?.substring(0, 8)}...
            </h1>
            <p className="text-sm text-muted-foreground">
              Submitted on {format(new Date(submission.submitted_at), 'MMMM dd, yyyy')} at {format(new Date(submission.submitted_at), 'HH:mm:ss')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Status Update Dropdown */}
            <Select
              value={submission.state}
              onValueChange={handleUpdateStatus}
              disabled={statusUpdating}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Download PDF Button */}
            {submission.pdf_url && (
              <Button variant="outline" asChild>
                <a href={submission.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            )}
            
            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete this submission and all associated data.
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSubmission}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
            {statusBadge.icon}
            <span className="capitalize">{submission.state}</span>
          </div>
          {submission.has_document_retrieval && (
            <Badge className="ml-2 bg-purple-100 text-purple-700 hover:bg-purple-100">
              Document Retrieval
            </Badge>
          )}
        </div>

        {/* User Info Card */}
        {userProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{userProfile.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{userProfile.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">{format(new Date(userProfile.created_at), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" onClick={() => navigate(`/admin/users/${userProfile.id}`)}>
                <User className="h-4 w-4 mr-2" />
                View User Profile
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Tabs for Submission Data */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="owners">Owners</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="properties" className="space-y-4">
              <AdminSubmissionProperties submissionId={submission.id} />
            </TabsContent>
            
            <TabsContent value="owners" className="space-y-4">
              <AdminSubmissionOwners submissionId={submission.id} />
            </TabsContent>
            
            <TabsContent value="assignments" className="space-y-4">
              <AdminSubmissionAssignments submissionId={submission.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissionDetailPage;
