'use client';

import React, { useState } from 'react';

export default function PDFTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      // Create object URL for direct viewing
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">PDF Test Viewer</h1>
        
        <div className="mb-6">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="mb-4 text-white"
          />
        </div>

        {selectedFile && (
          <div className="space-y-4">
            <div className="text-white">
              <p>File: {selectedFile.name}</p>
              <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p>Type: {selectedFile.type}</p>
            </div>

            {/* Basic PDF viewer using iframe */}
            <div className="bg-white rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src={pdfUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="PDF Viewer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
