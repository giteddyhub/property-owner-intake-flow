
export const processPropertyDistribution = (properties: any[]) => {
  const distribution: Record<string, number> = properties.reduce((acc, prop) => {
    const type = prop.property_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(distribution).reduce((sum: number, count: number) => sum + count, 0);

  return Object.entries(distribution).map(([type, count]: [string, number]) => ({
    type,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0
  }));
};
