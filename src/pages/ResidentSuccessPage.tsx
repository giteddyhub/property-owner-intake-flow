
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Book, ChevronRight } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const ResidentSuccessPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Thank You for Your Interest</h1>
            <p className="mt-2 text-lg text-gray-600">
              We've received your information and will notify you when our services are available for Italian residents.
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Learn More About Italian Taxes</h2>
                <p className="text-gray-600 mt-2">
                  While you wait, explore our Knowledge Hub with articles and resources about Italian taxation.
                </p>
              </div>
              
              <div className="bg-form-50 border border-form-200 rounded-lg p-6 mt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Book className="h-8 w-8 text-form-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Knowledge Hub</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Access professional insights, guides, and resources about Italian taxation.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full justify-between bg-form-300 hover:bg-form-400 text-white"
                    onClick={() => window.location.href = 'https://www.italiantaxes.com/articles'}
                  >
                    Visit our Knowledge Hub
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.href = 'https://www.italiantaxes.com/'}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ResidentSuccessPage;
