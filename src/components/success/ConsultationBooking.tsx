
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Calendar, Video } from 'lucide-react';

const ConsultationBooking = () => {
  const [isCalendlyLoaded, setIsCalendlyLoaded] = useState(false);
  const standardWidgetRef = useRef<HTMLDivElement>(null);
  const primeWidgetRef = useRef<HTMLDivElement>(null);

  // More thorough cleanup function to remove any existing Calendly widgets and popups
  const cleanupWidgets = () => {
    // Remove any existing Calendly inline widgets that aren't in our controlled containers
    const existingWidgets = document.querySelectorAll('.calendly-inline-widget');
    existingWidgets.forEach(widget => {
      const isInOurContainers = 
        (standardWidgetRef.current && standardWidgetRef.current.contains(widget)) || 
        (primeWidgetRef.current && primeWidgetRef.current.contains(widget));
      
      if (!isInOurContainers && widget.parentNode) {
        widget.parentNode.removeChild(widget);
      }
    });
    
    // Remove any Calendly popups and overlays
    document.querySelectorAll('.calendly-overlay, .calendly-popup-content').forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  };

  useEffect(() => {
    // Only add the script once
    if (!document.getElementById('calendly-script')) {
      const script = document.createElement('script');
      script.id = 'calendly-script';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        setIsCalendlyLoaded(true);
        initializeWidgets();
      };
      document.body.appendChild(script);
    } else {
      setIsCalendlyLoaded(true);
      initializeWidgets();
    }

    // Run cleanup when component unmounts
    return () => {
      cleanupWidgets();
    };
  }, []);

  const initializeWidgets = () => {
    if (!window.Calendly) return;
    
    // Clear any existing widgets first
    cleanupWidgets();
    
    // Short delay to ensure DOM is ready
    setTimeout(() => {
      if (standardWidgetRef.current) {
        // Only initialize if the container is empty
        if (!standardWidgetRef.current.querySelector('.calendly-inline-widget')) {
          window.Calendly.initInlineWidget({
            url: 'https://calendly.com/n-metta/30min-consult-nm?primary_color=4e2d92',
            parentElement: standardWidgetRef.current,
            prefill: {},
            utm: {}
          });
        }
      }
      
      if (primeWidgetRef.current) {
        // Only initialize if the container is empty
        if (!primeWidgetRef.current.querySelector('.calendly-inline-widget')) {
          window.Calendly.initInlineWidget({
            url: 'https://calendly.com/n-metta/30min-prime-consultation-nm?primary_color=4e2d92',
            parentElement: primeWidgetRef.current,
            prefill: {},
            utm: {}
          });
        }
      }
    }, 300);
  };

  // Handle tab change - reinitialize the selected widget
  const handleTabChange = (value: string) => {
    // Clean up any widgets that might have been created outside our refs
    cleanupWidgets();
    
    // Slight delay to ensure the DOM is updated
    setTimeout(() => {
      if (window.Calendly) {
        if (value === 'standard' && standardWidgetRef.current) {
          // Check if widget already exists in container
          if (!standardWidgetRef.current.querySelector('.calendly-inline-widget')) {
            window.Calendly.initInlineWidget({
              url: 'https://calendly.com/n-metta/30min-consult-nm?primary_color=4e2d92',
              parentElement: standardWidgetRef.current,
              prefill: {},
              utm: {}
            });
          }
        } else if (value === 'prime' && primeWidgetRef.current) {
          // Check if widget already exists in container
          if (!primeWidgetRef.current.querySelector('.calendly-inline-widget')) {
            window.Calendly.initInlineWidget({
              url: 'https://calendly.com/n-metta/30min-prime-consultation-nm?primary_color=4e2d92',
              parentElement: primeWidgetRef.current,
              prefill: {},
              utm: {}
            });
          }
        }
      }
    }, 300);
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
            <span className="text-sm text-purple-800">
              All consultations are conducted via Zoom, Teams, Phone call, or WhatsApp
            </span>
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
                  ref={standardWidgetRef}
                  className="standard-calendly-widget" 
                  style={{ minWidth: '320px', height: '750px' }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="prime">
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600 mb-2">
                  Prime consultation times are reserved for urgent matters that need immediate attention.
                </div>
                <div 
                  ref={primeWidgetRef}
                  className="prime-calendly-widget" 
                  style={{ minWidth: '320px', height: '750px' }}
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
