
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  TableFooter
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  FileText, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  FileDown
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface FormSubmission {
  id: string;
  user_id: string | null;
  state: string;
  submitted_at: string;
  pdf_generated: boolean;
  pdf_url: string | null;
  has_document_retrieval: boolean;
  user_email?: string;
  user_name?: string;
  properties_count?: number;
  owners_count?: number;
  assignments_count?: number;
}

const AdminSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Fetch submissions with related data
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // First get all submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('form_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (submissionsError) {
        throw submissionsError;
      }

      if (!submissionsData || submissionsData.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }

      // Fetch additional information for each submission
      const enhancedSubmissions = await Promise.all(
        submissionsData.map(async (submission) => {
          // Get user information if user_id exists
          let userEmail = 'Unknown';
          let userName = 'Unknown';
          
          if (submission.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', submission.user_id)
              .single();
              
            if (userData) {
              userEmail = userData.email;
              userName = userData.full_name || 'Unknown';
            }
          }
          
          // Count properties
          const { count: propertiesCount } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('form_submission_id', submission.id);
          
          // Count owners
          const { count: ownersCount } = await supabase
            .from('owners')
            .select('*', { count: 'exact', head: true })
            .eq('form_submission_id', submission.id);
          
          // Count assignments
          const { count: assignmentsCount } = await supabase
            .from('owner_property_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('form_submission_id', submission.id);
          
          return {
            ...submission,
            user_email: userEmail,
            user_name: userName,
            properties_count: propertiesCount || 0,
            owners_count: ownersCount || 0,
            assignments_count: assignmentsCount || 0
          };
        })
      );
      
      setSubmissions(enhancedSubmissions);
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch submissions', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Filter submissions based on status filter and search query
  const filteredSubmissions = submissions.filter(submission => {
    // Apply status filter
    if (statusFilter !== 'all' && submission.state !== statusFilter) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        submission.id.toLowerCase().includes(query) ||
        (submission.user_email && submission.user_email.toLowerCase().includes(query)) ||
        (submission.user_name && submission.user_name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  // Handle view submission details
  const handleViewSubmission = (submissionId: string) => {
    navigate(`/admin/submissions/${submissionId}`);
  };

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return { color: 'text-blue-700 bg-blue-100', icon: <Clock className="h-4 w-4 mr-1" /> };
      case 'processing':
        return { color: 'text-yellow-700 bg-yellow-100', icon: <RefreshCw className="h-4 w-4 mr-1" /> };
      case 'completed':
        return { color: 'text-green-700 bg-green-100', icon: <CheckCircle2 className="h-4 w-4 mr-1" /> };
      case 'error':
        return { color: 'text-red-700 bg-red-100', icon: <AlertTriangle className="h-4 w-4 mr-1" /> };
      default:
        return { color: 'text-gray-700 bg-gray-100', icon: <FileText className="h-4 w-4 mr-1" /> };
    }
  };

  return (
    <AdminLayout pageTitle="Submissions">
      <div className="space-y-6">
        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="w-full md:w-auto">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={fetchSubmissions} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Submission Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {submissions.filter(s => s.state === 'new').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {submissions.filter(s => s.state === 'processing').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.state === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Submissions Table */}
        <div className="bg-white rounded-md shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submission ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Content</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((submission) => {
                  const statusBadge = getStatusBadge(submission.state);
                  return (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-xs">
                        {submission.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{submission.user_name}</div>
                        <div className="text-sm text-muted-foreground">{submission.user_email}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(submission.submitted_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.icon}
                          <span>{submission.state}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex space-x-2">
                          <span className="inline-flex items-center text-xs">
                            <span className="font-medium">{submission.properties_count || 0}</span>
                            <span className="ml-1 text-muted-foreground">properties</span>
                          </span>
                          <span className="inline-flex items-center text-xs">
                            <span className="font-medium">{submission.owners_count || 0}</span>
                            <span className="ml-1 text-muted-foreground">owners</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewSubmission(submission.id)}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredSubmissions.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredSubmissions.length)} of {filteredSubmissions.length} results
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissionsPage;
