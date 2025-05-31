
import { supabase } from '@/integrations/supabase/client';
import { FormSubmission } from './types';

export const fetchSubmissions = async (userId: string, primarySubmissionId?: string): Promise<FormSubmission[]> => {
  console.log(`[submissionsService] Fetching submissions for user: ${userId}, primary: ${primarySubmissionId}`);
  
  // For admin context, get ALL submissions for this user without filtering
  // This ensures we don't lose any payments due to complex filtering logic
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
    allSubmissions?.map(s => ({ 
      id: s.id, 
      state: s.state, 
      submitted_at: s.submitted_at,
      is_primary: s.id === primarySubmissionId 
    }))
  );

  if (!allSubmissions || allSubmissions.length === 0) {
    console.log(`[submissionsService] No submissions found for user ${userId}`);
    return [];
  }

  // In admin context, we want to see ALL submissions to ensure no payments are missed
  // Mark the primary submission based on the provided ID
  const enhancedSubmissions = allSubmissions.map(submission => ({
    ...submission,
    is_primary_submission: submission.id === primarySubmissionId
  }));

  console.log(`[submissionsService] Returning ${enhancedSubmissions.length} submissions for admin view`);
  console.log(`[submissionsService] Submission IDs being returned:`, enhancedSubmissions.map(s => s.id));

  return enhancedSubmissions;
};
