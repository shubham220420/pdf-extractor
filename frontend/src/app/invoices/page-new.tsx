'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Building2,
  Calendar,
  Hash,
  Filter
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { Invoice } from '@/types';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter(
        (invoice) =>
          invoice.vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.invoice.number.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredInvoices(filtered);
    }
  }, [searchQuery, invoices]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.invoices.list();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      alert('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await apiService.invoices.delete(id);
      await loadInvoices();
      alert('Invoice deleted successfully');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      alert('Failed to delete invoice');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="border-b bg-card/50 backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">Invoice Library</h1>
                  <p className="text-sm text-muted-foreground">{invoices.length} invoices stored</p>
                </div>
              </div>
            </div>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add New Invoice
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by vendor name or invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto"></div>
              <p className="text-muted-foreground">Loading invoices...</p>
            </div>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-semibold">
                {searchQuery ? 'No invoices found' : 'No invoices yet'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms or clear the search to see all invoices.'
                  : 'Get started by uploading your first PDF invoice to extract and store data automatically.'
                }
              </p>
            </div>
            {!searchQuery && (
              <Link href="/">
                <Button className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload First Invoice
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice._id} className="hover:shadow-lg transition-all duration-200 border-border/50">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs font-mono">
                              <Hash className="h-3 w-3 mr-1" />
                              {invoice.invoice.number}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {formatCurrency(invoice.invoice.total, invoice.invoice.currency)}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold">{invoice.vendor.name}</h3>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link href={`/invoices/${invoice._id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(invoice._id!)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            Invoice Date
                          </div>
                          <p className="font-medium">{formatDate(invoice.invoice.date)}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-muted-foreground">
                            <Building2 className="h-4 w-4 mr-2" />
                            Vendor
                          </div>
                          <p className="font-medium">{invoice.vendor.name}</p>
                          {invoice.vendor.address && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {invoice.vendor.address}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-muted-foreground">
                            <FileText className="h-4 w-4 mr-2" />
                            Document
                          </div>
                          <p className="font-medium text-xs truncate" title={invoice.fileName}>
                            {invoice.fileName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
