
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaxFilingCTA } from '@/components/dashboard/TaxFilingCTA';

interface StatsSummaryCardProps {
  title: string;
  value: number | string;
  chartColor: string;
}

const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  title,
  value,
  chartColor
}) => {
  return (
    <Card className="border-0 shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-semibold">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatsSummaryCardsProps {
  ownersCount: number;
  propertiesCount: number;
  totalRevenue: number;
  userId: string;
}

export const StatsSummaryCards: React.FC<StatsSummaryCardsProps> = ({
  ownersCount,
  propertiesCount,
  totalRevenue,
  userId
}) => {
  const formatRevenue = (amount: number) => {
    return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
      <div className="md:col-span-3">
        <StatsSummaryCard title="Properties" value={propertiesCount} chartColor="#22C55E" />
      </div>
      <div className="md:col-span-3">
        <StatsSummaryCard title="Owners" value={ownersCount} chartColor="#3B82F6" />
      </div>
      <div className="md:col-span-3">
        <StatsSummaryCard title="Total Revenue" value={formatRevenue(totalRevenue)} chartColor="#8B5CF6" />
      </div>
      <div className="md:col-span-3 lg:col-span-3">
        <TaxFilingCTA userId={userId} />
      </div>
    </div>
  );
};
