
export const fetchUserMetrics = async (
  adminSupabase: any,
  userSummaries: any[],
  currentMonth: { startOfMonth: Date; endOfMonth: Date },
  previousMonth: { startOfMonth: Date; endOfMonth: Date }
) => {
  const totalUsers = userSummaries.length;
  
  // Aggregate totals from the view
  const totalOwners = userSummaries.reduce((sum, user) => sum + (user.total_owners || 0), 0);
  const totalProperties = userSummaries.reduce((sum, user) => sum + (user.total_properties || 0), 0);
  
  // Get user counts with proper error handling
  let newUsersThisMonth = 0;
  let newUsersPreviousMonth = 0;
  
  try {
    // Use the profiles table directly instead of count queries that might be causing 404
    const { data: allProfiles, error: profilesError } = await adminSupabase
      .from('profiles')
      .select('id, created_at')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      console.error('❌ PROFILES QUERY ERROR:', profilesError);
    } else if (allProfiles) {
      // Calculate user counts from the data
      newUsersThisMonth = allProfiles.filter((profile: any) => {
        const createdAt = new Date(profile.created_at);
        return createdAt >= currentMonth.startOfMonth && createdAt <= currentMonth.endOfMonth;
      }).length;
      
      newUsersPreviousMonth = allProfiles.filter((profile: any) => {
        const createdAt = new Date(profile.created_at);
        return createdAt >= previousMonth.startOfMonth && createdAt <= previousMonth.endOfMonth;
      }).length;
    }
  } catch (profileError) {
    console.error('❌ Error fetching profiles for user counts:', profileError);
    // Use fallback values
    newUsersThisMonth = 0;
    newUsersPreviousMonth = 0;
  }

  return {
    totalUsers,
    totalOwners,
    totalProperties,
    newUsersThisMonth,
    newUsersPreviousMonth
  };
};
