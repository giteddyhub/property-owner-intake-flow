
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Link as LinkIcon, Eye } from 'lucide-react';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type PdfDownloadCardProps = {
  contactId: string;
};

const PdfDownloadCard = ({ contactId }: PdfDownloadCardProps) => {
  const { loading, generatePdf, viewPdf, copyCheckoutLink } = usePdfGenerator();
  const [checkoutLink, setCheckoutLink] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  
  const handleGeneratePdf = async () => {
    const result = await generatePdf(contactId);
    if (result) {
      setPdfData(result.pdf);
      setCheckoutLink(result.checkoutLink);
    }
  };
  
  const handleViewPdf = () => {
    if (pdfData) {
      viewPdf(pdfData);
    }
  };
  
  const handleCopyLink = () => {
    if (checkoutLink) {
      copyCheckoutLink(checkoutLink);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-form-500 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Italian Tax Profile</h2>
            <p className="text-gray-600 text-sm">
              Download your tax information and access your personalized checkout page
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-2">Download Your Information</h3>
          <p className="text-sm text-gray-500 mb-4">
            Get a complete PDF document with all your submitted information for your records. 
            The PDF also includes a direct link to your personalized checkout page.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleGeneratePdf} 
              disabled={loading}
              className="flex-1 flex items-center justify-center"
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? "Generating PDF..." : "Generate PDF"}
            </Button>
            
            {pdfData && (
              <Button
                variant="outline"
                onClick={handleViewPdf}
                className="flex items-center justify-center"
              >
                <Eye className="mr-2 h-4 w-4" />
                View PDF
              </Button>
            )}
          </div>
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
                onClick={handleCopyLink}
                className="rounded-l-none bg-amber-500 hover:bg-amber-600"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfDownloadCard;
