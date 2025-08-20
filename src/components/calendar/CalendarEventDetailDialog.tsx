import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/services/calendarDataService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Flag, 
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarEventDetailDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarEventDetailDialog({ 
  event, 
  isOpen, 
  onClose 
}: CalendarEventDetailDialogProps) {
  const isMobile = useIsMobile();

  if (!event) return null;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'schedule': return <Calendar className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'phase': return <Flag className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in_progress': return 'bg-warning text-warning-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return 'Not specified';
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  const content = (
    <>
      <div className="space-y-6">
        {/* Header with type and status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getEventIcon(event.type)}
            <Badge variant="outline" className="capitalize">
              {event.type}
            </Badge>
          </div>
          {event.status && (
            <Badge className={getStatusColor(event.status)}>
              {event.status.replace('_', ' ')}
            </Badge>
          )}
        </div>

        {/* Event details */}
        <div className="space-y-4">
          {/* Date and time */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <div className="font-medium">
                {event.start_date === event.end_date ? (
                  format(new Date(event.start_date), 'PPP')
                ) : (
                  <>
                    {format(new Date(event.start_date), 'PPP')}
                    {event.end_date && event.start_date !== event.end_date && (
                      <> - {format(new Date(event.end_date), 'PPP')}</>
                    )}
                  </>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(event.start_date), 'p')}
                {event.end_date && event.start_date !== event.end_date && (
                  <> - {format(new Date(event.end_date), 'p')}</>
                )}
              </div>
            </div>
          </div>

          {/* Duration */}
          {event.estimated_hours && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">
                  Estimated: {formatDuration(event.estimated_hours)}
                  {event.actual_hours && (
                    <span className="ml-2">
                      | Actual: {formatDuration(event.actual_hours)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Project context */}
          {event.project_name && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Project</div>
                <div className="text-sm text-muted-foreground">
                  {event.project_name}
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          {event.address && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-sm text-muted-foreground">{event.address}</div>
              </div>
            </div>
          )}

          {/* Priority */}
          {event.priority && (
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Priority</div>
                <Badge variant={event.priority === 'high' ? 'destructive' : 
                              event.priority === 'medium' ? 'secondary' : 'outline'}>
                  {event.priority}
                </Badge>
              </div>
            </div>
          )}

          {/* Workers */}
          {event.workers && event.workers.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className="font-medium">
                    Assigned Workers ({event.workers.length})
                  </div>
                </div>
                <div className="space-y-2">
                  {event.workers.map((worker, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={worker.avatar_url} />
                        <AvatarFallback>
                          {worker.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{worker.name}</div>
                        {worker.is_primary && (
                          <div className="text-sm text-muted-foreground">Primary</div>
                        )}
                        {worker.is_assistant && (
                          <div className="text-sm text-muted-foreground">Assistant</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Description */}
          {event.title && event.title.length > 20 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="font-medium">Details</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.title}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {event.type === 'task' && (
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Task
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{event.title}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}