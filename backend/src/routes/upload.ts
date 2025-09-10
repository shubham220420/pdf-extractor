import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { asyncHandler } from '../middleware/errorHandler';
import { UploadResponse, ApiResponse } from '../types';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// POST /upload - Upload PDF file
router.post('/', upload.single('pdf'), asyncHandler(async (req: express.Request, res: express.Response<ApiResponse<UploadResponse>>) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
      message: 'Please select a PDF file to upload'
    });
  }

  try {
    // Create GridFS bucket for file storage
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    const bucket = new GridFSBucket(db, { bucketName: 'pdfs' });
    
    // Create upload stream
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        uploadDate: new Date()
      }
    });

    // Upload the file
    uploadStream.end(req.file.buffer);
    
    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    return res.json({
      success: true,
      data: {
        fileId: uploadStream.id.toString(),
        fileName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: 'Failed to upload file to storage'
    });
  }
}));

export default router;
