import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkerAvailability } from '@/hooks/useWorkerAvailability';
import { differenceInDays, format } from 'date-fns';

interface TimeOffRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TimeOffRequestDialog: React.FC<TimeOffRequestDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    request_type: 'vacation' as 'vacation' | 'sick_leave' | 'personal' | 'unpaid',
    reason: '',
  });

  const { submitTimeOffRequest, isSubmittingTimeOff } = useWorkerAvailability();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.start_date || !formData.end_date) return;

    const days = differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1;

    submitTimeOffRequest({
      ...formData,
      days_requested: days,
    });

    // Reset form and close dialog
    setFormData({
      start_date: '',
      end_date: '',
      request_type: 'vacation',
      reason: '',
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.start_date && formData.end_date && 
    new Date(formData.start_date) <= new Date(formData.end_date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                min={formData.start_date || format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="request_type">Request Type</Label>
            <Select
              value={formData.request_type}
              onValueChange={(value) => handleInputChange('request_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick_leave">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="unpaid">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Brief description of your request..."
              rows={3}
            />
          </div>

          {formData.start_date && formData.end_date && isFormValid && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Total days requested: {' '}
                <span className="font-medium">
                  {differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1}
                </span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmittingTimeOff}
            >
              {isSubmittingTimeOff ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};