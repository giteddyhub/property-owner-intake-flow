
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
  );
};
