
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface DrillDownContentProps {
  data: any[];
  type: 'chart' | 'table' | 'list';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const DrillDownContent: React.FC<DrillDownContentProps> = ({
  data,
  type
}) => {
  if (!data || data.length === 0) {
    return <div>No drill-down data available</div>;
  }

  switch (type) {
    case 'chart':
      if (typeof data[0] === 'object') {
        // Determine chart type based on data structure
        if (data[0].hasOwnProperty('name') && data[0].hasOwnProperty('value')) {
          // Pie chart for categorical data
          return (
            <ChartContainer config={{}} className="h-80">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
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
          const hasTimeData = data[0].hasOwnProperty('date') || data[0].hasOwnProperty('month');
          
          return (
            <ChartContainer config={{}} className="h-80">
              <ResponsiveContainer>
                {hasTimeData ? (
                  <LineChart data={data}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {Object.keys(data[0])
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
                  <BarChart data={data}>
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
                {data.length > 0 && Object.keys(data[0]).map(key => (
                  <th key={key} className="text-left p-2 font-medium">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
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
          {data.map((item, index) => (
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
