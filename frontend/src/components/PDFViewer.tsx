'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { pdfjs, configurePDFWorker } from '@/lib/pdf-config';

// Required imports for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
  file: File | null;
  onLoadSuccess?: (numPages: number) => void;
  onError?: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ file, onLoadSuccess, onError }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  // Ensure PDF worker is configured on mount
  useEffect(() => {
    configurePDFWorker();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setPageNumber(1);
    onLoadSuccess?.(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    console.error('Worker src:', pdfjs.GlobalWorkerOptions.workerSrc);
    console.error('PDF.js version:', pdfjs.version);
    console.error('File type:', file?.type);
    console.error('File size:', file?.size);
    
    // Call the error callback if provided
    if (onError) {
      onError();
    }
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const changeScale = (offset: number) => {
    setScale(prevScale => Math.min(Math.max(0.5, prevScale + offset), 3.0));
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500">No PDF selected</p>
          <p className="text-sm text-gray-400">Upload a PDF to view it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900/50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-300">
            Page {pageNumber} of {numPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeScale(-0.2)}
            disabled={scale <= 0.5}
            className="border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-300">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeScale(0.2)}
            disabled={scale >= 3.0}
            className="border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30">
        {file ? (
          <div className="flex justify-center">
            <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center p-8 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading PDF...</span>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center p-8 text-red-400">
                    <div className="text-center">
                      <p>Failed to load PDF. Please try again.</p>
                      <p className="text-sm mt-2">Check browser console for details.</p>
                    </div>
                  </div>
                }
              >
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale}
                  loading={
                    <div className="flex items-center justify-center p-8 text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="ml-2">Loading page...</span>
                    </div>
                  }
                />
              </Document>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full w-fit mx-auto mb-4">
                <svg className="h-16 w-16 mx-auto text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg text-gray-400">Select a PDF file to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
