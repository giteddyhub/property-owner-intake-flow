
export const processRevenueMetrics = (purchases: any[]) => {
  const totalRevenue = purchases.reduce((sum, purchase) => sum + (parseFloat(purchase.amount) || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyRevenue = purchases
    .filter(purchase => {
      const purchaseDate = new Date(purchase.created_at);
      return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === currentYear;
    })
    .reduce((sum, purchase) => sum + (parseFloat(purchase.amount) || 0), 0);

  const averageOrderValue = purchases.length > 0 ? totalRevenue / purchases.length : 0;
  
  // Mock conversion rate for now - would need more data to calculate accurately
  const conversionRate = 0.15;

  return {
    totalRevenue,
    monthlyRevenue,
    averageOrderValue,
    conversionRate
  };
};
