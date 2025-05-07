
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  ArrowLeft,
  User,
  Calendar,
  Mail,
  Clock,
  FileText,
  Home,
  Users as UsersIcon,
  ListChecks,
  ShieldCheck,
  Shield,
  CreditCard
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PaymentData } from '@/types/admin';

interface AccountDetails {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
}

interface FormSubmission {
  id: string;
  submitted_at: string;
  state: string;
  pdf_generated: boolean;
  pdf_url: string | null;
}

interface Property {
  id: string;
  label: string;
  property_type: string;
  address_comune: string;
  address_zip: string;
  created_at: string;
}

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  italian_tax_code: string;
  is_resident_in_italy: boolean;
  created_at: string;
}

interface Assignment {
  id: string;
  property_id: string;
  owner_id: string;
  ownership_percentage: number;
  resident_at_property: boolean;
  property_label: string;
  owner_name: string;
  created_at: string;
}

const AdminAccountDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [confirmAdminToggle, setConfirmAdminToggle] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchAccountDetails = async () => {
      setLoading(true);
      try {
        console.log(`Fetching account details for ID: ${id}`);
        
        // Fetch the account details
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw profileError;
        }
        
        if (!profile) {
          toast.error('Account not found');
          navigate('/admin/accounts');
          return;
        }

        console.log('Profile data:', profile);

        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (adminError) {
          console.error('Error checking admin status:', adminError);
        }
        
        console.log('Admin data:', adminData);
          
        // Fetch submissions - use direct service role for admin functionality
        // Filter out tax_filing_init submissions as they're tracked in the Payments tab
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('form_submissions')
          .select('*')
          .eq('user_id', id)
          .neq('state', 'tax_filing_init')  // Exclude tax_filing_init entries
          .order('submitted_at', { ascending: false });
          
        if (submissionsError) {
          console.error('Error fetching submissions:', submissionsError);
          throw submissionsError;
        }
        
        console.log(`Fetched ${submissionsData?.length || 0} submissions`);
        
        // Fetch properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false });
          
        if (propertiesError) {
          console.error('Error fetching properties:', propertiesError);
          throw propertiesError;
        }
        
        console.log(`Fetched ${propertiesData?.length || 0} properties`);
        
        // Fetch owners
        const { data: ownersData, error: ownersError } = await supabase
          .from('owners')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: false });
          
        if (ownersError) {
          console.error('Error fetching owners:', ownersError);
          throw ownersError;
        }
        
        console.log(`Fetched ${ownersData?.length || 0} owners`);
        
        // Fetch assignments with property and owner details
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('owner_property_assignments')
          .select(`
            *,
            properties:property_id (label),
            owners:owner_id (first_name, last_name)
          `)
          .eq('user_id', id)
          .order('created_at', { ascending: false });
          
        if (assignmentsError) {
          console.error('Error fetching assignments:', assignmentsError);
          throw assignmentsError;
        }
        
        console.log(`Fetched ${assignmentsData?.length || 0} assignments`);
        
        // First fetch contact ID for the user
        const { data: contactData, error: contactError } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', id)
          .limit(1);
          
        if (contactError) {
          console.error('Error fetching contact ID:', contactError);
          throw contactError;
        }
        
        let paymentsData = [];
        
        // If contact ID is found, fetch payments data
        if (contactData && contactData.length > 0) {
          const contactId = contactData[0].id;
          
          const { data: fetchedPayments, error: paymentsError } = await supabase
            .from('purchases')
            .select(`
              *,
              form_submissions:form_submission_id (state)
            `)
            .eq('contact_id', contactId)
            .order('created_at', { ascending: false });
            
          if (paymentsError) {
            console.error('Error fetching payments:', paymentsError);
            throw paymentsError;
          }
          
          paymentsData = fetchedPayments || [];
          console.log(`Fetched ${paymentsData.length} payments`);
        } else {
          console.log('No contact found for this user, payments will be empty');
        }
        
        const enhancedAssignments = assignmentsData?.map(assignment => ({
          ...assignment,
          property_label: assignment.properties?.label || 'Unknown Property',
          owner_name: assignment.owners ? 
            `${assignment.owners.first_name} ${assignment.owners.last_name}` : 'Unknown Owner'
        })) || [];
        
        setAccount({
          ...profile,
          is_admin: !!adminData
        });
        setSubmissions(submissionsData || []);
        setProperties(propertiesData || []);
        setOwners(ownersData || []);
        setAssignments(enhancedAssignments);
        setPayments(paymentsData);
      } catch (error: any) {
        console.error('Error fetching account details:', error);
        toast.error('Failed to load account details', {
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccountDetails();
  }, [id, navigate]);

  const handleToggleAdmin = async () => {
    if (!account) return;
    
    try {
      if (account.is_admin) {
        // Remove admin privileges
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', account.id);
          
        if (error) throw error;
        
        setAccount({ ...account, is_admin: false });
        toast.success('Admin privileges removed');
      } else {
        // Grant admin privileges
        const { error } = await supabase
          .from('admin_users')
          .insert([{ id: account.id }]);
          
        if (error) throw error;
        
        setAccount({ ...account, is_admin: true });
        toast.success('Admin privileges granted');
      }
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update admin status');
    } finally {
      setConfirmAdminToggle(false);
    }
  };

  const goToSubmission = (submissionId: string) => {
    navigate(`/admin/submissions/${submissionId}`);
  };

  const formatCurrency = (amount: number, currency: string = 'eur') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase() || 'EUR',
    });
    
    return formatter.format(amount);
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Account Details">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/accounts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Accounts
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle><Skeleton className="h-8 w-48" /></CardTitle>
              <CardDescription><Skeleton className="h-4 w-64" /></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!account) {
    return (
      <AdminLayout pageTitle="Account Not Found">
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Account Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested account could not be found.</p>
            <Button onClick={() => navigate('/admin/accounts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Accounts
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle={`Account: ${account.full_name || account.email}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/accounts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
          
          <Dialog open={confirmAdminToggle} onOpenChange={setConfirmAdminToggle}>
            <DialogTrigger asChild>
              <Button 
                variant={account.is_admin ? "outline" : "default"}
                size="sm"
              >
                {account.is_admin ? (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Remove Admin Status
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Make Admin
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {account.is_admin 
                    ? "Remove Admin Privileges" 
                    : "Grant Admin Privileges"}
                </DialogTitle>
                <DialogDescription>
                  {account.is_admin 
                    ? `Are you sure you want to remove admin privileges from ${account.full_name || account.email}?` 
                    : `Are you sure you want to grant admin privileges to ${account.full_name || account.email}?`}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmAdminToggle(false)}>Cancel</Button>
                <Button 
                  variant={account.is_admin ? "destructive" : "default"}
                  onClick={handleToggleAdmin}
                >
                  {account.is_admin ? "Remove Admin" : "Grant Admin"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
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
                    <ListChecks className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Account Activity</p>
                      <div className="flex space-x-3 mt-1">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{submissions.length} submissions</span>
                        </div>
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{properties.length} properties</span>
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{owners.length} owners</span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{payments.length} payments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="owners">Owners</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>
                  {submissions.length === 0 
                    ? 'This user has no submissions.' 
                    : `${submissions.length} submission(s) found for this user.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No submissions found for this user.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>PDF</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map(submission => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-mono text-xs">{submission.id.substring(0, 8)}...</TableCell>
                          <TableCell>{format(new Date(submission.submitted_at), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                submission.state === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                submission.state === 'processing' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                submission.state === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }
                            >
                              {submission.state}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {submission.pdf_generated ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Generated
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                Not Generated
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToSubmission(submission.id)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>
                  {properties.length === 0 
                    ? 'This user has no properties.' 
                    : `${properties.length} properties found for this user.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {properties.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No properties found for this user.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.map(property => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">{property.label}</TableCell>
                          <TableCell>{property.property_type}</TableCell>
                          <TableCell>{property.address_comune}, {property.address_zip}</TableCell>
                          <TableCell>{format(new Date(property.created_at), 'MMM dd, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="owners">
            <Card>
              <CardHeader>
                <CardTitle>Owners</CardTitle>
                <CardDescription>
                  {owners.length === 0 
                    ? 'This user has no owners registered.' 
                    : `${owners.length} owners found for this user.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {owners.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No owners found for this user.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Tax Code</TableHead>
                        <TableHead>Resident in Italy</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {owners.map(owner => (
                        <TableRow key={owner.id}>
                          <TableCell className="font-medium">
                            {owner.first_name} {owner.last_name}
                          </TableCell>
                          <TableCell>{owner.italian_tax_code}</TableCell>
                          <TableCell>
                            {owner.is_resident_in_italy ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{format(new Date(owner.created_at), 'MMM dd, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Property-Owner Assignments</CardTitle>
                <CardDescription>
                  {assignments.length === 0 
                    ? 'This user has no property-owner assignments.' 
                    : `${assignments.length} assignments found for this user.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No property-owner assignments found for this user.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Ownership %</TableHead>
                        <TableHead>Resident</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map(assignment => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.property_label}</TableCell>
                          <TableCell>{assignment.owner_name}</TableCell>
                          <TableCell>{assignment.ownership_percentage}%</TableCell>
                          <TableCell>
                            {assignment.resident_at_property ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{format(new Date(assignment.created_at), 'MMM dd, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>
                  {payments.length === 0 
                    ? 'This user has no payment records.' 
                    : `${payments.length} payment(s) found for this user.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No payment records found for this user.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Document Retrieval</TableHead>
                        <TableHead>Stripe ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map(payment => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getPaymentStatusBadgeClass(payment.payment_status)}
                            >
                              {payment.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.has_document_retrieval ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Included
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                Not Included
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.stripe_payment_id 
                              ? payment.stripe_payment_id.substring(0, 12) + '...' 
                              : 'None'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAccountDetailPage;
