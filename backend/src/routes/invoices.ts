import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { Invoice } from '../models/Invoice';
import { asyncHandler } from '../middleware/errorHandler';
import { Invoice as IInvoice, ApiResponse } from '../types';

const router = express.Router();

// Validation rules
const createInvoiceValidation = [
  body('fileId').notEmpty().withMessage('File ID is required'),
  body('fileName').notEmpty().withMessage('File name is required'),
  body('vendor.name').notEmpty().withMessage('Vendor name is required'),
  body('invoice.number').notEmpty().withMessage('Invoice number is required'),
  body('invoice.date').notEmpty().withMessage('Invoice date is required'),
  body('invoice.lineItems').isArray().withMessage('Line items must be an array')
];

const updateInvoiceValidation = [
  param('id').isMongoId().withMessage('Invalid invoice ID'),
  body('vendor.name').optional().notEmpty().withMessage('Vendor name cannot be empty'),
  body('invoice.number').optional().notEmpty().withMessage('Invoice number cannot be empty'),
  body('invoice.date').optional().notEmpty().withMessage('Invoice date cannot be empty')
];

// GET /invoices - List all invoices with optional search
router.get('/', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse<IInvoice[]>>) => {
  const { q } = req.query;
  
  let filter = {};
  if (q && typeof q === 'string') {
    filter = {
      $or: [
        { 'vendor.name': { $regex: q, $options: 'i' } },
        { 'invoice.number': { $regex: q, $options: 'i' } }
      ]
    };
  }

  const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: invoices.map(invoice => ({
      ...invoice.toObject(),
      _id: (invoice._id as any).toString()
    }))
  });
}));

// GET /invoices/:id - Get single invoice
router.get('/:id', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse<IInvoice>>) => {
  const { id } = req.params;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      message: 'Please provide a valid invoice ID'
    });
  }

  const invoice = await Invoice.findById(id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found',
      message: 'The requested invoice does not exist'
    });
  }

  res.json({
    success: true,
    data: {
      ...invoice.toObject(),
      _id: (invoice._id as any).toString()
    }
  });
}));

// POST /invoices - Create new invoice
router.post('/', createInvoiceValidation, asyncHandler(async (req: express.Request, res: express.Response<ApiResponse<IInvoice>>) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: errors.array().map(err => err.msg).join(', ')
    });
  }

  const invoiceData = req.body;
  invoiceData.createdAt = new Date().toISOString();

  const invoice = new Invoice(invoiceData);
  await invoice.save();

  res.status(201).json({
    success: true,
    data: {
      ...invoice.toObject(),
      _id: (invoice._id as any).toString()
    },
    message: 'Invoice created successfully'
  });
}));

// PUT /invoices/:id - Update invoice
router.put('/:id', updateInvoiceValidation, asyncHandler(async (req: express.Request, res: express.Response<ApiResponse<IInvoice>>) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: errors.array().map(err => err.msg).join(', ')
    });
  }

  const { id } = req.params;
  const updateData = { ...req.body, updatedAt: new Date().toISOString() };

  const invoice = await Invoice.findByIdAndUpdate(id, updateData, { 
    new: true, 
    runValidators: true 
  });

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found',
      message: 'The requested invoice does not exist'
    });
  }

  res.json({
    success: true,
    data: {
      ...invoice.toObject(),
      _id: (invoice._id as any).toString()
    },
    message: 'Invoice updated successfully'
  });
}));

// DELETE /invoices/:id - Delete invoice
router.delete('/:id', asyncHandler(async (req: express.Request, res: express.Response<ApiResponse>) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      message: 'Please provide a valid invoice ID'
    });
  }

  const invoice = await Invoice.findByIdAndDelete(id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found',
      message: 'The requested invoice does not exist'
    });
  }

  res.json({
    success: true,
    message: 'Invoice deleted successfully'
  });
}));

export default router;
