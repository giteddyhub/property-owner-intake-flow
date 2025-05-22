
import React, { useState } from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ResidencyAssessmentForm from '@/components/form/residency/ResidencyAssessmentForm';

const ResidencyAssessmentPage: React.FC = () => {
  const [showAssessment, setShowAssessment] = useState(false);
  
  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {!showAssessment ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Italian Tax Residency Assessment</h1>
              <p className="text-gray-600">
                This guide will help you determine if you're considered a tax resident in Italy.
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader className="bg-purple-50 border-b border-purple-100">
                <CardTitle className="text-xl text-purple-900">What makes someone an Italian tax resident?</CardTitle>
                <CardDescription className="text-purple-700">
                  According to Italian tax law, you're considered a tax resident if you meet ANY ONE of the following conditions:
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Registry Office Registration</h3>
                      <p className="text-gray-600 mt-1">
                        You are registered with the Italian Registry Office (Anagrafe) for the majority of the tax period (more than 182 days in a calendar year).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Habitual Abode</h3>
                      <p className="text-gray-600 mt-1">
                        You have your habitual abode in Italy, meaning you regularly live or spend significant time in Italy.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Center of Economic Interests</h3>
                      <p className="text-gray-600 mt-1">
                        The main center of your business, economic, or personal interests is in Italy.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-xl text-blue-900">Common Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="pb-4 border-b border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-2">You likely ARE an Italian tax resident if:</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>You're registered with the local municipality (Comune) in Italy</li>
                      <li>You spend more than 182 days per year in Italy</li>
                      <li>Your family lives permanently in Italy while you work abroad</li>
                      <li>You own property in Italy that serves as your primary home</li>
                      <li>You have an Italian work contract and work primarily in Italy</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">You likely are NOT an Italian tax resident if:</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                      <li>You're a foreign national who spent 182 days or fewer in Italy</li>
                      <li>You have no registered address in Italy</li>
                      <li>Your primary economic interests and business activities are outside Italy</li>
                      <li>You own property in Italy but it's used only for vacations</li>
                      <li>You're registered as a tax resident in another country where you primarily live and work</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader className="bg-amber-50 border-b border-amber-100">
                <CardTitle className="text-xl text-amber-900">Interactive Assessment Tool</CardTitle>
                <CardDescription className="text-amber-700">
                  Still not sure about your tax residency status? Take our detailed assessment to get a clearer picture.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Our assessment tool will ask you a series of questions about your situation in Italy and provide you with a recommendation based on your specific circumstances.
                  </p>
                  <Button 
                    onClick={() => setShowAssessment(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 relative 
                      animate-pulse-border 
                      hover:animate-none 
                      border-2 border-purple-300/50 
                      hover:border-purple-500"
                  >
                    Begin Detailed Assessment <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 border-amber-200">
              <CardHeader className="bg-amber-50 border-b border-amber-100">
                <CardTitle className="text-xl text-amber-900">Important Considerations</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 text-gray-600">
                  <p>
                    <span className="font-medium text-gray-900">Double Taxation:</span> Italy has tax treaties with many countries to prevent double taxation, but you need to understand how these apply to your specific situation.
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Worldwide Income:</span> Italian tax residents are taxed on their worldwide income, not just income from Italian sources.
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Tax Return Requirements:</span> If you're determined to be an Italian tax resident, you must file Italian tax returns reporting your global income.
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Legal Advice:</span> Residency determinations can be complex and depend on your specific circumstances. For definitive guidance, consult with a tax professional.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <a 
                href="https://www.agenziaentrate.gov.it/portale/web/english/nse/individuals/tax-identification-number-for-foreign-citizens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                Official Italian Tax Agency Information <ExternalLink className="h-4 w-4" />
              </a>
              
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.close()}
                >
                  Close Assessment
                </Button>
                <Button
                  onClick={() => window.close()}
                >
                  Return to Form
                </Button>
              </div>
            </div>
          </>
        ) : (
          <ResidencyAssessmentForm onBack={() => setShowAssessment(false)} />
        )}
      </div>
    </div>
  );
};

export default ResidencyAssessmentPage;
