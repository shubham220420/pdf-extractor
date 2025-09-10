export interface Vendor {
  name: string;
  address?: string;
  taxId?: string;
}

export interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface InvoiceData {
  number: string;
  date: string;
  currency?: string;
  subtotal?: number;
  taxPercent?: number;
  total?: number;
  poNumber?: string;
  poDate?: string;
  lineItems: LineItem[];
}

export interface Invoice {
  _id?: string;
  fileId: string;
  fileName: string;
  vendor: Vendor;
  invoice: InvoiceData;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileUrl?: string;
}

export interface ExtractRequest {
  fileId: string;
}

export interface ExtractResponse {
  vendor: Vendor;
  invoice: InvoiceData;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
