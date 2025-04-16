
import React from 'react';

interface RecommendationsListProps {
  recommendations: string[];
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Recommendations</h3>
      <ul className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold mt-0.5">
              {index + 1}
            </div>
            <span className="text-gray-700">{recommendation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationsList;
