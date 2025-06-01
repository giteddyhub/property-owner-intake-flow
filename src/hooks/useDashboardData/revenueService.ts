
import { supabase } from '@/integrations/supabase/client';

export const fetchUserTotalRevenue = async (userId: string): Promise<number> => {
  try {
    console.log('Fetching total revenue for user:', userId);
    
    // First, get all form submissions for this user
    const { data: submissions, error: submissionsError } = await supabase
      .from('form_submissions')
      .select('id')
      .eq('user_id', userId);

    if (submissionsError) {
      console.error('Error fetching user submissions:', submissionsError);
      throw submissionsError;
    }

    if (!submissions || submissions.length === 0) {
      console.log('No submissions found for user, revenue is 0');
      return 0;
    }

    const submissionIds = submissions.map(sub => sub.id);

    // Now get all paid purchases for these submissions
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('amount')
      .in('form_submission_id', submissionIds)
      .eq('payment_status', 'paid');

    if (purchasesError) {
      console.error('Error fetching user purchases:', purchasesError);
      throw purchasesError;
    }

    if (!purchases || purchases.length === 0) {
      console.log('No paid purchases found for user, revenue is 0');
      return 0;
    }

    // Calculate total revenue
    const totalRevenue = purchases.reduce((sum, purchase) => {
      const amount = Number(purchase.amount) || 0;
      return sum + amount;
    }, 0);

    console.log(`Total revenue calculated: €${totalRevenue} from ${purchases.length} purchases`);
    return totalRevenue;
    
  } catch (error) {
    console.error('Error calculating total revenue:', error);
    return 0;
  }
};
