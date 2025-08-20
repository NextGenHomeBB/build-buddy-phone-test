import { format } from 'date-fns';
import { Clock, MapPin, CheckCircle, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkerCalendarDay, WorkerScheduleEvent } from '@/hooks/useWorkerSchedule';
import { cn } from '@/lib/utils';

interface WorkerWeeklyViewProps {
  calendarDays: WorkerCalendarDay[];
  onEventClick?: (event: WorkerScheduleEvent) => void;
  className?: string;
}

export function WorkerWeeklyView({ calendarDays, onEventClick, className }: WorkerWeeklyViewProps) {
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Ensure we have 7 days for the week view
  const weekDays = calendarDays.slice(0, 7);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-3 border-r text-xs font-medium text-muted-foreground">
          Time
        </div>
        {weekDays.map((day, index) => (
          <div key={day.date.toISOString()} className="p-3 border-r last:border-r-0">
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground">
                {daysOfWeek[index]}
              </div>
              <div className={cn(
                "text-lg font-semibold mt-1",
                day.isToday && "text-primary",
                !day.isCurrentMonth && "text-muted-foreground"
              )}>
                {day.dayNumber}
              </div>
              {day.isWorkDay && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {day.totalHours}h
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="min-h-full">
          {timeSlots.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border/50 min-h-[80px]">
              {/* Time Label */}
              <div className="p-2 border-r text-right">
                <span className="text-xs text-muted-foreground">
                  {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                </span>
              </div>

              {/* Days */}
              {weekDays.map((day) => {
                const hourEvents = day.events.filter(event => {
                  if (event.type === 'schedule') {
                    const eventHour = new Date(event.start_date).getHours();
                    return eventHour === hour;
                  }
                  return false;
                });

                return (
                  <div key={day.date.toISOString()} className="p-1 border-r last:border-r-0">
                    <div className="space-y-1">
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          className="p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow"
                          style={{ 
                            backgroundColor: `${event.color}20`,
                            borderLeft: `3px solid ${event.color}`
                          }}
                        >
                          <div className="space-y-1">
                            <div className="font-medium truncate text-xs">
                              {event.title}
                            </div>
                            
                            {event.type === 'schedule' && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(event.start_date), 'HH:mm')}-
                                  {format(new Date(event.end_date), 'HH:mm')}
                                </span>
                              </div>
                            )}
                            
                            {event.address && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{event.address}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs px-1 py-0 capitalize">
                                {event.type}
                              </Badge>
                              
                              {event.isAssigned && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-primary" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Show all-day events at the top of each day */}
                      {hour === 0 && day.events.filter(e => e.type !== 'schedule').map((event) => (
                        <div
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          className="p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-shadow mb-1"
                          style={{ 
                            backgroundColor: `${event.color}15`,
                            borderLeft: `3px solid ${event.color}`
                          }}
                        >
                          <div className="space-y-1">
                            <div className="font-medium truncate text-xs">
                              {event.title}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs px-1 py-0 capitalize">
                                {event.type}
                              </Badge>
                              
                              {event.status === 'completed' && (
                                <CheckCircle className="h-3 w-3 text-success" />
                              )}
                              
                              {event.isAssigned && (
                                <User className="h-3 w-3 text-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}