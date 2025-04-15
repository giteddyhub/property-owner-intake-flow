
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PdfOptions = {
  filename?: string;
  openInNewTab?: boolean;
};

export type GeneratePdfResult = {
  pdf: Uint8Array;
  checkoutLink: string;
};

export type UsePdfGeneratorResult = {
  loading: boolean;
  error: Error | null;
  generatePdf: (contactId: string, options?: PdfOptions) => Promise<GeneratePdfResult | null>;
  downloadPdf: (pdf: Uint8Array, filename?: string) => void;
  viewPdf: (pdf: Uint8Array) => void;
  copyCheckoutLink: (link: string) => void;
};

const DEFAULT_FILENAME = 'Italian-Tax-Profile.pdf';

export const usePdfGenerator = (): UsePdfGeneratorResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const generatePdf = async (contactId: string, options?: PdfOptions): Promise<GeneratePdfResult | null> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!contactId) {
        const error = new Error('Contact information not found. Please try again or contact support.');
        toast.error(error.message);
        setError(error);
        return null;
      }
      
      console.log('Generating PDF for contact:', contactId);
      
      const { data, error: apiError } = await supabase.functions.invoke('generate-pdf', {
        body: { contactId },
      });
      
      if (apiError) {
        console.error('PDF generation error:', apiError);
        toast.error(`Error generating PDF: ${apiError.message}`);
        setError(apiError);
        throw apiError;
      }
      
      if (!data?.pdf || !data?.checkoutLink) {
        const errorMsg = 'No PDF data returned from server';
        console.error(errorMsg);
        toast.error(errorMsg);
        setError(new Error(errorMsg));
        throw new Error(errorMsg);
      }
      
      console.log('PDF generated successfully');
      toast.success('Your Italian Tax Profile PDF has been generated successfully!');
      
      // Convert the PDF array back to Uint8Array
      const pdfBytes = new Uint8Array(data.pdf);
      
      // Automatically download or view based on options
      if (options?.openInNewTab) {
        viewPdf(pdfBytes);
      } else {
        downloadPdf(pdfBytes, options?.filename);
      }
      
      return {
        pdf: pdfBytes,
        checkoutLink: data.checkoutLink
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error generating PDF');
      console.error('Error generating PDF:', error);
      toast.error('Unable to generate PDF. Please try again later.');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = (pdf: Uint8Array, filename = DEFAULT_FILENAME) => {
    try {
      // Create a blob from the PDF data
      const blob = new Blob([pdf], { type: 'application/pdf' });
      
      // Create a download link for the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`PDF downloaded as ${filename}`);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast.error('Failed to download PDF');
    }
  };

  const viewPdf = (pdf: Uint8Array) => {
    try {
      // Create a blob from the PDF data
      const blob = new Blob([pdf], { type: 'application/pdf' });
      
      // Open PDF in a new tab
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the object URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error viewing PDF:', err);
      toast.error('Failed to open PDF for viewing');
    }
  };
  
  const copyCheckoutLink = (link: string) => {
    try {
      navigator.clipboard.writeText(link);
      toast.success('Checkout link copied to clipboard!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast.error('Failed to copy checkout link');
    }
  };

  return {
    loading,
    error,
    generatePdf,
    downloadPdf,
    viewPdf,
    copyCheckoutLink
  };
};
