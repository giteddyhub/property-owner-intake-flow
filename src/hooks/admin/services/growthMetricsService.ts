
export const calculateGrowthMetrics = ({
  newUsersThisMonth,
  newUsersPreviousMonth,
  currentMonthRevenue,
  previousMonthRevenue,
  submissionsResult,
  currentMonth,
  previousMonth
}: {
  newUsersThisMonth: number;
  newUsersPreviousMonth: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  submissionsResult: any[];
  currentMonth: { startOfMonth: Date; endOfMonth: Date };
  previousMonth: { startOfMonth: Date; endOfMonth: Date };
}) => {
  // Calculate growth rates with proper validation
  const userGrowthRate = newUsersPreviousMonth > 0 
    ? Math.round(((newUsersThisMonth - newUsersPreviousMonth) / newUsersPreviousMonth) * 100)
    : newUsersThisMonth > 0 ? 100 : 0;

  const revenueGrowthRate = previousMonthRevenue > 0 
    ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
    : currentMonthRevenue > 0 ? 100 : 0;

  // Current month submissions vs previous month for submission growth
  const currentMonthSubmissions = submissionsResult.filter(s => 
    new Date(s.created_at) >= currentMonth.startOfMonth && 
    new Date(s.created_at) <= currentMonth.endOfMonth
  ).length;

  const previousMonthSubmissions = submissionsResult.filter(s => 
    new Date(s.created_at) >= previousMonth.startOfMonth && 
    new Date(s.created_at) <= previousMonth.endOfMonth
  ).length;

  const submissionGrowthRate = previousMonthSubmissions > 0 
    ? Math.round(((currentMonthSubmissions - previousMonthSubmissions) / previousMonthSubmissions) * 100)
    : currentMonthSubmissions > 0 ? 100 : 0;

  return {
    userGrowthRate,
    revenueGrowthRate,
    submissionGrowthRate
  };
};
