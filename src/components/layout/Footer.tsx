
import React from 'react';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 bg-gray-50 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <img 
            src="/lovable-uploads/48bc5456-f226-4712-9539-95497e28024c.png" 
            alt="ItalianTaxes.com Logo" 
            className="h-12 w-auto mb-2 object-contain"
          />
          
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
