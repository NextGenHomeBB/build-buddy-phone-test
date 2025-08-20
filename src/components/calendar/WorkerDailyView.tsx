import { format, startOfDay, endOfDay } from 'date-fns';
import { Clock, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WorkerScheduleEvent } from '@/hooks/useWorkerSchedule';
import { cn } from '@/lib/utils';

interface WorkerDailyViewProps {
  date: Date;
  events: WorkerScheduleEvent[];
  onEventClick?: (event: WorkerScheduleEvent) => void;
  className?: string;
}

export function WorkerDailyView({ date, events, onEventClick, className }: WorkerDailyViewProps) {
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  // Group events by hour for timed events
  const eventsByTime = events.reduce((acc, event) => {
    const eventStart = new Date(event.start_date);
    const hour = eventStart.getHours();
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(event);
    return acc;
  }, {} as Record<number, WorkerScheduleEvent[]>);

  // Separate all-day events (phases and full-day tasks)
  const allDayEvents = events.filter(event => {
    if (event.type === 'phase') return true;
    if (event.type === 'task' && !event.start_date.includes('T')) return true;
    return false;
  });

  const timedEvents = events.filter(event => !allDayEvents.includes(event));

  const totalWorkHours = timedEvents.reduce((sum, event) => {
    if (event.type === 'schedule') {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    return sum + (event.estimated_hours || 0);
  }, 0);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Day Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{format(date, 'EEEE, MMMM d, yyyy')}</h2>
            <p className="text-sm text-muted-foreground">
              {events.length} events • {Math.round(totalWorkHours * 10) / 10}h scheduled
            </p>
          </div>
          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                Work Day
              </Badge>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* All Day Events */}
          {allDayEvents.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  All Day
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {allDayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        {event.project_name && (
                          <p className="text-xs text-muted-foreground">{event.project_name}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Timed Events */}
          <div className="space-y-1">
            {timeSlots.map((hour) => {
              const hourEvents = eventsByTime[hour] || [];
              const hasEvents = hourEvents.length > 0;

              return (
                <div key={hour} className="flex">
                  {/* Time Label */}
                  <div className="w-16 flex-shrink-0 text-right pr-4 pt-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                    </span>
                  </div>

                  {/* Events Column */}
                  <div className="flex-1 min-h-[60px] border-l border-border">
                    {hasEvents ? (
                      <div className="pl-4 space-y-2">
                        {hourEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => onEventClick?.(event)}
                            className="p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow"
                            style={{ 
                              borderLeftColor: event.color, 
                              borderLeftWidth: '4px',
                              backgroundColor: `${event.color}10`
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">{event.title}</h4>
                                  <Badge 
                                    variant={event.isAssigned ? "default" : "secondary"} 
                                    className="text-xs"
                                  >
                                    {event.type}
                                  </Badge>
                                </div>
                                
                                {event.type === 'schedule' && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(event.start_date), 'HH:mm')} - 
                                    {format(new Date(event.end_date), 'HH:mm')}
                                  </div>
                                )}
                                
                                {event.address && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{event.address}</span>
                                  </div>
                                )}
                                
                                {event.project_name && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {event.project_name}
                                  </p>
                                )}
                              </div>

                              {event.status && (
                                <Badge 
                                  variant={event.status === 'completed' ? 'default' : 'outline'} 
                                  className="text-xs capitalize"
                                >
                                  {event.status}
                                </Badge>
                              )}
                            </div>

                            {/* Worker assignment indicator */}
                            {event.isAssigned && (
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                                <User className="h-3 w-3 text-primary" />
                                <span className="text-xs text-primary font-medium">
                                  Assigned to you
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="pl-4 h-full flex items-center opacity-0 hover:opacity-20 transition-opacity">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}