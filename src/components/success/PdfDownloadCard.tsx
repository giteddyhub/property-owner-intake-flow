import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Link as LinkIcon } from 'lucide-react';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';
import { toast } from 'sonner';

type PdfDownloadCardProps = {
  contactId: string;
};

const PdfDownloadCard = ({ contactId }: PdfDownloadCardProps) => {
  const { loading, generatePdf } = usePdfGenerator();
  const [checkoutLink, setCheckoutLink] = useState<string | null>(null);
  
  const handleGeneratePdf = async () => {
    const result = await generatePdf(contactId);
    if (result) {
      // Create a blob from the PDF data
      const blob = new Blob([result.pdf], { type: 'application/pdf' });
      
      // Create a download link for the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Italian-Tax-Profile.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Store the checkout link
      setCheckoutLink(result.checkoutLink);
    }
  };
  
  const copyToClipboard = () => {
    if (checkoutLink) {
      navigator.clipboard.writeText(checkoutLink);
      toast.success('Checkout link copied to clipboard!');
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div className="px-6 py-8">
        <div className="flex items-center justify-center mb-6">
          <FileText className="h-12 w-12 text-form-500 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Italian Tax Profile</h2>
            <p className="text-gray-600 mt-1">
              Download your tax information and access your personalized checkout page
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Download Your Information</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get a complete PDF document with all your submitted information for your records. 
              The PDF also includes a direct link to your personalized checkout page.
            </p>
            <Button 
              onClick={handleGeneratePdf} 
              disabled={loading}
              className="w-full flex items-center justify-center"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Generating PDF..." : "Download Italian Tax Profile"}
            </Button>
          </div>
          
          {checkoutLink && (
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
              <h3 className="font-medium text-amber-900 mb-2">Your Personalized Checkout Link</h3>
              <p className="text-sm text-amber-700 mb-4">
                This unique link provides access to your personalized checkout page whenever you need it.
              </p>
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={checkoutLink} 
                  readOnly 
                  className="flex-1 p-2 text-sm bg-white border border-amber-300 rounded-l-md"
                />
                <Button 
                  onClick={copyToClipboard}
                  className="rounded-l-none bg-amber-500 hover:bg-amber-600"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfDownloadCard;
