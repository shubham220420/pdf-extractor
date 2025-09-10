import axios from 'axios';
import { ApiResponse, UploadResponse, ExtractResponse, Invoice } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Upload PDF
  uploadPDF: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await api.post<ApiResponse<UploadResponse>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Upload failed');
    }
    
    return response.data.data!;
  },

  // Extract data using AI
  extractData: async (fileId: string): Promise<ExtractResponse> => {
    const response = await api.post<ApiResponse<ExtractResponse>>('/extract', {
      fileId,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Extraction failed');
    }
    
    return response.data.data!;
  },

  // CRUD operations for invoices
  invoices: {
    list: async (search?: string): Promise<Invoice[]> => {
      const params = search ? { q: search } : {};
      const response = await api.get<ApiResponse<Invoice[]>>('/invoices', { params });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch invoices');
      }
      
      return response.data.data!;
    },

    get: async (id: string): Promise<Invoice> => {
      const response = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch invoice');
      }
      
      return response.data.data!;
    },

    create: async (invoice: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> => {
      const response = await api.post<ApiResponse<Invoice>>('/invoices', invoice);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create invoice');
      }
      
      return response.data.data!;
    },

    update: async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
      const response = await api.put<ApiResponse<Invoice>>(`/invoices/${id}`, invoice);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update invoice');
      }
      
      return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
      const response = await api.delete<ApiResponse>(`/invoices/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete invoice');
      }
    },
  },
};
