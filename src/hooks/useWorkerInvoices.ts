import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkerInvoice {
  id: string;
  invoice_number: string;
  worker_id: string;
  worker_name?: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  hourly_rate: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issued_date?: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkerInvoiceItem {
  id: string;
  invoice_id: string;
  project_id?: string;
  phase_id?: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
  work_date: string;
}

export function useWorkerInvoices() {
  const [invoices, setInvoices] = useState<WorkerInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('worker_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get worker names separately
      const workerIds = [...new Set(data.map(invoice => invoice.worker_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', workerIds);

      const formattedInvoices = data.map(invoice => ({
        ...invoice,
        status: invoice.status as WorkerInvoice['status'],
        worker_name: profiles?.find(p => p.user_id === invoice.worker_id)?.name
      }));

      setInvoices(formattedInvoices);
    } catch (error) {
      console.error('Error loading worker invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load worker invoices",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Partial<WorkerInvoice>): Promise<void> => {
    try {
      // Generate invoice number
      const invoiceNumber = `WI-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('worker_invoices')
        .insert({
          worker_id: invoiceData.worker_id,
          period_start: invoiceData.period_start,
          period_end: invoiceData.period_end,
          total_hours: invoiceData.total_hours,
          hourly_rate: invoiceData.hourly_rate,
          subtotal: invoiceData.subtotal,
          tax_amount: invoiceData.tax_amount,
          total_amount: invoiceData.total_amount,
          status: invoiceData.status,
          issued_date: invoiceData.issued_date,
          due_date: invoiceData.due_date,
          notes: invoiceData.notes,
          invoice_number: invoiceNumber
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Worker invoice created successfully"
      });

      await loadInvoices();
    } catch (error) {
      console.error('Error creating worker invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create worker invoice",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateInvoice = async (invoiceData: Partial<WorkerInvoice>): Promise<void> => {
    try {
      if (!invoiceData.id) throw new Error('Invoice ID is required');
      
      const { data, error } = await supabase
        .from('worker_invoices')
        .update(invoiceData)
        .eq('id', invoiceData.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Worker invoice updated successfully"
      });

      await loadInvoices();
    } catch (error) {
      console.error('Error updating worker invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update worker invoice",
        variant: "destructive"
      });
      throw error;
    }
  };

  const generateInvoice = async (workerId?: string, periodStart?: string, periodEnd?: string) => {
    try {
      // This would typically aggregate timesheet data
      // For now, we'll create a placeholder implementation
      const { data: timesheets, error } = await supabase
        .from('timesheets')
        .select(`
          *,
          profiles!timesheets_user_id_fkey (
            name
          ),
          projects (
            name
          )
        `)
        .gte('work_date', periodStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .lte('work_date', periodEnd || new Date().toISOString().split('T')[0])
        .eq('user_id', workerId || '');

      if (error) throw error;

      // Aggregate hours and calculate totals
      const totalHours = timesheets.reduce((sum, ts) => sum + (ts.duration_generated || 0), 0);
      const hourlyRate = 25; // This should come from worker profile
      const subtotal = totalHours * hourlyRate;
      const taxAmount = subtotal * 0.1; // 10% tax
      const totalAmount = subtotal + taxAmount;

      const invoiceData = {
        worker_id: workerId,
        period_start: periodStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_end: periodEnd || new Date().toISOString().split('T')[0],
        total_hours: totalHours,
        hourly_rate: hourlyRate,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'draft' as const
      };

      return await createInvoice(invoiceData);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice from timesheets",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('worker_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Worker invoice deleted successfully"
      });

      await loadInvoices();
    } catch (error) {
      console.error('Error deleting worker invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete worker invoice",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    generateInvoice,
    deleteInvoice,
    refreshInvoices: loadInvoices
  };
}