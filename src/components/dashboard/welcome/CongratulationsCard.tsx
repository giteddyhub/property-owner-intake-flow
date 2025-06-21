
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, X } from 'lucide-react';

interface CongratulationsCardProps {
  userName: string;
  onDismiss: () => void;
  isAnimatingOut: boolean;
}

export const CongratulationsCard: React.FC<CongratulationsCardProps> = ({
  userName,
  onDismiss,
  isAnimatingOut
}) => {
  return (
    <Card 
      className={`mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 transition-all duration-300 ${
        isAnimatingOut ? 'animate-fade-out scale-95 opacity-0' : 'animate-fade-in'
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 relative">
          <button
            onClick={onDismiss}
            className="absolute -top-2 -right-2 h-8 w-8 bg-white rounded-full shadow-sm border border-green-200 flex items-center justify-center hover:bg-green-50 transition-colors duration-200 group"
            aria-label="Dismiss congratulations message"
          >
            <X className="h-4 w-4 text-green-600 group-hover:text-green-700" />
          </button>
          
          <div className="flex-shrink-0">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              Congratulations, {userName}! 🎉
            </h3>
            <p className="text-green-700">
              Your property portfolio is all set up. You can now manage your owners, properties, and ownership assignments.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
