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
import { WorkerInvoice } from "@/hooks/useWorkerInvoices";

interface WorkerInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId?: string;
  onSave: (data: Partial<WorkerInvoice>) => Promise<void>;
}

interface Worker {
  user_id: string;
  name: string;
}

export function WorkerInvoiceDialog({ open, onOpenChange, invoiceId, onSave }: WorkerInvoiceDialogProps) {
  const [formData, setFormData] = useState<Partial<WorkerInvoice>>({
    worker_id: '',
    period_start: '',
    period_end: '',
    total_hours: 0,
    hourly_rate: 25,
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    status: 'draft',
    notes: ''
  });
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [periodStartDate, setPeriodStartDate] = useState<Date>();
  const [periodEndDate, setPeriodEndDate] = useState<Date>();
  const [dueDateValue, setDueDateValue] = useState<Date>();

  useEffect(() => {
    if (open) {
      loadWorkers();
      if (invoiceId) {
        loadInvoice();
      } else {
        resetForm();
      }
    }
  }, [open, invoiceId]);

  const loadWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name')
        .eq('role', 'worker')
        .order('name');

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const loadInvoice = async () => {
    if (!invoiceId) return;

    try {
      const { data, error } = await supabase
        .from('worker_invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        status: data.status as WorkerInvoice['status']
      });
      if (data.period_start) setPeriodStartDate(new Date(data.period_start));
      if (data.period_end) setPeriodEndDate(new Date(data.period_end));
      if (data.due_date) setDueDateValue(new Date(data.due_date));
    } catch (error) {
      console.error('Error loading invoice:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      worker_id: '',
      period_start: '',
      period_end: '',
      total_hours: 0,
      hourly_rate: 25,
      subtotal: 0,
      tax_amount: 0,
      total_amount: 0,
      status: 'draft',
      notes: ''
    });
    setPeriodStartDate(undefined);
    setPeriodEndDate(undefined);
    setDueDateValue(undefined);
  };

  const calculateTotals = (hours: number, rate: number) => {
    const subtotal = hours * rate;
    const taxAmount = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount
    }));
  };

  const handleHoursChange = (value: string) => {
    const hours = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, total_hours: hours }));
    calculateTotals(hours, formData.hourly_rate || 0);
  };

  const handleRateChange = (value: string) => {
    const rate = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, hourly_rate: rate }));
    calculateTotals(formData.total_hours || 0, rate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        period_start: periodStartDate ? format(periodStartDate, 'yyyy-MM-dd') : '',
        period_end: periodEndDate ? format(periodEndDate, 'yyyy-MM-dd') : '',
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {invoiceId ? 'Edit Worker Invoice' : 'Create Worker Invoice'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="worker">Worker</Label>
              <Select
                value={formData.worker_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, worker_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select worker" />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem key={worker.user_id} value={worker.user_id}>
                      {worker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as WorkerInvoice['status'] }))}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Period Start</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodStartDate ? format(periodStartDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={periodStartDate}
                    onSelect={setPeriodStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Period End</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodEndDate ? format(periodEndDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={periodEndDate}
                    onSelect={setPeriodEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Total Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                value={formData.total_hours}
                onChange={(e) => handleHoursChange(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate ($)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="25.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Subtotal</Label>
              <div className="text-lg font-medium">${formData.subtotal?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Tax (10%)</Label>
              <div className="text-lg font-medium">${formData.tax_amount?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Total</Label>
              <div className="text-xl font-bold text-primary">${formData.total_amount?.toFixed(2) || '0.00'}</div>
            </div>
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