
import React from 'react';
import { ActionsToolbar } from '@/components/dashboard/ActionsToolbar';

interface UserManagementHeaderProps {
  pageTitle: string;
  onRefresh: () => void;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  pageTitle,
  onRefresh
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{pageTitle}</h2>
      <div className="flex items-center gap-2">
        <ActionsToolbar onRefresh={onRefresh} />
      </div>
    </div>
  );
};
