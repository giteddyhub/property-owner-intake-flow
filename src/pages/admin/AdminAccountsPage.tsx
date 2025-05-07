
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
  Search, 
  RefreshCw,
  User,
  Mail,
  FileText,
  Home,
  Users as UsersIcon
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface AccountData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  submissions_count: number;
  properties_count: number;
  owners_count: number;
  is_admin?: boolean;
}

const AdminAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [adminUsers, setAdminUsers] = useState<string[]>([]);
  const navigate = useNavigate();

  // Fetch accounts with related data
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // First get all user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Fetch admin users to mark accounts with admin status
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id');
        
      if (adminError) throw adminError;
      
      const adminUserIds = adminData?.map(admin => admin.id) || [];
      setAdminUsers(adminUserIds);

      if (!profilesData || profilesData.length === 0) {
        setAccounts([]);
        setLoading(false);
        return;
      }

      // Fetch additional information for each account
      const enhancedAccounts = await Promise.all(
        profilesData.map(async (profile) => {
          // Count submissions
          const { count: submissionsCount } = await supabase
            .from('form_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          // Count properties
          const { count: propertiesCount } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          // Count owners
          const { count: ownersCount } = await supabase
            .from('owners')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          return {
            ...profile,
            submissions_count: submissionsCount || 0,
            properties_count: propertiesCount || 0,
            owners_count: ownersCount || 0,
            is_admin: adminUserIds.includes(profile.id)
          };
        })
      );
      
      setAccounts(enhancedAccounts);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch accounts data', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(account => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (account.full_name && account.full_name.toLowerCase().includes(query)) ||
        (account.email && account.email.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  // Handle view account details
  const handleViewAccount = (accountId: string) => {
    navigate(`/admin/accounts/${accountId}`);
  };

  return (
    <AdminLayout pageTitle="Accounts">
      <div className="space-y-6">
        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">User Accounts</h2>
            <p className="text-muted-foreground">View and manage all user accounts in the system.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
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
              onClick={fetchAccounts} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Account Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                  <p className="text-2xl font-bold">{accounts.length}</p>
                </div>
                <User className="h-8 w-8 text-muted-foreground opacity-70" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{accounts.reduce((sum, account) => sum + account.submissions_count, 0)}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground opacity-70" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-bold">{accounts.reduce((sum, account) => sum + account.properties_count, 0)}</p>
                </div>
                <Home className="h-8 w-8 text-muted-foreground opacity-70" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Owners</p>
                  <p className="text-2xl font-bold">{accounts.reduce((sum, account) => sum + account.owners_count, 0)}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-muted-foreground opacity-70" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Accounts Table */}
        <div className="bg-white rounded-md shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Account Created</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Activity</TableHead>
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
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-9 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No account records found.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="font-medium">{account.full_name || 'No Name'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{account.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {account.created_at ? format(new Date(account.created_at), 'MMM dd, yyyy') : 'Unknown'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {account.is_admin ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{account.submissions_count}</span>
                        </div>
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{account.properties_count}</span>
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{account.owners_count}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewAccount(account.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredAccounts.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredAccounts.length)} of {filteredAccounts.length} results
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

export default AdminAccountsPage;
