
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminDataTableProps {
  data: any[];
  columns: {
    key: string;
    header: string;
    render?: (value: any, row: any) => React.ReactNode;
    className?: string;
  }[];
  onRowClick?: (rowId: string, rowData: any) => void;
  onShowUserOverview?: (userId: string, context?: { type: 'property' | 'owner' | 'assignment'; id: string }) => void;
  loading?: boolean;
  contextType?: 'property' | 'owner' | 'assignment';
}

export const AdminDataTable: React.FC<AdminDataTableProps> = ({
  data,
  columns,
  onRowClick,
  onShowUserOverview,
  loading = false,
  contextType
}) => {
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No data available</div>;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-3 text-left font-medium ${column.className || ''}`}>
                {column.header}
              </th>
            ))}
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index} className="border-t hover:bg-muted/50">
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 ${column.className || ''}`}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {onShowUserOverview && row.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onShowUserOverview(row.user_id, contextType ? { type: contextType, id: row.id } : undefined)}
                      title="Quick User Overview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onRowClick && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRowClick(row.id, row)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
