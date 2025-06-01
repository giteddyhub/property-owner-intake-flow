
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

  // Current month sessions vs previous month for session growth
  const currentMonthSessions = submissionsResult.filter(s => 
    new Date(s.created_at) >= currentMonth.startOfMonth && 
    new Date(s.created_at) <= currentMonth.endOfMonth
  ).length;

  const previousMonthSessions = submissionsResult.filter(s => 
    new Date(s.created_at) >= previousMonth.startOfMonth && 
    new Date(s.created_at) <= previousMonth.endOfMonth
  ).length;

  const sessionGrowthRate = previousMonthSessions > 0 
    ? Math.round(((currentMonthSessions - previousMonthSessions) / previousMonthSessions) * 100)
    : currentMonthSessions > 0 ? 100 : 0;

  return {
    userGrowthRate,
    revenueGrowthRate,
    sessionGrowthRate
  };
};
