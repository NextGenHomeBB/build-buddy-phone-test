import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectInvoice {
  id: string;
  invoice_number: string;
  project_id: string;
  project_name?: string;
  client_name?: string;
  client_email?: string;
  client_address?: string;
  billing_type: 'milestone' | 'progress' | 'completion' | 'time_materials';
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issued_date?: string;
  due_date?: string;
  paid_date?: string;
  payment_terms: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectInvoiceItem {
  id: string;
  invoice_id: string;
  phase_id?: string;
  item_type: 'labor' | 'material' | 'equipment' | 'other';
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export function useProjectInvoices() {
  const [invoices, setInvoices] = useState<ProjectInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('project_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get project names separately
      const projectIds = [...new Set(data.map(invoice => invoice.project_id))];
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .in('id', projectIds);

      const formattedInvoices = data.map(invoice => ({
        ...invoice,
        status: invoice.status as ProjectInvoice['status'],
        billing_type: invoice.billing_type as ProjectInvoice['billing_type'],
        project_name: projects?.find(p => p.id === invoice.project_id)?.name
      }));

      setInvoices(formattedInvoices);
    } catch (error) {
      console.error('Error loading project invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load project invoices",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Partial<ProjectInvoice>): Promise<void> => {
    try {
      // Generate invoice number
      const invoiceNumber = `PI-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('project_invoices')
        .insert({
          project_id: invoiceData.project_id,
          client_name: invoiceData.client_name,
          client_email: invoiceData.client_email,
          client_address: invoiceData.client_address,
          billing_type: invoiceData.billing_type,
          total_amount: invoiceData.total_amount,
          tax_amount: invoiceData.tax_amount,
          discount_amount: invoiceData.discount_amount,
          net_amount: invoiceData.net_amount,
          status: invoiceData.status,
          issued_date: invoiceData.issued_date,
          due_date: invoiceData.due_date,
          payment_terms: invoiceData.payment_terms,
          notes: invoiceData.notes,
          invoice_number: invoiceNumber
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project invoice created successfully"
      });

      await loadInvoices();
    } catch (error) {
      console.error('Error creating project invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create project invoice",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateInvoice = async (invoiceData: Partial<ProjectInvoice>): Promise<void> => {
    try {
      if (!invoiceData.id) throw new Error('Invoice ID is required');
      
      const { data, error } = await supabase
        .from('project_invoices')
        .update(invoiceData)
        .eq('id', invoiceData.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project invoice updated successfully"
      });

      await loadInvoices();
    } catch (error) {
      console.error('Error updating project invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update project invoice",
        variant: "destructive"
      });
      throw error;
    }
  };

  const generateFromProject = async (projectId: string, billingType: string = 'completion') => {
    try {
      // Fetch project cost data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          project_phases (
            *,
            material_costs (*),
            labour_costs (*)
          )
        `)
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Calculate totals from phases
      let totalAmount = 0;
      const phases = project.project_phases || [];
      
      phases.forEach(phase => {
        totalAmount += (phase.material_cost || 0) + (phase.labour_cost || 0);
      });

      const taxAmount = totalAmount * 0.1; // 10% tax
      const netAmount = totalAmount + taxAmount;

      const invoiceData = {
        project_id: projectId,
        client_name: `Client for ${project.name}`,
        billing_type: billingType as ProjectInvoice['billing_type'],
        total_amount: totalAmount,
        tax_amount: taxAmount,
        discount_amount: 0,
        net_amount: netAmount,
        status: 'draft' as const,
        payment_terms: 'Net 30'
      };

      return await createInvoice(invoiceData);
    } catch (error) {
      console.error('Error generating project invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate project invoice",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project invoice deleted successfully"
      });

      await loadInvoices();
    } catch (error) {
      console.error('Error deleting project invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete project invoice",
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
    generateFromProject,
    deleteInvoice,
    refreshInvoices: loadInvoices
  };
}