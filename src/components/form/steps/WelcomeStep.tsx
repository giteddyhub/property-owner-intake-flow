import React from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/contexts/FormContext';
import { ArrowRight, Home, Calendar, Euro, Percent, FileText, ScanFace } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
const WelcomeStep: React.FC = () => {
  const {
    nextStep
  } = useFormContext();
  const handleGetStarted = () => {
    nextStep();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return <div className="text-center max-w-2xl mx-auto py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-form-400 mb-2 relative inline-block">Italian Tax Profile</h1>
        <h2 className="text-xl text-form-300 font-medium">for property owners</h2>
      </div>
      
      <Card className="mb-10 text-left shadow-lg border-form-200 overflow-hidden">
        <div className="bg-gradient-to-r from-form-300/10 to-form-200 py-3 px-6 border-b border-form-200">
          <h3 className="font-medium text-form-400">What you'll need</h3>
        </div>
        
        <CardContent className="p-6">
          <p className="mb-4 text-form-400/90">
            This form will guide you through the process of registering property ownership information 
            for tax purposes in Italy. Please have the following information ready:
          </p>
          
          <ul className="space-y-3 mb-6 list-none">
            <li className="flex items-start group transition-all duration-300 hover:translate-x-1">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-form-300/10 text-form-300 rounded-full mr-3 group-hover:bg-form-300 group-hover:text-white transition-all duration-300">
                <FileText className="h-3.5 w-3.5" />
              </span>
              <span className="text-form-400/90">Personal details for all property owners</span>
            </li>
            <li className="flex items-start group transition-all duration-300 hover:translate-x-1">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-form-300/10 text-form-300 rounded-full mr-3 group-hover:bg-form-300 group-hover:text-white transition-all duration-300">
                <Home className="h-3.5 w-3.5" />
              </span>
              <span className="text-form-400/90">Property addresses and details</span>
            </li>
            <li className="flex items-start group transition-all duration-300 hover:translate-x-1">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-form-300/10 text-form-300 rounded-full mr-3 group-hover:bg-form-300 group-hover:text-white transition-all duration-300">
                <Calendar className="h-3.5 w-3.5" />
              </span>
              <span className="text-form-400/90">Purchase/sale dates and prices (if applicable)</span>
            </li>
            <li className="flex items-start group transition-all duration-300 hover:translate-x-1">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-form-300/10 text-form-300 rounded-full mr-3 group-hover:bg-form-300 group-hover:text-white transition-all duration-300">
                <Euro className="h-3.5 w-3.5" />
              </span>
              <span className="text-form-400/90">Rental income information (if applicable)</span>
            </li>
            <li className="flex items-start group transition-all duration-300 hover:translate-x-1">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-form-300/10 text-form-300 rounded-full mr-3 group-hover:bg-form-300 group-hover:text-white transition-all duration-300">
                <Percent className="h-3.5 w-3.5" />
              </span>
              <span className="text-form-400/90">Ownership percentages for each property</span>
            </li>
            <li className="flex items-start group transition-all duration-300 hover:translate-x-1">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-form-300/10 text-form-300 rounded-full mr-3 group-hover:bg-form-300 group-hover:text-white transition-all duration-300">
                <ScanFace className="h-3.5 w-3.5" />
              </span>
              <span className="text-form-400/90">Italian tax codes (mandatory)</span>
            </li>
          </ul>
          
          <div className="bg-form-300/5 p-4 rounded-lg mb-6 border border-form-300/10">
            <p className="font-medium text-form-400 mb-2">
              The form includes four main steps:
            </p>
            
            <ol className="list-none space-y-2">
              <li className="flex items-center">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-form-300 text-white text-xs font-medium mr-2">1</span>
                <span><strong>Owner Profiles</strong> - Personal and residency information</span>
              </li>
              <li className="flex items-center">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-form-300 text-white text-xs font-medium mr-2">2</span>
                <span><strong>Property Details</strong> - Addresses and activity information</span>
              </li>
              <li className="flex items-center">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-form-300 text-white text-xs font-medium mr-2">3</span>
                <span><strong>Owner Assignments</strong> - Link owners to properties with percentages</span>
              </li>
              <li className="flex items-center">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-form-300 text-white text-xs font-medium mr-2">4</span>
                <span><strong>Review & Submit</strong> - Verify and submit your information</span>
              </li>
            </ol>
          </div>
          
          <p className="text-form-400/80 text-sm">
            You can navigate between steps using the progress bar at the top.
          </p>
        </CardContent>
      </Card>
      
      <Button onClick={handleGetStarted} className="bg-form-300 hover:bg-form-400 text-white flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" size="lg">
        Get Started
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>;
};
export default WelcomeStep;