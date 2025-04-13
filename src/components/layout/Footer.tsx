
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 bg-gray-50 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="font-medium text-gray-700">
            © {new Date().getFullYear()} ItalianTaxes.com • All rights reserved
          </div>
          <p className="text-sm text-gray-500">
            Filing taxes in Italy made easy.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
