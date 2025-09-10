'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PDFConversionService } from '@/lib/pdf-conversion';

interface SimplePDFViewerProps {
  file: File | null;
}

export const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ file }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionAvailable, setConversionAvailable] = useState(false);

  // Check if conversion service is available
  useEffect(() => {
    PDFConversionService.checkHealth().then(setConversionAvailable);
  }, []);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      
      // Cleanup function to revoke the URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } catch (err) {
      console.error('Error creating object URL:', err);
      setError('Failed to create PDF URL');
      setIsLoading(false);
    }
  }, [file]);

  const handleDownload = () => {
    if (url && file) {
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleConvertPDF = async () => {
    if (!file || !conversionAvailable) return;

    setIsConverting(true);
    setError(null);

    try {
      console.log('Converting PDF using server-side conversion...');
      const convertedBlob = await PDFConversionService.convertPDF(file);
      
      // Create a new file from the converted blob
      const convertedFile = new File([convertedBlob], `converted_${file.name}`, {
        type: 'application/pdf'
      });

      // Create new URL for the converted PDF
      if (url) {
        URL.revokeObjectURL(url);
      }
      
      const newUrl = URL.createObjectURL(convertedFile);
      setUrl(newUrl);
      setError(null);
      console.log('PDF conversion successful');
      
    } catch (err) {
      console.error('PDF conversion failed:', err);
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-700/50 rounded-lg bg-gray-800/30">
        <div className="text-center">
          <p className="text-gray-300">No PDF selected</p>
          <p className="text-sm text-gray-400">Upload a PDF to view it here</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-red-900/20 border border-red-600/30 rounded">
        <div className="text-red-400 text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">PDF Viewer Error</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 text-red-300">
            This PDF may use an unsupported compression format
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {conversionAvailable && !isConverting && (
            <Button 
              onClick={handleConvertPDF}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2"
            >
              Try Convert PDF
            </Button>
          )}
          {isConverting && (
            <Button 
              disabled
              className="bg-purple-600/50 text-white px-4 py-2"
            >
              Converting...
            </Button>
          )}
          <Button 
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2"
          >
            Download PDF
          </Button>
          <Button 
            onClick={handleOpenInNewTab}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2"
          >
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-400">Loading PDF...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Controls Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-300 truncate max-w-[200px]">
          {file.name}
        </span>
        <div className="flex gap-1">
          {conversionAvailable && (
            <Button 
              onClick={handleConvertPDF}
              disabled={isConverting}
              className="text-xs px-2 py-1 h-auto bg-purple-600 hover:bg-purple-500"
            >
              {isConverting ? 'Converting...' : 'Convert'}
            </Button>
          )}
          <Button 
            onClick={handleOpenInNewTab}
            className="text-xs px-2 py-1 h-auto bg-green-600 hover:bg-green-500"
          >
            New Tab
          </Button>
          <Button 
            onClick={handleDownload}
            className="text-xs px-2 py-1 h-auto bg-blue-600 hover:bg-blue-500"
          >
            Download
          </Button>
        </div>
      </div>

      {/* PDF Iframe */}
      <div className="flex-1 relative">
        <iframe
          src={url}
          className="w-full h-full border-0"
          title={`PDF Viewer - ${file.name}`}
          onLoad={() => {
            setIsLoading(false);
            setError(null);
            console.log('PDF loaded in iframe successfully');
          }}
          onError={() => {
            setIsLoading(false);
            setError('Failed to load PDF in iframe');
            console.error('PDF failed to load in iframe');
          }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <div className="text-white">Loading PDF...</div>
          </div>
        )}
        
        {isConverting && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/75">
            <div className="text-center">
              <div className="text-white mb-2">Converting PDF...</div>
              <div className="text-sm text-gray-300">This may take a moment</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePDFViewer;
