import { format } from 'date-fns';
import { CalendarEventCard } from './CalendarEventCard';
import { type CalendarDay } from '@/hooks/useEnhancedCalendar';
import { cn } from '@/lib/utils';

interface MonthlyViewProps {
  calendarDays: CalendarDay[];
  className?: string;
}

export function MonthlyView({ calendarDays, className }: MonthlyViewProps) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Group days into weeks
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with day names */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-6">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "border-r last:border-r-0 p-1 min-h-24 flex flex-col",
                  !day.isCurrentMonth && "bg-muted/20",
                  day.isToday && "bg-primary/5"
                )}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm font-medium",
                    !day.isCurrentMonth && "text-muted-foreground",
                    day.isToday && "text-primary font-bold"
                  )}>
                    {day.dayNumber}
                  </span>
                  {day.events.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{day.events.length - 3}
                    </span>
                  )}
                </div>

                {/* Events */}
                <div className="flex-1 space-y-1">
                  {day.events.slice(0, 3).map((event) => (
                    <CalendarEventCard
                      key={event.id}
                      event={event}
                      compact
                      showTime={false}
                      className="cursor-pointer hover:shadow-sm transition-shadow"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}