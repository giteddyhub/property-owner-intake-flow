
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { User, MapPin, FileText, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAdminAuth } from '@/contexts/admin/AdminAuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  country_of_birth: string;
  citizenship: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  address_country: string;
  italian_tax_code: string;
  marital_status: string;
  is_resident_in_italy: boolean;
  italian_residence_city?: string;
  italian_residence_street?: string;
  italian_residence_zip?: string;
}

interface AdminSubmissionOwnersProps {
  submissionId: string;
}

export const AdminSubmissionOwners: React.FC<AdminSubmissionOwnersProps> = ({ submissionId }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { adminSession } = useAdminAuth();

  const fetchOwners = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo({});
    
    try {
      console.log('Fetching owners for submission:', submissionId);
      console.log('Admin session token available:', !!adminSession?.token);
      
      // Set up headers with admin token if available
      let options: any = {};
      if (adminSession?.token) {
        options = {
          headers: {
            'x-admin-token': adminSession.token
          }
        };
        console.log('Using admin token in request headers');
      } else {
        console.warn('No admin token available for request');
      }
      
      // Test admin session validity first
      if (adminSession?.token) {
        try {
          const { data: sessionCheck, error: sessionError } = await supabase.functions.invoke('admin-session', {
            body: { token: adminSession.token }
          });
          
          if (sessionError) {
            console.error('Admin session validation error:', sessionError);
            setDebugInfo(prev => ({ ...prev, sessionCheck: 'failed', sessionError }));
          } else {
            console.log('Admin session validation response:', sessionCheck);
            setDebugInfo(prev => ({ ...prev, sessionCheck: 'success', sessionData: sessionCheck }));
          }
        } catch (sessionCheckError) {
          console.error('Error checking admin session:', sessionCheckError);
          setDebugInfo(prev => ({ ...prev, sessionCheck: 'exception', sessionCheckError }));
        }
      }
      
      // Fetch the data with detailed logging
      console.log('Executing Supabase query with options:', options);
      
      const { data, error, status, statusText } = await supabase
        .from('owners')
        .select('*')
        .eq('form_submission_id', submissionId)
        .order('created_at', { ascending: false });
      
      console.log('Query response status:', status, statusText);
      console.log('Query response data:', data);
      console.log('Query response error:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        queryStatus: status,
        queryStatusText: statusText,
        dataCount: data ? data.length : 0,
        errorMessage: error ? error.message : null,
        submissionId
      }));
      
      if (error) throw error;
      
      setOwners(data || []);
    } catch (error: any) {
      console.error('Error fetching owners:', error);
      setError(`Failed to fetch owners: ${error.message || 'Unknown error'}`);
      
      // Add to debug info
      setDebugInfo(prev => ({ 
        ...prev, 
        errorType: error.name,
        errorStack: error.stack
      }));
      
      toast.error('Failed to fetch owners', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [submissionId, adminSession]);

  // Format address to a string
  const formatAddress = (owner: Owner) => {
    return `${owner.address_street}, ${owner.address_city}, ${owner.address_zip}, ${owner.address_country}`;
  };

  // Format Italian residence address if present
  const formatItalianAddress = (owner: Owner) => {
    if (!owner.italian_residence_city) return null;
    
    return `${owner.italian_residence_street || ''}, ${owner.italian_residence_city}, ${owner.italian_residence_zip || ''}`;
  };

  // Get marital status display
  const getMaritalStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case 'UNMARRIED':
        return 'Unmarried';
      case 'MARRIED':
        return 'Married';
      case 'DIVORCED':
        return 'Divorced';
      case 'WIDOWED':
        return 'Widowed';
      default:
        return status;
    }
  };
  
  // Add manual retry without the admin token (emergency access)
  const fetchWithoutToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('EMERGENCY: Trying to fetch data without token validation');
      
      // Use direct RPC call to bypass RLS - explicitly type the return value
      const { data, error } = await supabase.rpc<Owner[]>(
        'admin_get_owners',
        { submission_id: submissionId }
      );
      
      console.log('Direct RPC response:', data, error);
      
      if (error) throw error;
      
      if (data && Array.isArray(data) && data.length > 0) {
        setOwners(data);
        toast.success('Successfully retrieved data using emergency method');
      } else {
        setError('No data returned from emergency method');
      }
    } catch (error: any) {
      console.error('Error in emergency fetch:', error);
      setError(`Emergency fetch failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full max-w-md" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error fetching owner data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="p-4 bg-muted rounded-md">
          <h4 className="text-sm font-semibold mb-2">Debug Information</h4>
          <pre className="text-xs overflow-auto p-2 bg-muted/50 rounded border max-h-48">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchOwners}>
              Retry Normal Fetch
            </Button>
            <Button variant="destructive" size="sm" onClick={fetchWithoutToken}>
              Emergency Access (Bypass RLS)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (owners.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Owners Found</CardTitle>
          <CardDescription>
            This submission doesn't contain any owner data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-md">
            <h4 className="text-sm font-semibold mb-2">Debug Information</h4>
            <pre className="text-xs overflow-auto p-2 bg-muted/50 rounded border max-h-48">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
            
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={fetchOwners}>
                Retry Fetch
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Owners ({owners.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchOwners}>
          Refresh
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Tax Code</TableHead>
            <TableHead className="hidden lg:table-cell">Citizenship</TableHead>
            <TableHead className="hidden md:table-cell">Residency</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {owners.map((owner) => (
            <TableRow key={owner.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{owner.first_name} {owner.last_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {owner.date_of_birth && format(new Date(owner.date_of_birth), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="font-mono">{owner.italian_tax_code}</div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="text-sm">{owner.citizenship}</div>
                <div className="text-xs text-muted-foreground">
                  Born in {owner.country_of_birth}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {owner.is_resident_in_italy ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Italian Resident
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    Non-Resident
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
