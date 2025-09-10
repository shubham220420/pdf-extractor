'use client';

import React, { useState } from 'react';
import { PDFViewer } from '@/components/PDFViewer';
import { InvoiceForm } from '@/components/InvoiceForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Brain, List } from 'lucide-react';
import { apiService } from '@/lib/api';
import { UploadResponse, ExtractResponse } from '@/types';

interface FormData {
  vendor: {
    name: string;
    address?: string;
    taxId?: string;
  };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: Array<{
      description: string;
      unitPrice: number;
      quantity: number;
      total: number;
    }>;
  };
}
import Link from 'next/link';

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiModel, setAiModel] = useState<'gemini' | 'groq'>('gemini');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 25 * 1024 * 1024) {
        alert('File size must be less than 25MB');
        return;
      }
      setSelectedFile(file);
      setUploadedFile(null);
      setExtractedData(null);
    } else {
      alert('Please select a PDF file');
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
    try {
      const result = await apiService.extractData(uploadedFile.fileId);
      setExtractedData(result);
      console.log('Data extracted successfully:', result);
    } catch (error) {
      console.error('Extraction failed:', error);
      alert('Extraction failed. Please check your API keys and try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    if (!uploadedFile) return;

    setIsSaving(true);
    try {
      const invoiceData = {
        fileId: uploadedFile.fileId,
        fileName: uploadedFile.fileName,
        ...formData,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PDF Invoice Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/invoices">
                <Button variant="outline">
                  <List className="h-4 w-4 mr-2" />
                  View All Invoices
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - PDF Viewer */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">PDF Viewer</h2>
              
              {/* File Upload */}
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="pdf-file">Select PDF File (max 25MB)</Label>
                  <Input
                    id="pdf-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>
                
                {selectedFile && !uploadedFile && (
                  <Button onClick={handleUpload} disabled={isUploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload PDF'}
                  </Button>
                )}
                
                {uploadedFile && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <select
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value as 'gemini' | 'groq')}
                        className="px-3 py-1 border rounded-md text-sm"
                        aria-label="Select AI model"
                      >
                        <option value="gemini">Gemini AI</option>
                        <option value="groq">Groq AI</option>
                      </select>
                      <Button onClick={handleExtract} disabled={isExtracting}>
                        <Brain className="h-4 w-4 mr-2" />
                        {isExtracting ? 'Extracting...' : 'Extract with AI'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-[calc(100%-140px)]">
              <PDFViewer file={selectedFile} />
            </div>
          </div>

          {/* Right Panel - Invoice Form */}
          <div className="bg-white rounded-lg shadow-sm border overflow-auto">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Invoice Data</h2>
            </div>
            
            <div className="p-4">
              {!extractedData && !uploadedFile && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Upload a PDF and extract data to see the invoice form</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {uploadedFile && (
                <InvoiceForm
                  extractedData={extractedData || undefined}
                  onSave={handleSave}
                  isLoading={isSaving}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
