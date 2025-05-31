
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDocumentDownload = () => {
  const handleDownloadDocument = async (documentData: string, fileName: string) => {
    try {
      let downloadUrl: string;
      
      // Check if documentData is already a full URL
      if (documentData.startsWith('http')) {
        downloadUrl = documentData;
      } else {
        // Assume it's a file path in the property_documents bucket
        const { data } = supabase.storage
          .from('property_documents')
          .getPublicUrl(documentData);
        
        downloadUrl = data.publicUrl;
      }

      // Test if the file exists by making a HEAD request
      try {
        const response = await fetch(downloadUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error('File not found');
        }
      } catch (error) {
        console.error('Document not accessible:', error);
        toast.error('Document is not available for download');
        return;
      }

      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Document download started');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  return { handleDownloadDocument };
};
