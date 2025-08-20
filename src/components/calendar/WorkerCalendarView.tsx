import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, AlertCircle, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkerSchedule, type WorkerCalendarView as CalendarViewType, type WorkerScheduleEvent } from '@/hooks/useWorkerSchedule';
import { CalendarEventDetailDialog } from './CalendarEventDetailDialog';
import { WorkerDailyView } from './WorkerDailyView';
import { WorkerWeeklyView } from './WorkerWeeklyView';
import { WorkerMonthlyView } from './WorkerMonthlyView';
import { cn } from '@/lib/utils';
import { RealtimeCalendarSync } from './RealtimeCalendarSync';

interface WorkerCalendarViewProps {
  className?: string;
}

export function WorkerCalendarView({ className }: WorkerCalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<WorkerScheduleEvent | null>(null);
  
  const {
    currentDate,
    view,
    setView,
    events,
    calendarDays,
    startDate,
    endDate,
    periodDisplay,
    workerStats,
    isLoading,
    error,
    refetch,
    navigateNext,
    navigatePrevious,
    goToToday,
    getEventsForDay,
  } = useWorkerSchedule();

  const handleEventClick = (event: WorkerScheduleEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

  const handleScheduleUpdate = () => {
    refetch();
  };

  const handleTaskUpdate = () => {
    refetch();
  };

  const handleViewChange = (newView: string) => {
    setView(newView as CalendarViewType);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load your schedule</p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold">My Schedule</h1>
            <p className="text-sm text-muted-foreground">{periodDisplay}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Worker Stats Bar */}
      <div className="flex items-center gap-4 p-4 bg-muted/20 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{workerStats.totalEvents} Assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{workerStats.scheduledHours}h Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{workerStats.completedTasks} Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{workerStats.workDays} Work Days</span>
        </div>
        {workerStats.upcomingEvents > 0 && (
          <Badge variant="secondary" className="text-xs">
            {workerStats.upcomingEvents} Upcoming
          </Badge>
        )}
      </div>

      {/* View Tabs */}
      <Tabs value={view} onValueChange={handleViewChange} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="flex-1 mt-4">
          <WorkerDailyView 
            date={currentDate} 
            events={getEventsForDay(currentDate)} 
            onEventClick={handleEventClick}
          />
        </TabsContent>

        <TabsContent value="week" className="flex-1 mt-4">
          <WorkerWeeklyView 
            calendarDays={calendarDays} 
            onEventClick={handleEventClick}
          />
        </TabsContent>

        <TabsContent value="month" className="flex-1 mt-4">
          <WorkerMonthlyView 
            calendarDays={calendarDays} 
            onEventClick={handleEventClick}
          />
        </TabsContent>
      </Tabs>

      <CalendarEventDetailDialog
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={handleCloseDialog}
      />

      <RealtimeCalendarSync 
        onScheduleUpdate={handleScheduleUpdate}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
}