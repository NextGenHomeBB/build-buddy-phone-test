import { format } from 'date-fns';
import { CalendarEventCard } from './CalendarEventCard';
import { type CalendarDay } from '@/hooks/useEnhancedCalendar';
import { cn } from '@/lib/utils';

interface WeeklyViewProps {
  weekDays: CalendarDay[];
  className?: string;
}

export function WeeklyView({ weekDays, className }: WeeklyViewProps) {
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 text-sm font-medium text-muted-foreground">Time</div>
        {weekDays.map((day) => (
          <div key={day.date.toISOString()} className="p-2 text-center border-l">
            <div className="text-sm font-medium">
              {format(day.date, 'EEE')}
            </div>
            <div className={cn(
              "text-lg font-bold mt-1",
              day.isToday && "text-primary"
            )}>
              {day.dayNumber}
            </div>
            {day.events.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {day.events.length} events
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Time slots and events */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="border-r">
            {timeSlots.map((hour) => (
              <div key={hour} className="h-16 border-b p-1 text-xs text-muted-foreground">
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => (
            <div key={day.date.toISOString()} className="border-l relative">
              {timeSlots.map((hour) => (
                <div key={hour} className="h-16 border-b relative">
                  {/* Events for this hour */}
                  {day.events
                    .filter(event => {
                      const eventHour = new Date(event.start_date).getHours();
                      return eventHour === hour;
                    })
                    .map((event) => (
                      <div
                        key={event.id}
                        className="absolute inset-x-1 z-10"
                        style={{
                          top: '2px',
                          height: 'calc(100% - 4px)',
                        }}
                      >
                        <CalendarEventCard
                          event={event}
                          compact
                          showTime={false}
                          className="h-full"
                        />
                      </div>
                    ))}
                </div>
              ))}

              {/* All-day events */}
              {day.events.filter(event => event.start_date === event.end_date).length > 0 && (
                <div className="absolute top-0 inset-x-1 z-20">
                  {day.events
                    .filter(event => event.start_date === event.end_date)
                    .slice(0, 2)
                    .map((event, index) => (
                      <div key={event.id} style={{ marginTop: `${index * 20}px` }}>
                        <CalendarEventCard
                          event={event}
                          compact
                          showTime={false}
                          className="mb-1"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}