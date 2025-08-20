import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedCalendarView } from '@/components/calendar/EnhancedCalendarView';

export default function ScheduleDayView() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Project Calendar</h1>
          <p className="text-muted-foreground">
            View schedules, tasks, and phases across daily, weekly, and monthly views
          </p>
        </div>
      </div>

      {/* Enhanced Calendar */}
      <div className="flex-1 overflow-hidden">
        <EnhancedCalendarView />
      </div>
    </div>
  );
}