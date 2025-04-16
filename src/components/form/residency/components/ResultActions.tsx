
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultActionsProps {
  onRestart: () => void;
}

const ResultActions: React.FC<ResultActionsProps> = ({ onRestart }) => {
  return (
    <div className="flex flex-wrap gap-4 justify-end">
      <Button variant="outline" onClick={onRestart}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Restart Assessment
      </Button>
      <Button onClick={() => window.close()}>
        Return to Form
      </Button>
    </div>
  );
};

export default ResultActions;
