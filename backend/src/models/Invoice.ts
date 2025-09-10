import mongoose, { Schema, Document } from 'mongoose';
import { Vendor, InvoiceData, LineItem } from '../types';

interface InvoiceDocument extends Document {
  fileId: string;
  fileName: string;
  vendor: Vendor;
  invoice: InvoiceData;
  createdAt: string;
  updatedAt?: string;
}

const LineItemSchema = new Schema<LineItem>({
  description: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true }
});

const VendorSchema = new Schema<Vendor>({
  name: { type: String, required: true },
  address: { type: String },
  taxId: { type: String }
});

const InvoiceDataSchema = new Schema<InvoiceData>({
  number: { type: String, required: true },
  date: { type: String, required: true },
  currency: { type: String },
  subtotal: { type: Number },
  taxPercent: { type: Number },
  total: { type: Number },
  poNumber: { type: String },
  poDate: { type: String },
  lineItems: [LineItemSchema]
});

const InvoiceSchema = new Schema<InvoiceDocument>({
  fileId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  vendor: { type: VendorSchema, required: true },
  invoice: { type: InvoiceDataSchema, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String }
});

// Add text index for search functionality
InvoiceSchema.index({
  'vendor.name': 'text',
  'invoice.number': 'text'
});

export const Invoice = mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);
