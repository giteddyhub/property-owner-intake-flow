import React, { useState } from 'react';
import { usePropertyForm } from './context/PropertyFormContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UploadCloud, FileText, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPropertyDocument } from './utils/fileUploadUtils';

const PropertyDocumentsSection = () => {
  const { currentProperty, setCurrentProperty } = usePropertyForm();
  const [useRetrievalService, setUseRetrievalService] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploadingDocument(true);
      
      try {
        const newDocuments = [...(currentProperty.documents || [])];
        
        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          const uploadedDoc = await uploadPropertyDocument(file);
          newDocuments.push(uploadedDoc);
        }
        
        setCurrentProperty(prev => ({
          ...prev,
          documents: newDocuments
        }));
        
        toast.success('Documents uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload documents');
      } finally {
        setIsUploadingDocument(false);
      }
    }
  };
  
  const handleRemoveDocument = (documentId: string) => {
    setCurrentProperty(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(doc => doc.id !== documentId)
    }));
    toast.success('Document removed');
  };
  
  const handleRetrievalToggle = (checked: boolean) => {
    setUseRetrievalService(checked);
    
    if (checked) {
      setCurrentProperty(prev => ({
        ...prev,
        useDocumentRetrievalService: true
      }));
      toast.success('Document retrieval service selected');
    } else {
      setCurrentProperty(prev => ({
        ...prev,
        useDocumentRetrievalService: false
      }));
    }
  };

  return (
    <div className="border rounded-md p-4 mt-6 bg-white">
      <h3 className="text-lg font-medium mb-4">Property Documents</h3>
      
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="document-retrieval-toggle" className="flex items-center space-x-2 cursor-pointer">
            <div className="flex items-center space-x-2">
              <Switch 
                id="document-retrieval-toggle" 
                checked={useRetrievalService}
                onCheckedChange={handleRetrievalToggle}
              />
              <span>Use document retrieval service (+€28 fee)</span>
            </div>
          </Label>
          
          {useRetrievalService ? (
            <div className="bg-gray-50 p-4 rounded-md mt-2">
              <div className="flex items-start space-x-3">
                <Euro className="h-10 w-10 text-form-400 mt-1" />
                <div>
                  <p className="font-medium">Document Retrieval Service</p>
                  <p className="text-sm text-gray-500">
                    We will retrieve all necessary documents from the property registry for you.
                    This service costs €28 and will be added to your total upon checkout.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center mt-2">
                <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center mb-2">
                  Upload your property documents (purchase deeds, title, etc.)
                </p>
                <Input
                  type="file"
                  multiple
                  className="hidden"
                  id="document-upload"
                  onChange={handleFileChange}
                  disabled={isUploadingDocument}
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('document-upload')?.click()}
                  disabled={isUploadingDocument}
                >
                  {isUploadingDocument ? 'Uploading...' : 'Select Files'}
                </Button>
              </div>
              
              {currentProperty.documents && currentProperty.documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {currentProperty.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-form-300" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveDocument(doc.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDocumentsSection;
