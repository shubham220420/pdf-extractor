import express from 'express';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Convert problematic PDFs to a more compatible format
 */
router.post('/convert', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('Converting PDF:', req.file.originalname);

    // Load the PDF
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    
    // Create a new PDF document
    const newPdfDoc = await PDFDocument.create();
    
    // Copy all pages from the original to the new document
    const pageIndices = pdfDoc.getPageIndices();
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
    
    // Add pages to the new document
    copiedPages.forEach((page) => {
      newPdfDoc.addPage(page);
    });

    // Save the new PDF
    const pdfBytes = await newPdfDoc.save();

    // Set response headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="converted_${req.file.originalname}"`,
      'Content-Length': pdfBytes.length.toString(),
    });

    // Send the converted PDF
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('PDF conversion error:', error);
    res.status(500).json({ 
      error: 'Failed to convert PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'PDF conversion service is running' });
});

export default router;
