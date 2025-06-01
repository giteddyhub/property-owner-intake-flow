
export const generateTrendData = async (
  adminSupabase: any,
  userMetrics: any,
  totalSubmissions: number
) => {
  // Generate growth data for the last 7 days
  const userGrowthData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split('T')[0],
      users: Math.floor(userMetrics.totalUsers * (0.8 + i * 0.04)),
      submissions: Math.floor(totalSubmissions * (0.7 + i * 0.05)),
      properties: Math.floor(userMetrics.totalProperties * (0.75 + i * 0.04))
    };
  });

  // Generate submission trends for the last 6 months
  const submissionTrends = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const total = Math.floor(totalSubmissions * (0.1 + i * 0.15));
    return {
      month: monthName,
      completed: Math.floor(total * 0.7),
      pending: Math.floor(total * 0.3),
      total
    };
  });

  // Property distribution with null safety
  const { data: propertyTypes } = await adminSupabase
    .from('properties')
    .select('property_type')
    .order('property_type');

  const propertyDistribution = (propertyTypes || []).reduce((acc: any[], property: any) => {
    const type = property?.property_type || 'Unknown';
    const existing = acc.find(p => p.type === type);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ type, count: 1, percentage: 0 });
    }
    return acc;
  }, []);

  // Calculate percentages
  propertyDistribution.forEach(item => {
    item.percentage = userMetrics.totalProperties > 0 ? Math.round((item.count / userMetrics.totalProperties) * 100) : 0;
  });

  return {
    userGrowthData,
    submissionTrends,
    propertyDistribution
  };
};
