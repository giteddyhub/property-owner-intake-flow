
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
import { Info, Star, FileText } from 'lucide-react';

interface FormSubmission {
  id: string;
  submitted_at: string;
  state: string;
  pdf_generated: boolean;
  pdf_url: string | null;
  is_primary_submission: boolean;
}

interface AccountSubmissionsTabProps {
  submissions: FormSubmission[];
}

export const AccountSubmissionsTab: React.FC<AccountSubmissionsTabProps> = ({ submissions }) => {
  const navigate = useNavigate();

  const goToSubmission = (submissionId: string) => {
    navigate(`/admin/submissions/${submissionId}`);
  };

  const primarySubmissions = submissions.filter(s => s.is_primary_submission);
  const otherSubmissions = submissions.filter(s => !s.is_primary_submission);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Form Submissions
        </CardTitle>
        <CardDescription>
          {submissions.length === 0 
            ? 'This user has not completed any form submissions yet.' 
            : `${submissions.length} form submission(s) for this user, including their initial setup and any follow-up submissions.`}
        </CardDescription>
        <div className="bg-muted/30 p-3 rounded-lg text-sm space-y-2">
          <div><strong>Primary Submission:</strong> The user's initial form completion that represents their first setup on the platform.</div>
          <div><strong>Additional Submissions:</strong> Any follow-up submissions for corrections, updates, or additional tax years.</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {primarySubmissions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Primary Submission
            </h3>
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
                {primarySubmissions.map(submission => (
                  <TableRow key={submission.id} className="bg-yellow-50/50">
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {submission.id.substring(0, 8)}...
                      </div>
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
          </div>
        )}

        {otherSubmissions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Additional Submissions
            </h3>
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
                {otherSubmissions.map(submission => (
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
          </div>
        )}

        {submissions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-2">No Form Submissions</h3>
            <p className="text-sm">This user hasn't completed their initial setup yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
