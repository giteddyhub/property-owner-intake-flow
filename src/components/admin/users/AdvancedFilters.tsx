
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, X, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { FilterOptions, SortByField } from '@/hooks/admin/useAdvancedFiltering';

interface AdvancedFiltersProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortByField;
  setSortBy: (sort: SortByField) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  resetFilters: () => void;
  applyQuickFilter: (preset: string) => void;
  resultCount: number;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  resetFilters,
  applyQuickFilter,
  resultCount
}) => {
  const activeFiltersCount = Object.values(filters).filter(value => {
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== null);
    }
    return value !== 'all';
  }).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Filter Presets */}
        <div>
          <Label className="text-sm font-medium">Quick Filters</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => applyQuickFilter('new_users_week')}>
              New Users (7 days)
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyQuickFilter('inactive_month')}>
              Inactive (30+ days)
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyQuickFilter('high_activity')}>
              High Activity
            </Button>
            <Button variant="outline" size="sm" onClick={() => applyQuickFilter('admins_only')}>
              Admins Only
            </Button>
          </div>
        </div>

        {/* Search */}
        <div>
          <Label htmlFor="search">Search Users</Label>
          <Input
            id="search"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Role Filter */}
          <div>
            <Label>Role</Label>
            <Select
              value={filters.role}
              onValueChange={(value) => setFilters({ ...filters, role: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Status */}
          <div>
            <Label>Account Status</Label>
            <Select
              value={filters.accountStatus}
              onValueChange={(value) => setFilters({ ...filters, accountStatus: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Level */}
          <div>
            <Label>Activity Level</Label>
            <Select
              value={filters.activityLevel}
              onValueChange={(value) => setFilters({ ...filters, activityLevel: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High Activity</SelectItem>
                <SelectItem value="medium">Medium Activity</SelectItem>
                <SelectItem value="low">Low Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div>
            <Label>Sort By</Label>
            <div className="flex gap-1">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortByField)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="created_at">Registration</SelectItem>
                  <SelectItem value="last_login">Last Login</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Registration Date Range */}
          <div>
            <Label>Registration Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {filters.registrationDate.from ? 
                      format(filters.registrationDate.from, 'MMM dd') : 'From'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.registrationDate.from || undefined}
                    onSelect={(date) => setFilters({
                      ...filters,
                      registrationDate: { ...filters.registrationDate, from: date || null }
                    })}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {filters.registrationDate.to ? 
                      format(filters.registrationDate.to, 'MMM dd') : 'To'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.registrationDate.to || undefined}
                    onSelect={(date) => setFilters({
                      ...filters,
                      registrationDate: { ...filters.registrationDate, to: date || null }
                    })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Last Login Date Range */}
          <div>
            <Label>Last Login Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {filters.lastLoginRange.from ? 
                      format(filters.lastLoginRange.from, 'MMM dd') : 'From'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.lastLoginRange.from || undefined}
                    onSelect={(date) => setFilters({
                      ...filters,
                      lastLoginRange: { ...filters.lastLoginRange, from: date || null }
                    })}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {filters.lastLoginRange.to ? 
                      format(filters.lastLoginRange.to, 'MMM dd') : 'To'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.lastLoginRange.to || undefined}
                    onSelect={(date) => setFilters({
                      ...filters,
                      lastLoginRange: { ...filters.lastLoginRange, to: date || null }
                    })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {resultCount} users
        </div>
      </CardContent>
    </Card>
  );
};
