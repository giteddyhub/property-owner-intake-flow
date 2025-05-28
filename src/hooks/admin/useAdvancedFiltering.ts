
import { useState, useMemo } from 'react';
import { format, subDays, isAfter, isBefore } from 'date-fns';

export interface FilterOptions {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  accountStatus: 'all' | 'active' | 'suspended' | 'inactive';
  activityLevel: 'all' | 'high' | 'medium' | 'low';
  role: 'all' | 'admin' | 'user';
  registrationDate: {
    from: Date | null;
    to: Date | null;
  };
  lastLoginRange: {
    from: Date | null;
    to: Date | null;
  };
}

export interface UserWithMetrics {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_login?: string;
  is_admin: boolean;
  activity_score: number;
  submissions_count: number;
  properties_count: number;
  login_frequency: 'high' | 'medium' | 'low';
  account_status: 'active' | 'suspended' | 'inactive';
}

export const useAdvancedFiltering = (users: any[], adminUsers: string[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { from: null, to: null },
    accountStatus: 'all',
    activityLevel: 'all',
    role: 'all',
    registrationDate: { from: null, to: null },
    lastLoginRange: { from: null, to: null }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at' | 'last_login' | 'activity'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Enhanced users with metrics
  const usersWithMetrics = useMemo((): UserWithMetrics[] => {
    return users.map(user => {
      const isAdmin = adminUsers.includes(user.id);
      const daysSinceRegistration = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const mockLastLogin = user.created_at ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null;
      
      // Mock activity metrics
      const submissions_count = Math.floor(Math.random() * 10);
      const properties_count = Math.floor(Math.random() * 5);
      const activity_score = submissions_count * 10 + properties_count * 5 + (isAdmin ? 20 : 0);
      
      let login_frequency: 'high' | 'medium' | 'low' = 'low';
      if (mockLastLogin) {
        const daysSinceLogin = Math.floor((Date.now() - mockLastLogin.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLogin <= 7) login_frequency = 'high';
        else if (daysSinceLogin <= 30) login_frequency = 'medium';
      }

      return {
        ...user,
        is_admin: isAdmin,
        last_login: mockLastLogin?.toISOString(),
        activity_score,
        submissions_count,
        properties_count,
        login_frequency,
        account_status: Math.random() > 0.9 ? 'suspended' : 'active' as 'active' | 'suspended' | 'inactive'
      };
    });
  }, [users, adminUsers]);

  // Apply filters
  const filteredUsers = useMemo(() => {
    let filtered = usersWithMetrics;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(query) ||
        user.full_name?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => 
        filters.role === 'admin' ? user.is_admin : !user.is_admin
      );
    }

    // Account status filter
    if (filters.accountStatus !== 'all') {
      filtered = filtered.filter(user => user.account_status === filters.accountStatus);
    }

    // Activity level filter
    if (filters.activityLevel !== 'all') {
      filtered = filtered.filter(user => user.login_frequency === filters.activityLevel);
    }

    // Registration date filter
    if (filters.registrationDate.from || filters.registrationDate.to) {
      filtered = filtered.filter(user => {
        const userDate = new Date(user.created_at);
        if (filters.registrationDate.from && isBefore(userDate, filters.registrationDate.from)) return false;
        if (filters.registrationDate.to && isAfter(userDate, filters.registrationDate.to)) return false;
        return true;
      });
    }

    // Last login filter
    if (filters.lastLoginRange.from || filters.lastLoginRange.to) {
      filtered = filtered.filter(user => {
        if (!user.last_login) return false;
        const loginDate = new Date(user.last_login);
        if (filters.lastLoginRange.from && isBefore(loginDate, filters.lastLoginRange.from)) return false;
        if (filters.lastLoginRange.to && isAfter(loginDate, filters.lastLoginRange.to)) return false;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.full_name || a.email;
          bValue = b.full_name || b.email;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'last_login':
          aValue = a.last_login ? new Date(a.last_login) : new Date(0);
          bValue = b.last_login ? new Date(b.last_login) : new Date(0);
          break;
        case 'activity':
          aValue = a.activity_score;
          bValue = b.activity_score;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [usersWithMetrics, filters, searchQuery, sortBy, sortOrder]);

  const resetFilters = () => {
    setFilters({
      dateRange: { from: null, to: null },
      accountStatus: 'all',
      activityLevel: 'all',
      role: 'all',
      registrationDate: { from: null, to: null },
      lastLoginRange: { from: null, to: null }
    });
    setSearchQuery('');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  // Quick filter presets
  const applyQuickFilter = (preset: string) => {
    const now = new Date();
    switch (preset) {
      case 'new_users_week':
        setFilters(prev => ({
          ...prev,
          registrationDate: { from: subDays(now, 7), to: now }
        }));
        break;
      case 'inactive_month':
        setFilters(prev => ({
          ...prev,
          lastLoginRange: { from: new Date(0), to: subDays(now, 30) }
        }));
        break;
      case 'high_activity':
        setFilters(prev => ({
          ...prev,
          activityLevel: 'high'
        }));
        break;
      case 'admins_only':
        setFilters(prev => ({
          ...prev,
          role: 'admin'
        }));
        break;
    }
  };

  return {
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredUsers,
    usersWithMetrics,
    resetFilters,
    applyQuickFilter
  };
};
