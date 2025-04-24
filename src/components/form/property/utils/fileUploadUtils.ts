
import { supabase } from '@/integrations/supabase/client';
import { PropertyDocument } from '@/types/form';
import { toast } from 'sonner';

// Maximum file size: 5MB (5 * 1024 * 1024 bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const uploadPropertyDocument = async (file: File): Promise<PropertyDocument> => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    toast.error(`File ${file.name} is too large. Maximum file size is 5MB.`);
    throw new Error('File size exceeds 5MB limit');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError, data } = await supabase.storage
    .from('property_documents')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    toast.error(`Failed to upload ${file.name}`);
    throw new Error('Failed to upload document');
  }

  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from('property_documents')
    .getPublicUrl(filePath);

  return {
    id: fileName,
    name: file.name,
    type: file.type,
    size: file.size,
    uploadDate: new Date(),
    url: publicUrl
  };
};

