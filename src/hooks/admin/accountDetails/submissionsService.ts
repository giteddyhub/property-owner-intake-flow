
import { supabase } from '@/integrations/supabase/client';
import { FormSubmission } from './types';

export const fetchSubmissions = async (userId: string, primarySubmissionId?: string): Promise<FormSubmission[]> => {
  console.log(`[submissionsService] 🔍 Fetching ALL submissions for user: ${userId}`);
  console.log(`[submissionsService] 🔍 Primary submission ID provided: ${primarySubmissionId}`);
  
  // For admin context, get ALL submissions for this user - order by created_at to handle NULL submitted_at
  const { data: allSubmissions, error: submissionsError } = await supabase
    .from('form_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); // Changed from submitted_at to created_at

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
    console.log(`[submissionsService]   ${index + 1}. ID: ${submission.id}, State: ${submission.state}, Created: ${submission.created_at}, Submitted: ${submission.submitted_at}`);
  });

  // Validate we have the expected submissions for debugging
  const taxFilingInitSubmissions = allSubmissions.filter(s => s.state === 'tax_filing_init');
  const newSubmissions = allSubmissions.filter(s => s.state === 'new');
  
  console.log(`[submissionsService] 📊 Submission breakdown:`, {
    total: allSubmissions.length,
    taxFilingInit: taxFilingInitSubmissions.length,
    new: newSubmissions.length,
    states: allSubmissions.map(s => s.state)
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
