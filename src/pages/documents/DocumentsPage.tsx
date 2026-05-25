import React, { useEffect, useRef, useState } from 'react';
import { FileText, Upload, Download, Trash2, Share2, Eye } from 'lucide-react';
import { Document as PdfDocument, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { deleteDocument, getDocuments, updateDocument, uploadDocument, uploadSignature } from '../../api/documents';
import toast from 'react-hot-toast';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const [signatureTargetId, setSignatureTargetId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [pdfPageNumber, setPdfPageNumber] = useState(1);
  const fileBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  useEffect(() => {
    let isMounted = true;
    getDocuments()
      .then(({ documents }) => {
        if (isMounted) {
          setDocuments(documents);
        }
      })
      .catch(() => toast.error('Failed to load documents'))
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDoc && documents.length > 0) {
      setSelectedDoc(documents[0]);
    }
  }, [documents, selectedDoc]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { document } = await uploadDocument(file);
      setDocuments(prev => [document, ...prev]);
      toast.success('Document uploaded');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSignatureClick = (docId: string) => {
    setSignatureTargetId(docId);
    signatureInputRef.current?.click();
  };

  const handleSignatureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !signatureTargetId) return;

    try {
      const { document } = await uploadSignature(signatureTargetId, file);
      setDocuments(prev => prev.map(item => (item.id === signatureTargetId ? document : item)));
      setSelectedDoc(prev => (prev?.id === signatureTargetId ? document : prev));
      toast.success('Signature uploaded');
    } catch (error) {
      toast.error('Failed to upload signature');
    } finally {
      if (signatureInputRef.current) {
        signatureInputRef.current.value = '';
      }
      setSignatureTargetId(null);
    }
  };

  const handleToggleShare = async (doc: any) => {
    try {
      const { document } = await updateDocument(doc.id, { shared: !doc.shared });
      setDocuments(prev => prev.map(item => (item.id === doc.id ? document : item)));
      setSelectedDoc(prev => (prev?.id === doc.id ? document : prev));
    } catch (error) {
      toast.error('Failed to update sharing');
    }
  };

  const handleSelectDoc = (doc: any) => {
    setSelectedDoc(doc);
    setPdfPageNumber(1);
    setPdfPageCount(0);
  };

  const isPdf = (doc: any) => {
    const name = String(doc?.name || '').toLowerCase();
    const type = String(doc?.type || '').toLowerCase();
    const mime = String(doc?.mimeType || '').toLowerCase();
    return name.endsWith('.pdf') || type === 'pdf' || mime.includes('pdf');
  };

  const getDocUrl = (doc: any) => `${fileBaseUrl}${doc.url}`;

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument(docId);
      setDocuments(prev => {
        const nextDocs = prev.filter(item => item.id !== docId);
        if (selectedDoc?.id === docId) {
          setSelectedDoc(nextDocs[0] || null);
          setPdfPageNumber(1);
          setPdfPageCount(0);
        }
        return nextDocs;
      });
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your startup's important files</p>
        </div>
        
        <Button leftIcon={<Upload size={18} />} onClick={handleUploadClick}>
          Upload Document
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={signatureInputRef}
          type="file"
          className="hidden"
          onChange={handleSignatureChange}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">12.5 GB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-600 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">7.5 GB</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Access</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Recent Files
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Shared with Me
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Starred
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Trash
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Document list */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Sort by
                </Button>
                <Button variant="outline" size="sm">
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="p-2 bg-primary-50 rounded-lg mr-4">
                      <FileText size={24} className="text-primary-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {doc.name}
                        </h3>
                        {doc.shared && (
                          <Badge variant="secondary" size="sm">Shared</Badge>
                        )}
                        {doc.status === 'signed' && (
                          <Badge variant="success" size="sm">Signed</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                        <span>Modified {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2"
                        aria-label="Preview"
                        onClick={() => handleSelectDoc(doc)}
                      >
                        <Eye size={18} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2"
                        aria-label="Download"
                        onClick={() => window.open(getDocUrl(doc), '_blank')}
                      >
                        <Download size={18} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2"
                        aria-label="Share"
                        onClick={() => handleToggleShare(doc)}
                      >
                        <Share2 size={18} />
                      </Button>

                      {doc.status !== 'signed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          aria-label="Sign"
                          onClick={() => handleSignatureClick(doc.id)}
                        >
                          Sign
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-error-600 hover:text-error-700"
                        aria-label="Delete"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Preview</h2>
              {selectedDoc && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getDocUrl(selectedDoc), '_blank')}
                >
                  Open in new tab
                </Button>
              )}
            </CardHeader>
            <CardBody>
              {!selectedDoc ? (
                <p className="text-gray-600">Select a document to preview.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{selectedDoc.name}</h3>
                      <p className="text-xs text-gray-500">
                        {selectedDoc.type} • {selectedDoc.size}
                      </p>
                    </div>
                    {selectedDoc.signatureUrl && (
                      <img
                        src={`${fileBaseUrl}${selectedDoc.signatureUrl}`}
                        alt="Signature"
                        className="h-10 border border-gray-200 rounded"
                      />
                    )}
                  </div>

                  {isPdf(selectedDoc) ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Page {pdfPageNumber} of {pdfPageCount || 1}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pdfPageNumber <= 1}
                            onClick={() => setPdfPageNumber(prev => Math.max(prev - 1, 1))}
                          >
                            Prev
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pdfPageCount > 0 && pdfPageNumber >= pdfPageCount}
                            onClick={() => setPdfPageNumber(prev => prev + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                        <PdfDocument
                          file={getDocUrl(selectedDoc)}
                          onLoadSuccess={({ numPages }) => setPdfPageCount(numPages)}
                          loading={<p className="text-sm text-gray-600">Loading preview...</p>}
                        >
                          <Page
                            pageNumber={pdfPageNumber}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </PdfDocument>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 rounded-md p-6 text-center">
                      <p className="text-sm text-gray-600">Preview is available for PDF documents only.</p>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};