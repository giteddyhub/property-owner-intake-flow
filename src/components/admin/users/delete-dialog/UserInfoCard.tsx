
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

interface UserInfoCardProps {
  userId: string;
  userEmail: string;
  userName?: string;
  accountAgeDays?: number;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({
  userId,
  userEmail,
  userName,
  accountAgeDays
}) => {
  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-red-700">
          <User className="h-4 w-4" />
          User to be Deleted
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Name:</span>
            <p>{userName || 'No Name'}</p>
          </div>
          <div>
            <span className="font-medium">Email:</span>
            <p className="font-mono">{userEmail}</p>
          </div>
          <div>
            <span className="font-medium">User ID:</span>
            <p className="font-mono text-xs">{userId}</p>
          </div>
          <div>
            <span className="font-medium">Account Age:</span>
            <p>{accountAgeDays || 0} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
