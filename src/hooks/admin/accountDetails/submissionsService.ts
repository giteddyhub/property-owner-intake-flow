
import { supabase } from '@/integrations/supabase/client';
import { FormSubmission } from './types';

export const fetchSubmissions = async (userId: string, primarySubmissionId?: string): Promise<FormSubmission[]> => {
  console.log(`[submissionsService] 🔍 Fetching ALL submissions for user: ${userId}`);
  console.log(`[submissionsService] 🔍 Primary submission ID provided: ${primarySubmissionId}`);
  
  // For admin context, get ALL submissions for this user - no filtering whatsoever
  const { data: allSubmissions, error: submissionsError } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (submissionsError) {
    console.error('[submissionsService] ❌ Error fetching submissions:', submissionsError);
    throw submissionsError;
  }

  if (!allSubmissions || allSubmissions.length === 0) {
    console.log(`[submissionsService] ⚠️ No submissions found for user ${userId}`);
    return [];
  }

  console.log(`[submissionsService] ✅ Found ${allSubmissions.length} total submissions:`);
  allSubmissions.forEach((submission, index) => {
    console.log(`[submissionsService]   ${index + 1}. ID: ${submission.id}, State: ${submission.state}, Date: ${submission.submitted_at}`);
  });

  // Mark the primary submission and return ALL submissions
  const enhancedSubmissions = allSubmissions.map(submission => ({
    ...submission,
    is_primary_submission: submission.id === primarySubmissionId
  }));

  console.log(`[submissionsService] 🎯 Returning ${enhancedSubmissions.length} submissions for admin view`);
  console.log(`[submissionsService] 🎯 All submission IDs:`, enhancedSubmissions.map(s => s.id));

  return enhancedSubmissions;
};
