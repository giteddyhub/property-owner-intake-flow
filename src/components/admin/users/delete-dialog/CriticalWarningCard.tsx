
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const CriticalWarningCard: React.FC = () => {
  return (
    <div className="p-4 border-2 border-red-300 bg-red-50 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <h4 className="font-bold text-red-800">CRITICAL: Permanent Data Loss</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• All user data will be permanently deleted from the database</li>
            <li>• Properties, owners, and tax submissions will be completely removed</li>
            <li>• Payment and transaction history will be deleted</li>
            <li>• User account and authentication data will be erased</li>
            <li>• This action cannot be undone or reversed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
