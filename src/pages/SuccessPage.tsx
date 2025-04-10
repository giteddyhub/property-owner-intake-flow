
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SuccessPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Submission Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for completing the form. Your information has been successfully submitted.
        </p>
        <Link to="/">
          <Button className="bg-form-300 hover:bg-form-400 text-white w-full">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;
