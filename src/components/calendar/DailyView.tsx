import { format } from 'date-fns';
import { CalendarEventCard } from './CalendarEventCard';
import { type CalendarEvent } from '@/services/calendarDataService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface DailyViewProps {
  date: Date;
  events: CalendarEvent[];
  className?: string;
}

export function DailyView({ date, events, className }: DailyViewProps) {
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  // Group events by time
  const eventsByTime = events.reduce((acc, event) => {
    const hour = new Date(event.start_date).getHours();
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(event);
    return acc;
  }, {} as Record<number, CalendarEvent[]>);

  // All-day events (where start_date === end_date or duration > 1 day)
  const allDayEvents = events.filter(event => {
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    return format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd') && 
           start.getHours() === 0 && start.getMinutes() === 0 &&
           end.getHours() === 23 && end.getMinutes() === 59;
  });

  const timedEvents = events.filter(event => !allDayEvents.includes(event));

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {events.length} events scheduled
        </p>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="border-b p-4 bg-muted/20">
          <h3 className="text-sm font-medium mb-2">All Day</h3>
          <div className="space-y-2">
            {allDayEvents.map((event) => (
              <CalendarEventCard
                key={event.id}
                event={event}
                showTime={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Timed events */}
      <ScrollArea className="flex-1">
        <div className="relative">
          {timeSlots.map((hour) => (
            <div key={hour} className="flex border-b">
              {/* Time column */}
              <div className="w-16 p-2 text-sm text-muted-foreground border-r">
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
              </div>
              
              {/* Events column */}
              <div className="flex-1 p-2 min-h-16">
                {eventsByTime[hour]?.map((event) => (
                  <CalendarEventCard
                    key={event.id}
                    event={event}
                    className="mb-2"
                  />
                ))}
                {!eventsByTime[hour] && (
                  <div className="h-12 flex items-center text-xs text-muted-foreground">
                    No events
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}