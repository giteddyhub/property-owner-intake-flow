
import React from 'react';

interface DataFilterTabsProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const DataFilterTabs: React.FC<DataFilterTabsProps> = ({ 
  activeFilter, 
  setActiveFilter 
}) => {
  return (
    <div className="bg-gray-50 p-0.5 rounded-lg inline-flex mb-4">
      <button 
        className={`px-4 py-2 text-sm ${activeFilter === 'properties' ? 'bg-white shadow-sm rounded-md' : ''}`}
        onClick={() => setActiveFilter('properties')}
      >
        Properties
      </button>
      <button 
        className={`px-4 py-2 text-sm ${activeFilter === 'owners' ? 'bg-white shadow-sm rounded-md' : ''}`}
        onClick={() => setActiveFilter('owners')}
      >
        Owners
      </button>
      <button 
        className={`px-4 py-2 text-sm ${activeFilter === 'assignments' ? 'bg-white shadow-sm rounded-md' : ''}`}
        onClick={() => setActiveFilter('assignments')}
      >
        Assignments
      </button>
    </div>
  );
};
