'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { InvoiceForm } from '@/components/InvoiceForm';
import { SimplePDFViewer } from '@/components/SimplePDFViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Brain, 
  List, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Eye,
  RotateCcw
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { UploadResponse, ExtractResponse, Vendor, InvoiceData } from '@/types';
import Link from 'next/link';

// Dynamic import for PDF viewer to avoid SSR issues
const PDFViewer = dynamic(() => import('@/components/PDFViewer').then(mod => ({ default: mod.PDFViewer })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
        <p className="text-muted-foreground">Loading PDF viewer...</p>
      </div>
    </div>
  )
});

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [pdfViewerError, setPdfViewerError] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 25 * 1024 * 1024) {
        alert('File size must be less than 25MB');
        return;
      }
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      setSelectedFile(file);
      setUploadedFile(null);
      setExtractedData(null);
    } else {
      alert('Please select a PDF file');
      console.error('Invalid file type:', file?.type);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const result = await apiService.uploadPDF(selectedFile);
      setUploadedFile(result);
      console.log('File uploaded successfully:', result);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExtract = async () => {
    if (!uploadedFile) return;

    setIsExtracting(true);
    setExtractionProgress(0);
    
    // Animate progress
    const progressInterval = setInterval(() => {
      setExtractionProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 300);

    try {
      const result = await apiService.extractData(uploadedFile.fileId);
      setExtractionProgress(100);
      setTimeout(() => {
        setExtractedData(result);
        console.log('Data extracted successfully:', result);
      }, 500);
    } catch (error) {
      console.error('Extraction failed:', error);
      alert('Extraction failed. Please check your API key and try again.');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsExtracting(false);
        setExtractionProgress(0);
      }, 1000);
    }
  };

  const handleSave = async (formData: { vendor: unknown; invoice: unknown }) => {
    if (!uploadedFile) return;

    setIsSaving(true);
    try {
      const invoiceData = {
        fileId: uploadedFile.fileId,
        fileName: uploadedFile.fileName,
        vendor: formData.vendor as Vendor,
        invoice: formData.invoice as InvoiceData,
      };
      
      const result = await apiService.invoices.create(invoiceData);
      console.log('Invoice saved successfully:', result);
      alert('Invoice saved successfully!');
      
      // Reset form
      setSelectedFile(null);
      setUploadedFile(null);
      setExtractedData(null);
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="border-b bg-card/50 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">PDF Invoice Processor</h1>
                <p className="text-sm text-muted-foreground">AI-powered data extraction</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="hidden sm:flex">
                <Sparkles className="mr-1 h-3 w-3" />
                Gemini AI
              </Badge>
              <Link href="/invoices">
                <Button variant="outline" size="sm">
                  <List className="mr-2 h-4 w-4" />
                  View Invoices
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[calc(100vh-160px)] lg:h-[calc(100vh-180px)]">
          {/* Left Panel - PDF Viewer */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>PDF Viewer</span>
                </CardTitle>
                {selectedFile && (
                  <Badge variant="secondary" className="text-xs">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
              {/* Upload Section */}
              <div className="space-y-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="pdf-upload" className="text-sm font-medium">
                    Upload PDF Document
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    {selectedFile && !uploadedFile && (
                      <Button onClick={handleUpload} disabled={isUploading} size="sm">
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {uploadedFile && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleExtract} 
                      disabled={isExtracting}
                      className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white shadow-lg"
                    >
                      {isExtracting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Extracting... {Math.round(extractionProgress)}%
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Extract Data
                        </>
                      )}
                    </Button>
                    
                    {extractedData && (
                      <Button variant="outline" onClick={() => {
                        setSelectedFile(null);
                        setUploadedFile(null);
                        setExtractedData(null);
                      }}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                {isExtracting && (
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-violet-600 h-2 rounded-full progress-bar transition-all duration-300"
                        data-progress={Math.round(extractionProgress / 10) * 10}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Processing with Gemini AI...
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* PDF Display Area */}
              <div className="flex-1 min-h-0">
                {pdfViewerError ? (
                  <div className="flex flex-col h-full space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Simple PDF Viewer</p>
                      <Button
                        onClick={() => setPdfViewerError(false)}
                        variant="outline"
                        size="sm"
                      >
                        Try Advanced
                      </Button>
                    </div>
                    <div className="flex-1">
                      <SimplePDFViewer file={selectedFile} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Advanced PDF Viewer</p>
                      <Button
                        onClick={() => setPdfViewerError(true)}
                        variant="outline"
                        size="sm"
                      >
                        Use Simple
                      </Button>
                    </div>
                    <div className="flex-1">
                      <PDFViewer 
                        file={selectedFile} 
                        onError={() => {
                          console.log('PDF Viewer failed, switching to Simple PDF Viewer');
                          setPdfViewerError(true);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Invoice Form */}
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Invoice Data</span>
                {extractedData && (
                  <Badge variant="default" className="ml-auto">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Extracted
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {!uploadedFile && !extractedData ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Brain className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Ready to Extract</h3>
                    <p className="text-muted-foreground max-w-md">
                      Upload a PDF invoice and click &ldquo;Extract Data&rdquo; to automatically extract vendor and invoice information using AI.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>Powered by Google Gemini AI</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {uploadedFile && !extractedData && (
                    <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">
                          Click &ldquo;Extract Data&rdquo; to analyze the PDF
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {extractedData && (
                    <InvoiceForm
                      extractedData={extractedData}
                      onSave={handleSave}
                      isLoading={isSaving}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
