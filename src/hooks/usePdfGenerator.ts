
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UsePdfGeneratorResult = {
  loading: boolean;
  generatePdf: (contactId: string) => Promise<{ pdf: Uint8Array; checkoutLink: string } | null>;
};

export const usePdfGenerator = (): UsePdfGeneratorResult => {
  const [loading, setLoading] = useState(false);
  
  const generatePdf = async (contactId: string) => {
    try {
      setLoading(true);
      
      if (!contactId) {
        toast.error('Contact information not found. Please try again or contact support.');
        return null;
      }
      
      console.log('Generating PDF for contact:', contactId);
      
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { contactId },
      });
      
      if (error) {
        console.error('PDF generation error:', error);
        toast.error(`Error generating PDF: ${error.message}`);
        throw error;
      }
      
      if (!data?.pdf || !data?.checkoutLink) {
        const errorMsg = 'No PDF data returned from server';
        console.error(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('PDF generated successfully');
      toast.success('Your Italian Tax Profile PDF has been generated successfully!');
      
      // Convert the PDF array back to Uint8Array
      const pdfBytes = new Uint8Array(data.pdf);
      
      return {
        pdf: pdfBytes,
        checkoutLink: data.checkoutLink
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Unable to generate PDF. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generatePdf
  };
};
