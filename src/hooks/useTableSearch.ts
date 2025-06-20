
import { useState, useMemo } from 'react';

interface UseTableSearchProps<T> {
  data: T[];
  searchFields: (keyof T)[];
}

export const useTableSearch = <T extends Record<string, any>>({ 
  data, 
  searchFields 
}: UseTableSearchProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = data.filter(item => 
        searchFields.some(field => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(lowerSearchTerm);
        })
      );
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, searchFields, sortField, sortDirection]);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedData
  };
};
