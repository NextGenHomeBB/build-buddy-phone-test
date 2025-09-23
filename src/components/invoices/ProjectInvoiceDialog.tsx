import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { ProjectInvoice } from "@/hooks/useProjectInvoices";

interface ProjectInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId?: string;
  onSave: (data: Partial<ProjectInvoice>) => Promise<void>;
}

interface Project {
  id: string;
  name: string;
  location: string;
}

export function ProjectInvoiceDialog({ open, onOpenChange, invoiceId, onSave }: ProjectInvoiceDialogProps) {
  const [formData, setFormData] = useState<Partial<ProjectInvoice>>({
    project_id: '',
    client_name: '',
    client_email: '',
    client_address: '',
    billing_type: 'completion',
    total_amount: 0,
    tax_amount: 0,
    discount_amount: 0,
    net_amount: 0,
    status: 'draft',
    payment_terms: 'Net 30',
    notes: ''
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [issueDateValue, setIssueDateValue] = useState<Date>();
  const [dueDateValue, setDueDateValue] = useState<Date>();

  useEffect(() => {
    if (open) {
      loadProjects();
      if (invoiceId) {
        loadInvoice();
      } else {
        resetForm();
      }
    }
  }, [open, invoiceId]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, location')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadInvoice = async () => {
    if (!invoiceId) return;

    try {
      const { data, error } = await supabase
        .from('project_invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        status: data.status as ProjectInvoice['status'],
        billing_type: data.billing_type as ProjectInvoice['billing_type']
      });
      if (data.issued_date) setIssueDateValue(new Date(data.issued_date));
      if (data.due_date) setDueDateValue(new Date(data.due_date));
    } catch (error) {
      console.error('Error loading invoice:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      client_name: '',
      client_email: '',
      client_address: '',
      billing_type: 'completion',
      total_amount: 0,
      tax_amount: 0,
      discount_amount: 0,
      net_amount: 0,
      status: 'draft',
      payment_terms: 'Net 30',
      notes: ''
    });
    setIssueDateValue(undefined);
    setDueDateValue(undefined);
  };

  const calculateTotals = (total: number, tax: number, discount: number) => {
    const netAmount = total + tax - discount;
    setFormData(prev => ({
      ...prev,
      total_amount: total,
      tax_amount: tax,
      discount_amount: discount,
      net_amount: netAmount
    }));
  };

  const handleTotalChange = (value: string) => {
    const total = parseFloat(value) || 0;
    calculateTotals(total, formData.tax_amount || 0, formData.discount_amount || 0);
  };

  const handleTaxChange = (value: string) => {
    const tax = parseFloat(value) || 0;
    calculateTotals(formData.total_amount || 0, tax, formData.discount_amount || 0);
  };

  const handleDiscountChange = (value: string) => {
    const discount = parseFloat(value) || 0;
    calculateTotals(formData.total_amount || 0, formData.tax_amount || 0, discount);
  };

  const handleProjectChange = async (projectId: string) => {
    setFormData(prev => ({ ...prev, project_id: projectId }));
    
    // Auto-populate client info from project
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('name, location')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        client_name: `Client for ${data.name}`,
        client_address: data.location
      }));
    } catch (error) {
      console.error('Error loading project details:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        issued_date: issueDateValue ? format(issueDateValue, 'yyyy-MM-dd') : undefined,
        due_date: dueDateValue ? format(dueDateValue, 'yyyy-MM-dd') : undefined
      };

      await onSave(submitData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoiceId ? 'Edit Project Invoice' : 'Create Project Invoice'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={formData.project_id}
                onValueChange={handleProjectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_type">Billing Type</Label>
              <Select
                value={formData.billing_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, billing_type: value as ProjectInvoice['billing_type'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="completion">Completion</SelectItem>
                  <SelectItem value="time_materials">Time & Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Client name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">Client Email</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                placeholder="client@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_address">Client Address</Label>
            <Textarea
              id="client_address"
              value={formData.client_address}
              onChange={(e) => setFormData(prev => ({ ...prev, client_address: e.target.value }))}
              placeholder="Client address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount ($)</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => handleTotalChange(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_amount">Tax Amount ($)</Label>
              <Input
                id="tax_amount"
                type="number"
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => handleTaxChange(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_amount">Discount ($)</Label>
              <Input
                id="discount_amount"
                type="number"
                step="0.01"
                value={formData.discount_amount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <Label className="text-lg font-medium">Net Amount</Label>
              <div className="text-2xl font-bold text-primary">
                ${formData.net_amount?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as ProjectInvoice['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Select
                value={formData.payment_terms}
                onValueChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {issueDateValue ? format(issueDateValue, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={issueDateValue}
                    onSelect={setIssueDateValue}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDateValue ? format(dueDateValue, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDateValue}
                    onSelect={setDueDateValue}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}