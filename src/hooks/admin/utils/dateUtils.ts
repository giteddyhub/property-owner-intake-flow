
// Helper function to get month boundaries with proper timezone handling
export const getMonthBoundaries = (monthsBack: number = 0) => {
  const now = new Date();
  // Use UTC to avoid timezone issues
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1, 0, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack + 1, 0, 23, 59, 59, 999));
  return { startOfMonth, endOfMonth };
};
