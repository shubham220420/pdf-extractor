'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceForm } from '@/components/InvoiceForm';
import { FileText, ArrowLeft } from 'lucide-react';
import { apiService } from '@/lib/api';
import { Invoice } from '@/types';
import Link from 'next/link';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const data = await apiService.invoices.get(invoiceId);
          setInvoice(data);
        } catch (error) {
          console.error('Failed to load invoice:', error);
          alert('Failed to load invoice');
          router.push('/invoices');
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [invoiceId, router]);

  const handleSave = async (formData: Record<string, unknown>) => {
    setIsSaving(true);
    try {
      await apiService.invoices.update(invoiceId, formData);
      alert('Invoice updated successfully!');
      router.push('/invoices');
    } catch (error) {
      console.error('Update failed:', error);
      alert('Update failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await apiService.invoices.delete(invoiceId);
      alert('Invoice deleted successfully!');
      router.push('/invoices');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Invoice not found</p>
          <Link href="/invoices">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/invoices">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
                <p className="text-sm text-gray-600">{invoice.invoice.number}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>File:</strong> {invoice.fileName}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(invoice.createdAt).toLocaleString()}
                </div>
                {invoice.updatedAt && (
                  <div>
                    <strong>Updated:</strong> {new Date(invoice.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            
            <InvoiceForm
              existingInvoice={invoice}
              onSave={handleSave}
              onDelete={handleDelete}
              isLoading={isSaving}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
