
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultHeaderProps {
  onBack: () => void;
}

const ResultHeader: React.FC<ResultHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mr-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <h1 className="text-2xl font-bold text-gray-900">Assessment Results</h1>
    </div>
  );
};

export default ResultHeader;
