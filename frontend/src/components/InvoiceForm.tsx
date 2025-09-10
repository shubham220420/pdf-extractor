'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { Invoice, ExtractResponse } from '@/types';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  total: z.number().min(0, 'Total must be positive'),
});

const invoiceSchema = z.object({
  vendor: z.object({
    name: z.string().min(1, 'Vendor name is required'),
    address: z.string().optional(),
    taxId: z.string().optional(),
  }),
  invoice: z.object({
    number: z.string().min(1, 'Invoice number is required'),
    date: z.string().min(1, 'Invoice date is required'),
    currency: z.string().optional(),
    subtotal: z.number().optional(),
    taxPercent: z.number().optional(),
    total: z.number().optional(),
    poNumber: z.string().optional(),
    poDate: z.string().optional(),
    lineItems: z.array(lineItemSchema),
  }),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  extractedData?: ExtractResponse;
  existingInvoice?: Invoice;
  onSave: (data: InvoiceFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  extractedData,
  existingInvoice,
  onSave,
  onDelete,
  isLoading = false,
}) => {
  const defaultValues: InvoiceFormData = extractedData || existingInvoice || {
    vendor: { name: '', address: '', taxId: '' },
    invoice: {
      number: '',
      date: '',
      currency: 'USD',
      subtotal: 0,
      taxPercent: 0,
      total: 0,
      poNumber: '',
      poDate: '',
      lineItems: [{ description: '', unitPrice: 0, quantity: 1, total: 0 }],
    },
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues,
  });

  // Update form when extractedData changes
  React.useEffect(() => {
    if (extractedData) {
      console.log('Updating form with extracted data:', extractedData);
      reset(extractedData);
    }
  }, [extractedData, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invoice.lineItems',
  });

  const watchedLineItems = watch('invoice.lineItems');

  // Calculate totals when line items change
  React.useEffect(() => {
    let subtotal = 0;
    watchedLineItems.forEach((item, index) => {
      const lineTotal = item.unitPrice * item.quantity;
      setValue(`invoice.lineItems.${index}.total`, lineTotal);
      subtotal += lineTotal;
    });
    
    setValue('invoice.subtotal', subtotal);
    
    const taxPercent = watch('invoice.taxPercent') || 0;
    const total = subtotal + (subtotal * taxPercent / 100);
    setValue('invoice.total', total);
  }, [watchedLineItems, setValue, watch]);

  const onSubmit = async (data: InvoiceFormData) => {
    await onSave(data);
  };

  const addLineItem = () => {
    append({ description: '', unitPrice: 0, quantity: 1, total: 0 });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Vendor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span>Vendor Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vendor.name">Vendor Name *</Label>
              <Input
                id="vendor.name"
                {...register('vendor.name')}
                placeholder="Enter vendor name"
                className="mt-1"
              />
              {errors.vendor?.name && (
                <p className="text-sm text-destructive mt-1">{errors.vendor.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="vendor.address">Address</Label>
              <Input
                id="vendor.address"
                {...register('vendor.address')}
                placeholder="Enter vendor address"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="vendor.taxId">Tax ID</Label>
              <Input
                id="vendor.taxId"
                {...register('vendor.taxId')}
                placeholder="Enter tax ID"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-violet-500 rounded-full"></div>
              <span>Invoice Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice.number">Invoice Number *</Label>
                <Input
                  id="invoice.number"
                  {...register('invoice.number')}
                  placeholder="Enter invoice number"
                  className="mt-1"
                />
                {errors.invoice?.number && (
                  <p className="text-sm text-destructive mt-1">{errors.invoice.number.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="invoice.date">Invoice Date *</Label>
                <Input
                  id="invoice.date"
                  type="date"
                  {...register('invoice.date')}
                  className="mt-1"
                />
                {errors.invoice?.date && (
                  <p className="text-sm text-destructive mt-1">{errors.invoice.date.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="invoice.currency">Currency</Label>
                <Input
                  id="invoice.currency"
                  {...register('invoice.currency')}
                  placeholder="USD"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="invoice.poNumber">PO Number</Label>
                <Input
                  id="invoice.poNumber"
                  {...register('invoice.poNumber')}
                  placeholder="Enter PO number"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="invoice.poDate">PO Date</Label>
                <Input
                  id="invoice.poDate"
                  type="date"
                  {...register('invoice.poDate')}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                <span>Line Items</span>
              </div>
              <Button 
                type="button" 
                onClick={addLineItem} 
                size="sm" 
                variant="outline"
                className="text-xs"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor={`invoice.lineItems.${index}.description`}>Description</Label>
                    <Input
                      {...register(`invoice.lineItems.${index}.description`)}
                      placeholder="Enter description"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`invoice.lineItems.${index}.unitPrice`}>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`invoice.lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`invoice.lineItems.${index}.quantity`}>Quantity</Label>
                    <Input
                      type="number"
                      {...register(`invoice.lineItems.${index}.quantity`, { valueAsNumber: true })}
                      placeholder="1"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`invoice.lineItems.${index}.total`}>Total</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`invoice.lineItems.${index}.total`, { valueAsNumber: true })}
                        readOnly
                        className="mt-1 bg-muted font-medium"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals Section */}
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md ml-auto">
                <div>
                  <Label htmlFor="invoice.subtotal" className="text-sm font-medium">Subtotal</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('invoice.subtotal', { valueAsNumber: true })}
                    readOnly
                    className="mt-1 bg-muted font-medium"
                  />
                </div>
                
                <div>
                  <Label htmlFor="invoice.taxPercent" className="text-sm font-medium">Tax %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('invoice.taxPercent', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <Label htmlFor="invoice.total" className="text-sm font-medium">Total Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('invoice.total', { valueAsNumber: true })}
                    readOnly
                    className="mt-1 bg-primary/10 border-primary/20 font-bold text-lg text-primary"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white"
          >
            {isLoading ? 'Saving...' : 'Save Invoice'}
          </Button>
          
          {onDelete && existingInvoice && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              Delete Invoice
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
