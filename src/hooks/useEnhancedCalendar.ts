import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { calendarDataService, type CalendarEvent, type CalendarData } from '@/services/calendarDataService';

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  dayNumber: string;
}

export function useEnhancedCalendar(initialDate = new Date(), initialView: CalendarView = 'month') {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<CalendarView>(initialView);

  const { data: calendarData, isLoading, error, refetch } = useQuery({
    queryKey: ['calendar-events', currentDate, view],
    queryFn: async () => {
      switch (view) {
        case 'day':
          return calendarDataService.getEventsForDay(currentDate);
        case 'week':
          return calendarDataService.getEventsForWeek(currentDate);
        case 'month':
          return calendarDataService.getEventsForMonth(currentDate);
        default:
          return calendarDataService.getEventsForMonth(currentDate);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const events = calendarData?.events || [];

  // Navigation functions
  const navigateNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const navigatePrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
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

  // Monthly view data
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const calendarDays = useMemo(() => {
    return monthDays.map(day => ({
      date: day,
      isCurrentMonth: isSameMonth(day, currentDate),
      isToday: isToday(day),
      events: getEventsForDay(day),
      dayNumber: format(day, 'd'),
    }));
  }, [monthDays, currentDate, events]);

  // Weekly view data  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weekCalendarDays = useMemo(() => {
    return weekDays.map(day => ({
      date: day,
      isCurrentMonth: true, // All days are relevant in week view
      isToday: isToday(day),
      events: getEventsForDay(day),
      dayNumber: format(day, 'd'),
    }));
  }, [weekDays, events]);

  // Current period display
  const periodDisplay = useMemo(() => {
    switch (view) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'week':
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  }, [currentDate, view, weekStart, weekEnd]);

  // Filter functions
  const filterEventsByType = (type: CalendarEvent['type']) => {
    return events.filter(event => event.type === type);
  };

  const filterEventsByProject = (projectId: string) => {
    return events.filter(event => event.project_id === projectId);
  };

  // Statistics
  const stats = useMemo(() => {
    const taskEvents = events.filter(e => e.type === 'task');
    const scheduleEvents = events.filter(e => e.type === 'schedule');
    const phaseEvents = events.filter(e => e.type === 'phase');

    return {
      totalEvents: events.length,
      tasks: taskEvents.length,
      schedules: scheduleEvents.length,
      phases: phaseEvents.length,
      completedTasks: taskEvents.filter(e => e.status === 'completed').length,
      overdueTasks: taskEvents.filter(e => {
        const dueDate = new Date(e.start_date);
        return dueDate < new Date() && e.status !== 'completed';
      }).length,
    };
  }, [events]);

  return {
    // State
    currentDate,
    view,
    setView,
    setCurrentDate,
    
    // Data
    events,
    calendarData: calendarData || { events: [], schedules: [], tasks: [], phases: [] },
    calendarDays,
    weekCalendarDays,
    monthStart,
    monthEnd,
    weekStart,
    weekEnd,
    periodDisplay,
    stats,
    
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
    filterEventsByType,
    filterEventsByProject,
  };
}