import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addDays, subDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarEvent, CalendarData } from '@/services/calendarDataService';

export type WorkerCalendarView = 'day' | 'week' | 'month';

export interface WorkerScheduleEvent extends CalendarEvent {
  isAssigned: boolean;
  canModify: boolean;
  timeTracked?: number;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface WorkerCalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: WorkerScheduleEvent[];
  dayNumber: string;
  totalHours: number;
  isWorkDay: boolean;
}

export function useWorkerSchedule(initialDate = new Date(), initialView: WorkerCalendarView = 'month') {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<WorkerCalendarView>(initialView);
  const { user } = useAuth();

  const { data: workerScheduleData, isLoading, error, refetch } = useQuery({
    queryKey: ['worker-schedule', user?.id, currentDate, view],
    queryFn: async () => {
      if (!user?.id) return { events: [], schedules: [], tasks: [], phases: [] };
      return getWorkerScheduleForDateRange(currentDate, view, user.id);
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const events = (workerScheduleData?.events || []) as WorkerScheduleEvent[];

  // Navigation functions
  const navigateNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(prevDate => {
          const nextWeek = new Date(prevDate);
          nextWeek.setDate(nextWeek.getDate() + 7);
          return nextWeek;
        });
        break;
      case 'month':
        setCurrentDate(prevDate => {
          const nextMonth = new Date(prevDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          return nextMonth;
        });
        break;
    }
  };

  const navigatePrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(prevDate => {
          const prevWeek = new Date(prevDate);
          prevWeek.setDate(prevWeek.getDate() - 7);
          return prevWeek;
        });
        break;
      case 'month':
        setCurrentDate(prevDate => {
          const prevMonth = new Date(prevDate);
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          return prevMonth;
        });
        break;
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  // Helper functions for different views
  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => {
      const eventStart = format(new Date(event.start_date), 'yyyy-MM-dd');
      const eventEnd = format(new Date(event.end_date), 'yyyy-MM-dd');
      return dateStr >= eventStart && dateStr <= eventEnd;
    });
  };

  // Calculate date ranges based on view
  const { startDate, endDate } = useMemo(() => {
    switch (view) {
      case 'day':
        return { startDate: currentDate, endDate: currentDate };
      case 'week':
        return { 
          startDate: startOfWeek(currentDate, { weekStartsOn: 1 }), 
          endDate: endOfWeek(currentDate, { weekStartsOn: 1 }) 
        };
      case 'month':
        return { 
          startDate: startOfMonth(currentDate), 
          endDate: endOfMonth(currentDate) 
        };
      default:
        return { startDate: currentDate, endDate: currentDate };
    }
  }, [currentDate, view]);

  const calendarDays = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.map(day => {
      const dayEvents = getEventsForDay(day);
      const totalHours = dayEvents.reduce((sum, event) => {
        if (event.type === 'schedule') {
          const start = new Date(`${format(day, 'yyyy-MM-dd')}T${event.start_date.split('T')[1]}`);
          const end = new Date(`${format(day, 'yyyy-MM-dd')}T${event.end_date.split('T')[1]}`);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }
        return sum + (event.estimated_hours || 0);
      }, 0);

      return {
        date: day,
        isCurrentMonth: view === 'month' ? isSameMonth(day, currentDate) : true,
        isToday: isToday(day),
        events: dayEvents,
        dayNumber: format(day, 'd'),
        totalHours: Math.round(totalHours * 10) / 10,
        isWorkDay: dayEvents.length > 0,
      };
    });
  }, [startDate, endDate, events, currentDate, view]);

  // Current period display
  const periodDisplay = useMemo(() => {
    switch (view) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'week':
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  }, [currentDate, view, startDate, endDate]);

  // Worker-specific statistics
  const workerStats = useMemo(() => {
    const scheduledEvents = events.filter(e => e.type === 'schedule' && (e as WorkerScheduleEvent).isAssigned);
    const assignedTasks = events.filter(e => e.type === 'task' && (e as WorkerScheduleEvent).isAssigned);
    const completedTasks = assignedTasks.filter(e => e.status === 'completed');
    const upcomingEvents = events.filter(e => {
      const eventDate = new Date(e.start_date);
      return eventDate > new Date() && (e as WorkerScheduleEvent).isAssigned;
    });

    const totalScheduledHours = scheduledEvents.reduce((sum, event) => {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    return {
      totalEvents: events.filter(e => (e as WorkerScheduleEvent).isAssigned).length,
      scheduledHours: Math.round(totalScheduledHours * 10) / 10,
      assignedTasks: assignedTasks.length,
      completedTasks: completedTasks.length,
      upcomingEvents: upcomingEvents.length,
      workDays: calendarDays.filter(d => d.isWorkDay).length,
    };
  }, [events, calendarDays]);

  return {
    // State
    currentDate,
    view,
    setView,
    setCurrentDate,
    
    // Data
    events,
    workerScheduleData: workerScheduleData || { events: [], schedules: [], tasks: [], phases: [] },
    calendarDays,
    startDate,
    endDate,
    periodDisplay,
    workerStats,
    
    // Loading states
    isLoading,
    error,
    refetch,
    
    // Navigation
    navigateNext,
    navigatePrevious,
    goToToday,
    
    // Helpers
    getEventsForDay,
  };
}

async function getWorkerScheduleForDateRange(
  currentDate: Date,
  view: WorkerCalendarView,
  userId: string
): Promise<CalendarData & { events: WorkerScheduleEvent[] }> {
  let startDate: Date, endDate: Date;

  switch (view) {
    case 'day':
      startDate = endDate = currentDate;
      break;
    case 'week':
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      break;
    case 'month':
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
      break;
    default:
      startDate = endDate = currentDate;
  }

  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');

  // Fetch worker's assigned schedule items
  const schedulesPromise = getWorkerScheduleEvents(startStr, endStr, userId);
  
  // Fetch worker's assigned tasks
  const tasksPromise = getWorkerTaskEvents(startStr, endStr, userId);
  
  // Fetch phases for projects worker is assigned to
  const phasesPromise = getWorkerPhaseEvents(startStr, endStr, userId);

  const [schedules, tasks, phases] = await Promise.all([
    schedulesPromise,
    tasksPromise,
    phasesPromise
  ]);

  const events = [...schedules, ...tasks, ...phases] as WorkerScheduleEvent[];

  return {
    events,
    schedules: schedules.map(e => e.raw),
    tasks: tasks.map(e => e.raw),
    phases: phases.map(e => e.raw)
  };
}

async function getWorkerScheduleEvents(
  startDate: string, 
  endDate: string, 
  userId: string
): Promise<(WorkerScheduleEvent & { raw: any })[]> {
  const { data: schedules, error } = await supabase
    .from('schedules')
    .select(`
      id,
      work_date,
      schedule_items (
        id,
        project_id,
        address,
        category,
        start_time,
        end_time,
        projects (
          name
        ),
        schedule_item_workers!inner (
          id,
          user_id,
          is_assistant
        )
      )
    `)
    .gte('work_date', startDate)
    .lte('work_date', endDate)
    .filter('schedule_items.schedule_item_workers.user_id', 'eq', userId);

  if (error) throw error;

  const events: (WorkerScheduleEvent & { raw: any })[] = [];

  schedules?.forEach(schedule => {
    schedule.schedule_items?.forEach((item: any) => {
      const worker = item.schedule_item_workers?.find((w: any) => w.user_id === userId);
      if (!worker) return;

      const startDateTime = `${schedule.work_date}T${item.start_time}`;
      const endDateTime = `${schedule.work_date}T${item.end_time}`;

      events.push({
        id: `schedule-${item.id}`,
        title: item.address,
        start_date: startDateTime,
        end_date: endDateTime,
        type: 'schedule',
        category: item.category,
        color: getWorkerScheduleColor(item.category),
        project_id: item.project_id,
        project_name: item.projects?.name,
        address: item.address,
        workers: [{ 
          id: worker.id, 
          user_id: worker.user_id, 
          name: '', 
          is_assistant: worker.is_assistant 
        }],
        isAssigned: true,
        canModify: true,
        raw: item
      });
    });
  });

  return events;
}

async function getWorkerTaskEvents(
  startDate: string, 
  endDate: string, 
  userId: string
): Promise<(WorkerScheduleEvent & { raw: any })[]> {
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      due_date,
      priority,
      status,
      estimated_hours,
      actual_hours,
      project_id,
      assigned_to,
      projects (
        name
      ),
      project_phases (
        name
      )
    `)
    .eq('assigned_to', userId)
    .gte('due_date', startDate)
    .lte('due_date', endDate)
    .not('due_date', 'is', null);

  if (error) throw error;

  return tasks?.map((task: any) => ({
    id: `task-${task.id}`,
    title: task.title,
    start_date: task.due_date,
    end_date: task.due_date,
    type: 'task' as const,
    priority: task.priority,
    status: task.status,
    color: getWorkerTaskColor(task.priority, task.status),
    project_id: task.project_id,
    project_name: task.projects?.name,
    estimated_hours: task.estimated_hours,
    actual_hours: task.actual_hours,
    workers: [],
    isAssigned: task.assigned_to === userId,
    canModify: task.status !== 'completed',
    raw: task
  })) || [];
}

async function getWorkerPhaseEvents(
  startDate: string, 
  endDate: string, 
  userId: string
): Promise<(WorkerScheduleEvent & { raw: any })[]> {
  const { data: phases, error } = await supabase
    .from('project_phases')
    .select(`
      id,
      name,
      start_date,
      end_date,
      status,
      progress,
      budget,
      project_id,
      projects!inner (
        name,
        user_project_role!inner (
          user_id,
          role
        )
      )
    `)
    .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`)
    .not('start_date', 'is', null)
    .not('end_date', 'is', null)
    .filter('projects.user_project_role.user_id', 'eq', userId);

  if (error) throw error;

  return phases?.map((phase: any) => ({
    id: `phase-${phase.id}`,
    title: phase.name,
    start_date: phase.start_date,
    end_date: phase.end_date,
    type: 'phase' as const,
    status: phase.status,
    color: getWorkerPhaseColor(phase.status),
    project_id: phase.project_id,
    project_name: phase.projects?.name,
    workers: [],
    isAssigned: true,
    canModify: false,
    raw: phase
  })) || [];
}

function getWorkerScheduleColor(category: string): string {
  const colors = {
    normal: 'hsl(var(--primary))',
    materials: 'hsl(var(--secondary))',
    storingen: 'hsl(var(--destructive))',
    specials: 'hsl(var(--accent))'
  };
  return colors[category as keyof typeof colors] || 'hsl(var(--muted))';
}

function getWorkerTaskColor(priority: string, status: string): string {
  if (status === 'completed') return 'hsl(var(--success))';
  
  const colors = {
    urgent: 'hsl(var(--destructive))',
    high: 'hsl(var(--warning))',
    medium: 'hsl(var(--primary))',
    low: 'hsl(var(--muted))'
  };
  return colors[priority as keyof typeof colors] || 'hsl(var(--muted))';
}

function getWorkerPhaseColor(status: string): string {
  const colors = {
    planning: 'hsl(var(--muted))',
    active: 'hsl(var(--primary))',
    completed: 'hsl(var(--success))',
    'on-hold': 'hsl(var(--warning))',
    cancelled: 'hsl(var(--destructive))'
  };
  return colors[status as keyof typeof colors] || 'hsl(var(--muted))';
}