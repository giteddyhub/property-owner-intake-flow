
import { UserRole } from '../types/adminUserTypes';

export const filterUsersByRole = (users: any[], adminUserIds: string[], filter: UserRole) => {
  switch (filter) {
    case 'admin':
      return users.filter(user => adminUserIds.includes(user.id));
    case 'user':
      return users.filter(user => !adminUserIds.includes(user.id));
    case 'all':
    default:
      return users;
  }
};

export const createMockUsers = (filter: UserRole) => {
  const mockUsers = [
    {
      id: 'mock-1',
      full_name: 'Admin User',
      email: 'admin@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      full_name: 'Test User',
      email: 'user@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  const diagnostics: any = {
    usingMockData: true,
    mockDataFilter: filter
  };
  
  switch (filter) {
    case 'admin':
      return {
        users: [mockUsers[0]],
        adminUsers: ['mock-1'],
        diagnostics
      };
    case 'user':
      return {
        users: [mockUsers[1]],
        adminUsers: ['mock-1'],
        diagnostics
      };
    case 'all':
    default:
      return {
        users: mockUsers,
        adminUsers: ['mock-1'],
        diagnostics
      };
  }
};

export const getErrorMessage = (filter: UserRole, hasProfiles: boolean) => {
  if (hasProfiles) {
    // We have profiles but none match the filter
    switch (filter) {
      case 'admin':
        return 'No admin users found. You can create one using the "Create Admin User" button.';
      case 'user':
        return 'No regular users found in the system.';
      default:
        return 'No users found matching the current filter.';
    }
  } else {
    return 'Using mock data. No real user profiles found in the database.';
  }
};
