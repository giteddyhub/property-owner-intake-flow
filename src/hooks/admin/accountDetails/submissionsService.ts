
import { supabase } from '@/integrations/supabase/client';
import { FormSubmission } from './types';

export const fetchSubmissions = async (userId: string, primarySubmissionId?: string): Promise<FormSubmission[]> => {
  console.log(`[submissionsService] Fetching submissions for user: ${userId}, primary: ${primarySubmissionId}`);
  
  // First, get all submissions for this user
  const { data: allSubmissions, error: allSubmissionsError } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (allSubmissionsError) {
    console.error('[submissionsService] Error fetching all submissions:', allSubmissionsError);
    throw allSubmissionsError;
  }

  console.log(`[submissionsService] Found ${allSubmissions?.length || 0} total submissions for user ${userId}:`, 
    allSubmissions?.map(s => ({ id: s.id, state: s.state, submitted_at: s.submitted_at }))
  );

  if (!allSubmissions || allSubmissions.length === 0) {
    return [];
  }

  // Get submission IDs to check for payments
  const submissionIds = allSubmissions.map(s => s.id);
  
  // Check which submissions have payments
  const { data: paymentsData, error: paymentsError } = await supabase
    .from('purchases')
    .select('form_submission_id')
    .in('form_submission_id', submissionIds);

  if (paymentsError) {
    console.error('[submissionsService] Error fetching payments for submissions:', paymentsError);
  }

  const submissionsWithPayments = new Set(paymentsData?.map(p => p.form_submission_id) || []);
  
  console.log(`[submissionsService] Found payments for submissions:`, Array.from(submissionsWithPayments));

  // Filter submissions: exclude tax_filing_init ONLY if they don't have payments
  const filteredSubmissions = allSubmissions.filter(submission => {
    // Always include if it has payments
    if (submissionsWithPayments.has(submission.id)) {
      console.log(`[submissionsService] Including submission ${submission.id} (${submission.state}) - has payments`);
      return true;
    }
    
    // For submissions without payments, exclude tax_filing_init state
    if (submission.state === 'tax_filing_init') {
      console.log(`[submissionsService] Excluding submission ${submission.id} (${submission.state}) - no payments`);
      return false;
    }
    
    console.log(`[submissionsService] Including submission ${submission.id} (${submission.state}) - valid state`);
    return true;
  });

  console.log(`[submissionsService] Final filtered submissions count: ${filteredSubmissions.length}`);

  return filteredSubmissions.map(submission => ({
    ...submission,
    is_primary_submission: submission.id === primarySubmissionId
  }));
};
