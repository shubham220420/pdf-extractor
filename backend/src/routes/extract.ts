import express from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
// @ts-ignore: pdf-parse has incomplete type definitions
import pdf from 'pdf-parse';
import { asyncHandler } from '../middleware/errorHandler';
import { AIService } from '../services/aiService';
import { ExtractRequest, ExtractResponse, ApiResponse } from '../types';

const router = express.Router();
const aiService = new AIService();

// Validation rules
const extractValidation = [
  body('fileId').notEmpty().withMessage('File ID is required')
];

// Function to read a stream into a buffer
const streamToBuffer = (stream: NodeJS.ReadableStream): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

// POST /extract - Extract data from PDF using AI
router.post('/', extractValidation, asyncHandler(async (req: express.Request, res: express.Response<ApiResponse<ExtractResponse>>) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: errors.array().map(err => err.msg).join(', ')
    });
  }

  const { fileId }: ExtractRequest = req.body;

  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    const bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    
    const pdfBuffer = await streamToBuffer(downloadStream);
    console.log('[extract] Downloaded PDF buffer bytes:', pdfBuffer.length);

    // Use pdf-parse with better error handling for problematic PDFs
    try {
      const data = await pdf(pdfBuffer, {
        // Add options to be more lenient with malformed PDFs
        max: parseInt(process.env.EXTRACT_MAX_PAGES || '5', 10),
        version: 'v1.10.100'
      });
      
      let pdfText = data.text || '';
      const MAX_CHARS = parseInt(process.env.EXTRACT_MAX_CHARS || '100000', 10);
      if (pdfText.length > MAX_CHARS) {
        pdfText = pdfText.slice(0, MAX_CHARS);
      }
      console.log('[extract] Extracted text length:', pdfText.length);

      if (!pdfText.trim()) {
        return res.status(500).json({
          success: false,
          error: 'Text Extraction Failed',
          message: 'Could not extract any text from the provided PDF. The PDF may be image-only or corrupted.'
        });
      }
      
      const extractedData = await aiService.extractData(pdfText);

      res.json({
        success: true,
        data: extractedData
      });
    } catch (pdfError) {
      console.error('[extract] PDF parsing failed, trying fallback:', pdfError);
      // Fallback: try without version specification
      try {
        const data = await pdf(pdfBuffer);
        let pdfText = data.text || '';
        const MAX_CHARS = parseInt(process.env.EXTRACT_MAX_CHARS || '100000', 10);
        if (pdfText.length > MAX_CHARS) {
          pdfText = pdfText.slice(0, MAX_CHARS);
        }
        console.log('[extract] Fallback extraction - text length:', pdfText.length);

        if (!pdfText.trim()) {
          return res.status(500).json({
            success: false,
            error: 'Text Extraction Failed',
            message: 'Could not extract any text from the provided PDF. The PDF may be image-only or corrupted.'
          });
        }
        
        const extractedData = await aiService.extractData(pdfText);
        res.json({
          success: true,
          data: extractedData
        });
      } catch (fallbackError) {
        console.error('[extract] Fallback parsing also failed:', fallbackError);
        
        // If both attempts fail, provide a more helpful error response
        // and try to use a mock response for testing purposes
        if (process.env.NODE_ENV === 'development') {
          console.log('[extract] Using mock data for development testing');
          const mockExtractedData = await aiService.extractData(`
            INVOICE
            
            Vendor: Sample Company Inc
            Address: 123 Test Street, Test City, TC 12345
            Tax ID: TEST123456789
            
            Invoice Number: INV-2024-001
            Invoice Date: 2024-03-15
            Currency: USD
            
            Description                    Qty    Unit Price    Total
            Sample Service                  1      $1000.00     $1000.00
            
            Subtotal:                                          $1000.00
            Tax (10%):                                         $100.00
            Total:                                             $1100.00
          `);
          
          return res.json({
            success: true,
            data: mockExtractedData,
            message: 'PDF parsing failed, using mock data for testing. Please try a different PDF file.'
          });
        }
        
        return res.status(500).json({
          success: false,
          error: 'PDF Processing Failed',
          message: 'Unable to process this PDF file. The file may be corrupted, password-protected, or use an unsupported format. Please try a different PDF or contact support.'
        });
      }
    }
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({
      success: false,
      error: 'Extraction failed',
      message: error instanceof Error ? error.message : 'Failed to extract data from PDF'
    });
  }
}));

export default router;
