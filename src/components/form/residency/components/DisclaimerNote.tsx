
import React from 'react';

const DisclaimerNote: React.FC = () => {
  return (
    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-2">Important Note</h4>
      <p className="text-blue-800 text-sm">
        This assessment is based on the information you provided and is intended as general guidance only. 
        Tax residency determinations can be complex and depend on your specific circumstances.
        For definitive guidance, consult with a qualified tax professional.
      </p>
    </div>
  );
};

export default DisclaimerNote;
