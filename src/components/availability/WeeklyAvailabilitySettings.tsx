import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useWorkerAvailability, WorkerAvailability } from '@/hooks/useWorkerAvailability';

interface WeeklyAvailabilitySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPatterns: WorkerAvailability[];
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WeeklyAvailabilitySettings: React.FC<WeeklyAvailabilitySettingsProps> = ({
  open,
  onOpenChange,
  currentPatterns,
}) => {
  const [patterns, setPatterns] = useState<Record<number, {
    is_available: boolean;
    start_time: string;
    end_time: string;
  }>>({});

  const { updateAvailability, isUpdatingAvailability } = useWorkerAvailability();

  // Initialize patterns from current data
  useEffect(() => {
    const initialPatterns: typeof patterns = {};
    
    for (let day = 0; day < 7; day++) {
      const existing = currentPatterns.find(p => p.day_of_week === day);
      initialPatterns[day] = {
        is_available: existing?.is_available ?? true,
        start_time: existing?.start_time ?? '09:00',
        end_time: existing?.end_time ?? '17:00',
      };
    }
    
    setPatterns(initialPatterns);
  }, [currentPatterns, open]);

  const handlePatternChange = (day: number, field: string, value: string | boolean) => {
    setPatterns(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      // Update each day's pattern
      for (const [day, pattern] of Object.entries(patterns)) {
        await updateAvailability({
          day_of_week: parseInt(day),
          is_available: pattern.is_available,
          start_time: pattern.start_time,
          end_time: pattern.end_time,
          effective_from: new Date().toISOString().split('T')[0],
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving availability patterns:', error);
    }
  };

  const setQuickPattern = (pattern: 'full-time' | 'part-time' | 'weekends-only') => {
    const newPatterns: typeof patterns = {};
    
    switch (pattern) {
      case 'full-time':
        for (let day = 0; day < 7; day++) {
          newPatterns[day] = {
            is_available: day >= 1 && day <= 5, // Monday to Friday
            start_time: '09:00',
            end_time: '17:00',
          };
        }
        break;
      case 'part-time':
        for (let day = 0; day < 7; day++) {
          newPatterns[day] = {
            is_available: day >= 1 && day <= 5, // Monday to Friday
            start_time: '09:00',
            end_time: '13:00',
          };
        }
        break;
      case 'weekends-only':
        for (let day = 0; day < 7; day++) {
          newPatterns[day] = {
            is_available: day === 0 || day === 6, // Sunday and Saturday
            start_time: '10:00',
            end_time: '16:00',
          };
        }
        break;
    }
    
    setPatterns(newPatterns);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Weekly Availability Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quick Patterns */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Quick Patterns</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickPattern('full-time')}
              >
                Full-time (Mon-Fri 9-5)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickPattern('part-time')}
              >
                Part-time (Mon-Fri 9-1)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickPattern('weekends-only')}
              >
                Weekends Only
              </Button>
            </div>
          </div>

          {/* Daily Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Daily Availability</Label>
            <div className="space-y-4">
              {dayNames.map((dayName, day) => (
                <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-20">
                    <span className="font-medium">{dayName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={patterns[day]?.is_available ?? false}
                      onCheckedChange={(checked) => 
                        handlePatternChange(day, 'is_available', checked)
                      }
                    />
                    <Label className="text-sm">Available</Label>
                  </div>

                  {patterns[day]?.is_available && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Input
                        type="time"
                        value={patterns[day]?.start_time || '09:00'}
                        onChange={(e) => 
                          handlePatternChange(day, 'start_time', e.target.value)
                        }
                        className="w-24"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={patterns[day]?.end_time || '17:00'}
                        onChange={(e) => 
                          handlePatternChange(day, 'end_time', e.target.value)
                        }
                        className="w-24"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              onClick={handleSave}
              disabled={isUpdatingAvailability}
            >
              {isUpdatingAvailability ? 'Saving...' : 'Save Availability'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};