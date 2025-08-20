import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, BarChart3, Plus, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedCalendar, type CalendarView } from '@/hooks/useEnhancedCalendar';
import { CalendarEvent } from '@/services/calendarDataService';
import { CalendarEventDetailDialog } from './CalendarEventDetailDialog';
import { DailyView } from './DailyView';
import { WeeklyView } from './WeeklyView';
import { MonthlyView } from './MonthlyView';
import { cn } from '@/lib/utils';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface EnhancedCalendarViewProps {
  className?: string;
}

export function EnhancedCalendarView({ className }: EnhancedCalendarViewProps) {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const {
    currentDate,
    view,
    setView,
    events,
    calendarDays,
    weekCalendarDays,
    periodDisplay,
    stats,
    isLoading,
    error,
    refetch,
    navigateNext,
    navigatePrevious,
    goToToday,
    getEventsForDay,
    filterEventsByType,
    filterEventsByProject,
  } = useEnhancedCalendar();

  const { isAdmin, isManager } = useRoleAccess();

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    if (selectedProject !== 'all' && event.project_id !== selectedProject) return false;
    if (selectedType !== 'all' && event.type !== selectedType) return false;
    return true;
  });

  // Get unique projects for filter
  const projects = Array.from(new Set(events.map(e => e.project_id).filter(Boolean)))
    .map(id => events.find(e => e.project_id === id))
    .filter(Boolean);

  const handleViewChange = (newView: string) => {
    setView(newView as CalendarView);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load calendar data</p>
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
          
          <h1 className="text-xl font-semibold">{periodDisplay}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project!.project_id} value={project!.project_id!}>
                  {project!.project_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="schedule">Schedules</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
              <SelectItem value="phase">Phases</SelectItem>
            </SelectContent>
          </Select>

          {(isAdmin || isManager) && (
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 p-4 bg-muted/20 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{stats.totalEvents} Events</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{stats.tasks} Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{stats.schedules} Schedules</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{stats.phases} Phases</span>
        </div>
        {stats.overdueTasks > 0 && (
          <Badge variant="destructive" className="text-xs">
            {stats.overdueTasks} Overdue
          </Badge>
        )}
        {isLoading && (
          <div className="ml-auto">
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
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
          <DailyView 
            date={currentDate} 
            events={getEventsForDay(currentDate).filter(event => {
              if (selectedProject !== 'all' && event.project_id !== selectedProject) return false;
              if (selectedType !== 'all' && event.type !== selectedType) return false;
              return true;
            })} 
            onEventClick={handleEventClick}
          />
        </TabsContent>

        <TabsContent value="week" className="flex-1 mt-4">
          <WeeklyView 
            weekDays={weekCalendarDays.map(day => ({
              ...day,
              events: day.events.filter(event => {
                if (selectedProject !== 'all' && event.project_id !== selectedProject) return false;
                if (selectedType !== 'all' && event.type !== selectedType) return false;
                return true;
              })
            }))} 
            onEventClick={handleEventClick}
          />
        </TabsContent>

        <TabsContent value="month" className="flex-1 mt-4">
          <MonthlyView 
            calendarDays={calendarDays.map(day => ({
              ...day,
              events: day.events.filter(event => {
                if (selectedProject !== 'all' && event.project_id !== selectedProject) return false;
                if (selectedType !== 'all' && event.type !== selectedType) return false;
                return true;
              })
            }))} 
            onEventClick={handleEventClick}
          />
        </TabsContent>
      </Tabs>

      <CalendarEventDetailDialog
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={handleCloseDialog}
      />
    </div>
  );
}