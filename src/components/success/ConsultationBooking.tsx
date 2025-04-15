
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, Video } from 'lucide-react';

const ConsultationBooking = () => {
  const [isCalendlyLoaded, setIsCalendlyLoaded] = useState(false);

  useEffect(() => {
    // Check if Calendly script is already loaded
    if (!document.getElementById('calendly-script')) {
      const script = document.createElement('script');
      script.id = 'calendly-script';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => setIsCalendlyLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsCalendlyLoaded(true);
    }

    // Cleanup function to remove script on component unmount
    return () => {
      // We don't remove the script as other components might be using it
    };
  }, []);

  // Force rerender of Calendly widgets when tab changes
  const handleTabChange = (value: string) => {
    // Slight delay to ensure the DOM is updated
    setTimeout(() => {
      if (window.Calendly) {
        window.Calendly.initInlineWidgets();
      }
    }, 100);
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-xl text-purple-800">Book a Professional Consultation</CardTitle>
        </div>
        <CardDescription>
          Schedule a 30-minute consultation with our tax experts to get personalized advice for your situation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 bg-purple-50 p-3 rounded-md">
            <Video className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-800">All consultations are conducted via Zoom video call</span>
          </div>

          <Tabs defaultValue="standard" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                <Clock className="h-4 w-4 mr-2" /> Standard Times
              </TabsTrigger>
              <TabsTrigger value="prime" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800">
                <Clock className="h-4 w-4 mr-2" /> Prime Times (Urgent)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard">
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600 mb-2">
                  Standard consultation times are perfect for general tax questions and planning.
                </div>
                <div 
                  className="calendly-inline-widget" 
                  data-url="https://calendly.com/n-metta/30min-consult-nm?primary_color=4e2d92" 
                  style={{ minWidth: '320px', height: '630px' }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="prime">
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600 mb-2">
                  Prime consultation times are reserved for urgent matters that need immediate attention.
                </div>
                <div 
                  className="calendly-inline-widget" 
                  data-url="https://calendly.com/n-metta/30min-prime-consultation-nm?primary_color=4e2d92" 
                  style={{ minWidth: '320px', height: '630px' }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultationBooking;
