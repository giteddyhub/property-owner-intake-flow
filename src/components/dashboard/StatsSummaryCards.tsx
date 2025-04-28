
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaxFilingCTA } from '@/components/dashboard/TaxFilingCTA';

interface StatsSummaryCardProps {
  title: string;
  value: number;
  percentChange: number;
  chartColor: string;
}

const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  title,
  value,
  percentChange,
  chartColor
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-semibold">{value}</div>
            <div className="text-sm text-green-500 flex items-center mt-1">
              +{percentChange}% <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatsSummaryCardsProps {
  ownersCount: number;
  propertiesCount: number;
  assignmentsCount: number;
  userId: string;
}

export const StatsSummaryCards: React.FC<StatsSummaryCardsProps> = ({
  ownersCount,
  propertiesCount,
  assignmentsCount,
  userId
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsSummaryCard title="Properties" value={propertiesCount} percentChange={2.4} chartColor="#22C55E" />
      <StatsSummaryCard title="Owners" value={ownersCount} percentChange={6.2} chartColor="#3B82F6" />
      <StatsSummaryCard title="Assignments" value={assignmentsCount} percentChange={4.7} chartColor="#F59E0B" />
      <TaxFilingCTA userId={userId} />
    </div>
  );
};
