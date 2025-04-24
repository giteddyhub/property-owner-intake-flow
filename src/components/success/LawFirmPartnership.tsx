
import React from 'react';
import { Shield } from 'lucide-react';

const LawFirmPartnership = () => {
  return (
    <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
        <div className="w-32">
          <img
            src="/lovable-uploads/3fe5c691-5b07-43b9-81a1-44ec57f827ea.png"
            alt="Studio Legale Metta - 135 Years Anniversary"
            className="w-full h-auto"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-form-400" />
            <h3 className="text-xl font-semibold text-gray-900">Studio Legale Metta</h3>
          </div>
          <p className="text-gray-600 mb-4">
            We are proud to partner with Studio Legale Metta, a highly respected Italian law firm with 
            decades of experience in tax, real estate, and immigration law.
          </p>
          <p className="text-gray-600">
            This collaboration ensures that our platform remains compliant with Italian regulations while 
            providing clients with access to reliable legal expertise when needed. With Studio Legale Metta's 
            established reputation and deep understanding of Italian tax law, you can trust that your 
            filings are accurate and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LawFirmPartnership;
