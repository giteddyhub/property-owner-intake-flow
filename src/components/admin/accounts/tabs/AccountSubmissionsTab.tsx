
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';

interface FormSubmission {
  id: string;
  submitted_at: string;
  state: string;
  pdf_generated: boolean;
  pdf_url: string | null;
}

interface AccountSubmissionsTabProps {
  submissions: FormSubmission[];
}

export const AccountSubmissionsTab: React.FC<AccountSubmissionsTabProps> = ({ submissions }) => {
  const navigate = useNavigate();

  const goToSubmission = (submissionId: string) => {
    navigate(`/admin/submissions/${submissionId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Form Submissions
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>
          {submissions.length === 0 
            ? 'This user has not completed any form submissions yet.' 
            : `${submissions.length} form submission(s) for this user. These represent completed tax filing forms, not including session initializations.`}
        </CardDescription>
        <div className="bg-muted/30 p-3 rounded-lg text-sm">
          <strong>Note:</strong> Form submissions represent completed tax filing processes. 
          Session initializations and incomplete forms are excluded from this view. 
          Each user typically has one primary submission with potential follow-up submissions for additional years or corrections.
        </div>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-2">No Form Submissions</h3>
            <p className="text-sm">This user hasn't completed any tax filing forms yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submission ID</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>PDF Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission.id}>
                  <TableCell className="font-mono text-xs">
                    {submission.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {format(new Date(submission.submitted_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
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
                        Pending
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
  );
};
