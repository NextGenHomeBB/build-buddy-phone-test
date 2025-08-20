import { Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { type CalendarEvent } from '@/services/calendarDataService';
import { cn } from '@/lib/utils';

interface CalendarEventCardProps {
  event: CalendarEvent;
  compact?: boolean;
  showTime?: boolean;
  className?: string;
  onClick?: (event: CalendarEvent) => void;
}

export function CalendarEventCard({ 
  event, 
  compact = false, 
  showTime = true, 
  className,
  onClick 
}: CalendarEventCardProps) {
  const getTypeIcon = () => {
    switch (event.type) {
      case 'schedule':
        return <MapPin className="h-3 w-3" />;
      case 'task':
        return <AlertCircle className="h-3 w-3" />;
      case 'phase':
        return <Users className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (event.type) {
      case 'schedule':
        return 'Schedule';
      case 'task':
        return 'Task';
      case 'phase':
        return 'Phase';
      default:
        return event.type;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return '';
    }
  };

  const getStatusBadgeVariant = () => {
    if (event.type === 'task') {
      switch (event.status) {
        case 'completed': return 'default';
        case 'in-progress': return 'secondary';
        case 'review': return 'outline';
        default: return 'secondary';
      }
    }
    if (event.type === 'phase') {
      switch (event.status) {
        case 'completed': return 'default';
        case 'active': return 'secondary';
        case 'on-hold': return 'outline';
        default: return 'secondary';
      }
    }
    return 'secondary';
  };

  const getPriorityColor = () => {
    if (event.priority) {
      switch (event.priority) {
        case 'urgent': return 'text-destructive';
        case 'high': return 'text-warning';
        case 'medium': return 'text-primary';
        case 'low': return 'text-muted-foreground';
        default: return 'text-muted-foreground';
      }
    }
    return 'text-muted-foreground';
  };

  if (compact) {
    return (
      <div 
        className={cn(
          "text-xs p-1 rounded border-l-2 bg-background/80 backdrop-blur-sm cursor-pointer hover:bg-accent/50 transition-colors",
          className
        )}
        style={{ borderLeftColor: event.color }}
        onClick={() => onClick?.(event)}
      >
        <div className="flex items-center gap-1 mb-1">
          {getTypeIcon()}
          <span className="font-medium truncate">{event.title}</span>
        </div>
        {showTime && event.start_date !== event.end_date && (
          <div className="text-muted-foreground">
            {formatTime(event.start_date)} - {formatTime(event.end_date)}
          </div>
        )}
        {event.workers && event.workers.length > 0 && (
          <div className="flex -space-x-1 mt-1">
            {event.workers.slice(0, 3).map((worker, index) => (
              <Avatar key={worker.id} className="h-4 w-4 border border-background">
                <AvatarFallback className="text-xs">
                  {worker.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            ))}
            {event.workers.length > 3 && (
              <div className="h-4 w-4 rounded-full bg-muted text-xs flex items-center justify-center">
                +{event.workers.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card 
      className={cn("mb-2 cursor-pointer hover:shadow-md transition-shadow", className)}
      onClick={() => onClick?.(event)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: event.color }}
            />
            <h4 className="font-medium text-sm">{event.title}</h4>
          </div>
          <Badge variant={getStatusBadgeVariant()} className="text-xs">
            {getTypeLabel()}
          </Badge>
        </div>

        {event.project_name && (
          <p className="text-xs text-muted-foreground mb-2">
            {event.project_name}
          </p>
        )}

        {event.address && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span>{event.address}</span>
          </div>
        )}

        {showTime && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Clock className="h-3 w-3" />
            <span>
              {event.start_date === event.end_date ? (
                formatTime(event.start_date)
              ) : (
                `${formatTime(event.start_date)} - ${formatTime(event.end_date)}`
              )}
            </span>
          </div>
        )}

        {(event.estimated_hours || event.actual_hours) && (
          <div className="text-xs text-muted-foreground mb-2">
            {event.estimated_hours && (
              <span>Est: {event.estimated_hours}h</span>
            )}
            {event.actual_hours && (
              <span className="ml-2">Actual: {event.actual_hours}h</span>
            )}
          </div>
        )}

        {event.priority && (
          <Badge variant="outline" className={cn("text-xs mr-2", getPriorityColor())}>
            {event.priority}
          </Badge>
        )}

        {event.status && event.type !== 'schedule' && (
          <Badge variant="outline" className="text-xs">
            {event.status}
          </Badge>
        )}

        {event.workers && event.workers.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <Users className="h-3 w-3 text-muted-foreground" />
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {event.workers.slice(0, 4).map((worker) => (
                  <Avatar key={worker.id} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {worker.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {event.workers.length > 4 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{event.workers.length - 4} more
                </span>
              )}
              <div className="text-xs text-muted-foreground ml-2">
                {event.workers.map(w => w.name).join(', ')}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}