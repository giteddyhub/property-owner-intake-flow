
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Eye, AlertTriangle } from 'lucide-react';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const InteractiveDashboardWidget: React.FC<WidgetProps> = ({
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

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return icon;
    }
  };

  const renderDrillDownContent = () => {
    if (!drillDownData) return null;

    switch (drillDownType) {
      case 'chart':
        if (drillDownData.length > 0 && typeof drillDownData[0] === 'object') {
          // Determine chart type based on data structure
          if (drillDownData[0].hasOwnProperty('name') && drillDownData[0].hasOwnProperty('value')) {
            // Pie chart for categorical data
            return (
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={drillDownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {drillDownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            );
          } else {
            // Line or bar chart for time series data
            const hasTimeData = drillDownData[0].hasOwnProperty('date') || drillDownData[0].hasOwnProperty('month');
            
            return (
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer>
                  {hasTimeData ? (
                    <LineChart data={drillDownData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {Object.keys(drillDownData[0])
                        .filter(key => key !== 'date' && key !== 'month')
                        .map((key, index) => (
                          <Line 
                            key={key} 
                            type="monotone" 
                            dataKey={key} 
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                          />
                        ))}
                    </LineChart>
                  ) : (
                    <BarChart data={drillDownData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </ChartContainer>
            );
          }
        }
        break;

      case 'table':
        return (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {drillDownData.length > 0 && Object.keys(drillDownData[0]).map(key => (
                    <th key={key} className="text-left p-2 font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drillDownData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} className="p-2">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'list':
        return (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {drillDownData.map((item, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                {typeof item === 'object' ? (
                  Object.entries(item).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))
                ) : (
                  <span>{String(item)}</span>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return <div>No drill-down data available</div>;
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${status === 'error' ? 'border-red-200' : status === 'warning' ? 'border-yellow-200' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {getStatusIcon() && (
            <div className={`p-2 rounded-full ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
          )}
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
                {renderDrillDownContent()}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            {change.type === 'increase' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-xs ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {change.value}% {change.period}
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
