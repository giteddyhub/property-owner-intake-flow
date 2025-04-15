
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ChevronRight, FileText, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    // Verify payment if we have a session ID from Stripe
    const verifyPayment = async () => {
      if (sessionId && !paymentVerified) {
        try {
          setLoading(true);
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { sessionId },
          });
          
          if (error) throw error;
          
          if (data.status === 'paid') {
            setPaymentStatus('paid');
            toast.success('Payment successful! Thank you for your purchase.');
          } else {
            setPaymentStatus(data.status);
          }
          
          setPaymentVerified(true);
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast.error('Unable to verify payment status');
        } finally {
          setLoading(false);
        }
      }
    };
    
    verifyPayment();
  }, [sessionId, paymentVerified]);
  
  const handleCheckout = async () => {
    try {
      setLoading(true);
      // Get the contact ID from localStorage or session storage
      // This should be saved after form submission
      const contactId = sessionStorage.getItem('contactId');
      
      if (!contactId) {
        toast.error('Contact information not found. Please try again or contact support.');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { contactId },
      });
      
      if (error) throw error;
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Unable to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Submission Successful!</h1>
          <p className="mt-2 text-lg text-gray-600">
            Thank you for submitting your property tax information.
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">What happens next?</h2>
              <p className="text-gray-600 mt-2">
                Your submitted information will be reviewed, and we'll prepare the relevant tax forms.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-form-100 text-form-600">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-medium text-gray-900">Information Review</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Our tax specialists will review the information you've provided.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-form-100 text-form-600">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-medium text-gray-900">Form Preparation</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We'll prepare the necessary tax forms based on your information.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-form-100 text-form-600">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-md font-medium text-gray-900">Communication</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We'll reach out to you via email if any additional information is needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Premium Service Offer Card */}
        {!sessionId && !paymentStatus && (
          <Card className="border-2 border-amber-200 bg-amber-50 mb-8">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Need Expert Help?</h2>
                  <p className="mt-2 text-gray-700">
                    Let our tax professionals handle everything for you
                  </p>
                </div>
                <div className="hidden md:block">
                  <FileText className="h-12 w-12 text-amber-500" />
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-700">Complete tax return preparation</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-700">Direct filing with Italian tax authorities</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-700">Personalized tax optimization advice</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-700">Priority support via email and phone</span>
                </div>
              </div>
              
              <div className="mt-8">
                <div className="flex items-baseline text-gray-900">
                  <span className="text-3xl font-bold">€299</span>
                  <span className="ml-1 text-sm text-gray-500">one-time fee</span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md flex items-center justify-center"
                >
                  {loading ? "Processing..." : "Purchase Full Service"}
                  {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
                
                <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  Secure payment via Stripe
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {/* Payment confirmation section */}
        {paymentStatus === 'paid' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <h2 className="ml-3 text-xl font-semibold text-green-800">Payment Successful</h2>
            </div>
            <p className="mt-2 text-green-700">
              Thank you for purchasing our full tax filing service! Our team will handle everything for you.
              You will receive a confirmation email with details shortly.
            </p>
          </div>
        )}
        
        <div className="text-center">
          <Link to="/">
            <Button variant="outline" className="mt-4">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
