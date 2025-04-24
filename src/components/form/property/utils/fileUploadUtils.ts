
import { supabase } from '@/integrations/supabase/client';
import { PropertyDocument } from '@/types/form';

export const uploadPropertyDocument = async (file: File): Promise<PropertyDocument> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError, data } = await supabase.storage
    .from('property_documents')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
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
