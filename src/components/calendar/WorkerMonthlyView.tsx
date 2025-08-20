import { format } from 'date-fns';
import { Clock, CheckCircle, User, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WorkerCalendarDay, WorkerScheduleEvent } from '@/hooks/useWorkerSchedule';
import { cn } from '@/lib/utils';

interface WorkerMonthlyViewProps {
  calendarDays: WorkerCalendarDay[];
  onEventClick?: (event: WorkerScheduleEvent) => void;
  className?: string;
}

export function WorkerMonthlyView({ calendarDays, onEventClick, className }: WorkerMonthlyViewProps) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Group days into weeks
  const weeks: WorkerCalendarDay[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Month Header */}
      <div className="grid grid-cols-7 border-b">
        {daysOfWeek.map((day) => (
          <div key={day} className="p-3 text-center border-r last:border-r-0">
            <span className="text-sm font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 min-h-[120px] border-b">
            {week.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "p-2 border-r last:border-r-0 flex flex-col",
                  !day.isCurrentMonth && "bg-muted/20",
                  day.isToday && "bg-primary/5 border-primary/20"
                )}
              >
                {/* Day Number and Stats */}
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm font-semibold",
                    day.isToday && "text-primary",
                    !day.isCurrentMonth && "text-muted-foreground"
                  )}>
                    {day.dayNumber}
                  </span>
                  
                  {day.isWorkDay && (
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {day.totalHours}h
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Events */}
                <div className="flex-1 space-y-1">
                  {day.events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className="p-1.5 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow"
                      style={{ 
                        backgroundColor: `${event.color}15`,
                        borderLeft: `2px solid ${event.color}`
                      }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-xs">
                            {event.title}
                          </div>
                          
                          {event.type === 'schedule' && event.address && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-2.5 w-2.5" />
                              <span className="truncate">{event.address}</span>
                            </div>
                          )}
                          
                          {event.type === 'schedule' && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-2.5 w-2.5" />
                              <span>
                                {format(new Date(event.start_date), 'HH:mm')}-
                                {format(new Date(event.end_date), 'HH:mm')}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {event.status === 'completed' && (
                            <CheckCircle className="h-3 w-3 text-success" />
                          )}
                          
                          {event.isAssigned && (
                            <User className="h-3 w-3 text-primary" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-xs px-1 py-0 capitalize">
                          {event.type}
                        </Badge>
                        
                        {event.category && event.type === 'schedule' && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {event.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Show "more" indicator if there are additional events */}
                  {day.events.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>

                {/* Work day indicator */}
                {day.isWorkDay && day.events.length === 0 && (
                  <div className="flex items-center justify-center py-2">
                    <Badge variant="outline" className="text-xs">
                      Available
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}