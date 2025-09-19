import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useWorkerAvailability } from '@/hooks/useWorkerAvailability';
import { format } from 'date-fns';

interface QuickUnavailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickUnavailabilityDialog: React.FC<QuickUnavailabilityDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    override_date: format(new Date(), 'yyyy-MM-dd'),
    is_available: false,
    all_day: true,
    start_time: '09:00',
    end_time: '17:00',
    reason: '',
  });

  const { createOverride, isCreatingOverride } = useWorkerAvailability();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.override_date) return;

    createOverride({
      override_date: formData.override_date,
      is_available: formData.is_available,
      start_time: formData.all_day ? undefined : formData.start_time,
      end_time: formData.all_day ? undefined : formData.end_time,
      reason: formData.reason,
    });

    // Reset form and close dialog
    setFormData({
      override_date: format(new Date(), 'yyyy-MM-dd'),
      is_available: false,
      all_day: true,
      start_time: '09:00',
      end_time: '17:00',
      reason: '',
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Availability Override</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="override_date">Date</Label>
            <Input
              id="override_date"
              type="date"
              value={formData.override_date}
              onChange={(e) => handleInputChange('override_date', e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={formData.is_available}
              onCheckedChange={(checked) => handleInputChange('is_available', checked)}
            />
            <Label className="text-sm">
              {formData.is_available ? 'Mark as Available' : 'Mark as Unavailable'}
            </Label>
          </div>

          {formData.is_available && (
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.all_day}
                onCheckedChange={(checked) => handleInputChange('all_day', checked)}
              />
              <Label className="text-sm">All Day</Label>
            </div>
          )}

          {formData.is_available && !formData.all_day && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Brief reason for this override..."
              rows={3}
            />
          </div>

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
              disabled={!formData.override_date || isCreatingOverride}
            >
              {isCreatingOverride ? 'Saving...' : 'Save Override'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};