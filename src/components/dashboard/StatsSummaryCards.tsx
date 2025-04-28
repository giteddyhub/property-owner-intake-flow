
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
          <div className="h-12 w-24">
            <svg className="h-full w-full" viewBox="0 0 100 40">
              <path
                d="M0,40 L5,35 L10,38 L15,30 L20,32 L25,28 L30,25 L35,27 L40,24 L45,20 L50,22 L55,18 L60,15 L65,17 L70,13 L75,15 L80,10 L85,12 L90,7 L95,9 L100,5"
                fill="none"
                stroke={`${chartColor}30`}
                strokeWidth="3"
              />
              <path
                d="M0,40 L5,35 L10,38 L15,30 L20,32 L25,28 L30,25 L35,27 L40,24 L45,20 L50,22 L55,18 L60,15 L65,17 L70,13 L75,15 L80,10 L85,12 L90,7 L95,9 L100,5"
                fill="none"
                stroke={chartColor}
                strokeWidth="2"
              />
            </svg>
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
}

export const StatsSummaryCards: React.FC<StatsSummaryCardsProps> = ({ 
  ownersCount,
  propertiesCount,
  assignmentsCount 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsSummaryCard
        title="Properties"
        value={propertiesCount}
        percentChange={2.4}
        chartColor="#22C55E"
      />
      <StatsSummaryCard
        title="Owners"
        value={ownersCount}
        percentChange={6.2}
        chartColor="#3B82F6"
      />
      <StatsSummaryCard
        title="Assignments"
        value={assignmentsCount}
        percentChange={4.7}
        chartColor="#F59E0B"
      />
    </div>
  );
};
