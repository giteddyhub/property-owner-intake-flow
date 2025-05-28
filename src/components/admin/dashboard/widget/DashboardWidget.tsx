
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { WidgetStatusIndicator } from './WidgetStatusIndicator';
import { WidgetChangeIndicator } from './WidgetChangeIndicator';
import { DrillDownContent } from './DrillDownContent';

interface WidgetProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  drillDownData?: any[];
  drillDownType?: 'chart' | 'table' | 'list';
  icon?: React.ReactNode;
  description?: string;
}

export const DashboardWidget: React.FC<WidgetProps> = ({
  title,
  value,
  change,
  status = 'info',
  drillDownData,
  drillDownType = 'chart',
  icon,
  description
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${status === 'error' ? 'border-red-200' : status === 'warning' ? 'border-yellow-200' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <WidgetStatusIndicator status={status} icon={icon} />
          {drillDownData && (
            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{title} - Detailed View</DialogTitle>
                  {description && (
                    <DialogDescription>{description}</DialogDescription>
                  )}
                </DialogHeader>
                <DrillDownContent 
                  data={drillDownData} 
                  type={drillDownType} 
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <WidgetChangeIndicator change={change} />
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
