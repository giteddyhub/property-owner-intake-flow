
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
import { FileText, AlertTriangle, Home } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Property {
  id: string;
  label: string;
  property_type: string;
  address_comune: string;
  address_province: string;
  address_street: string;
  address_zip: string;
  purchase_date: string | null;
  sale_date: string | null;
  activity_2024: string;
  remodeling: boolean;
  rental_income: number | null;
  use_document_retrieval_service: boolean;
}

interface AdminSubmissionPropertiesProps {
  submissionId: string;
}

export const AdminSubmissionProperties: React.FC<AdminSubmissionPropertiesProps> = ({ submissionId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('form_submission_id', submissionId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProperties(data || []);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [submissionId]);

  // Format address to a string
  const formatAddress = (property: Property) => {
    return `${property.address_street}, ${property.address_comune}, ${property.address_province}, ${property.address_zip}`;
  };

  // Get property type badge
  const getPropertyTypeBadge = (type: string) => {
    switch (type) {
      case 'RESIDENTIAL':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Residential</Badge>;
      case 'COMMERCIAL':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Commercial</Badge>;
      case 'B&B':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">B&B</Badge>;
      case 'LAND':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Land</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Other</Badge>;
    }
  };

  // Get activity badge
  const getActivityBadge = (activity: string) => {
    switch (activity) {
      case 'purchased':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Purchased</Badge>;
      case 'sold':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Sold</Badge>;
      case 'both':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Purchased & Sold</Badge>;
      case 'owned_all_year':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Owned All Year</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{activity}</Badge>;
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

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Properties Found</CardTitle>
          <CardDescription>
            This submission doesn't contain any property data.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Properties ({properties.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchProperties}>
          Refresh
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Label</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Address</TableHead>
            <TableHead className="hidden lg:table-cell">Activity</TableHead>
            <TableHead className="hidden lg:table-cell">Details</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell>
                <div className="font-medium">{property.label}</div>
                <div className="text-sm text-muted-foreground font-mono">{property.id.substring(0, 8)}...</div>
              </TableCell>
              <TableCell>
                {getPropertyTypeBadge(property.property_type)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="text-sm">{formatAddress(property)}</div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {getActivityBadge(property.activity_2024)}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="space-y-1">
                  {property.rental_income && (
                    <div className="text-sm">
                      <span className="font-medium">Rental:</span> €{property.rental_income.toLocaleString()}
                    </div>
                  )}
                  {property.remodeling && (
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                      Remodeling
                    </Badge>
                  )}
                  {property.use_document_retrieval_service && (
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      Document Retrieval
                    </Badge>
                  )}
                </div>
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
