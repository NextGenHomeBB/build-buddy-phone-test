import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  type: 'schedule' | 'task' | 'phase';
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: string;
  color?: string;
  project_id?: string;
  project_name?: string;
  address?: string;
  estimated_hours?: number;
  actual_hours?: number;
  workers?: Array<{
    id: string;
    user_id: string;
    name: string;
    is_primary?: boolean;
    is_assistant?: boolean;
    avatar_url?: string | null;
  }>;
}

export interface CalendarData {
  events: CalendarEvent[];
  schedules: any[];
  tasks: any[];
  phases: any[];
}

class CalendarDataService {
  async getEventsForDateRange(startDate: Date, endDate: Date): Promise<CalendarData> {
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');

    // Fetch schedules for the date range
    const schedulesPromise = this.getScheduleEvents(startStr, endStr);
    
    // Fetch tasks for the date range
    const tasksPromise = this.getTaskEvents(startStr, endStr);
    
    // Fetch phases for the date range
    const phasesPromise = this.getPhaseEvents(startStr, endStr);

    const [schedules, tasks, phases] = await Promise.all([
      schedulesPromise,
      tasksPromise,
      phasesPromise
    ]);

    const events = [...schedules, ...tasks, ...phases];

    return {
      events,
      schedules: schedules.map(e => e.raw),
      tasks: tasks.map(e => e.raw),
      phases: phases.map(e => e.raw)
    };
  }

  private async getScheduleEvents(startDate: string, endDate: string): Promise<(CalendarEvent & { raw: any })[]> {
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
          schedule_item_workers (
            id,
            user_id,
            is_assistant,
            profiles (
              name,
              avatar_url
            )
          )
        )
      `)
      .gte('work_date', startDate)
      .lte('work_date', endDate);

    if (error) throw error;

    const events: (CalendarEvent & { raw: any })[] = [];

    schedules?.forEach(schedule => {
      schedule.schedule_items?.forEach((item: any) => {
        const startDateTime = `${schedule.work_date}T${item.start_time}`;
        const endDateTime = `${schedule.work_date}T${item.end_time}`;

        events.push({
          id: `schedule-${item.id}`,
          title: item.address,
          start_date: startDateTime,
          end_date: endDateTime,
          type: 'schedule',
          category: item.category,
          color: this.getScheduleColor(item.category),
          project_id: item.project_id,
          project_name: item.projects?.name,
          address: item.address,
          workers: item.schedule_item_workers?.map((worker: any) => ({
            id: worker.id,
            user_id: worker.user_id,
            name: worker.profiles?.name,
            is_assistant: worker.is_assistant,
            avatar_url: worker.profiles?.avatar_url
          })) || [],
          raw: item
        });
      });
    });

    return events;
  }

  private async getTaskEvents(startDate: string, endDate: string): Promise<(CalendarEvent & { raw: any })[]> {
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
        projects (
          name
        ),
        project_phases (
          name
        ),
        task_workers (
          id,
          user_id,
          is_primary,
          profiles (
            name,
            avatar_url
          )
        )
      `)
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
      color: this.getTaskColor(task.priority, task.status),
      project_id: task.project_id,
      project_name: task.projects?.name,
      estimated_hours: task.estimated_hours,
      actual_hours: task.actual_hours,
      workers: task.task_workers?.map((worker: any) => ({
        id: worker.id,
        user_id: worker.user_id,
        name: worker.profiles?.name,
        is_primary: worker.is_primary,
        avatar_url: worker.profiles?.avatar_url
      })) || [],
      raw: task
    })) || [];
  }

  private async getPhaseEvents(startDate: string, endDate: string): Promise<(CalendarEvent & { raw: any })[]> {
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
        projects (
          name
        )
      `)
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`)
      .not('start_date', 'is', null)
      .not('end_date', 'is', null);

    if (error) throw error;

    return phases?.map((phase: any) => ({
      id: `phase-${phase.id}`,
      title: phase.name,
      start_date: phase.start_date,
      end_date: phase.end_date,
      type: 'phase' as const,
      status: phase.status,
      color: this.getPhaseColor(phase.status),
      project_id: phase.project_id,
      project_name: phase.projects?.name,
      workers: [], // Phases don't have direct worker assignments
      raw: phase
    })) || [];
  }

  private getScheduleColor(category: string): string {
    const colors = {
      normal: 'hsl(var(--primary))',
      materials: 'hsl(var(--secondary))',
      storingen: 'hsl(var(--destructive))',
      specials: 'hsl(var(--accent))'
    };
    return colors[category as keyof typeof colors] || 'hsl(var(--muted))';
  }

  private getTaskColor(priority: string, status: string): string {
    if (status === 'completed') return 'hsl(var(--success))';
    
    const colors = {
      urgent: 'hsl(var(--destructive))',
      high: 'hsl(var(--warning))',
      medium: 'hsl(var(--primary))',
      low: 'hsl(var(--muted))'
    };
    return colors[priority as keyof typeof colors] || 'hsl(var(--muted))';
  }

  private getPhaseColor(status: string): string {
    const colors = {
      planning: 'hsl(var(--muted))',
      active: 'hsl(var(--primary))',
      completed: 'hsl(var(--success))',
      'on-hold': 'hsl(var(--warning))',
      cancelled: 'hsl(var(--destructive))'
    };
    return colors[status as keyof typeof colors] || 'hsl(var(--muted))';
  }

  async getEventsForDay(date: Date): Promise<CalendarData> {
    return this.getEventsForDateRange(date, date);
  }

  async getEventsForWeek(date: Date): Promise<CalendarData> {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    return this.getEventsForDateRange(weekStart, weekEnd);
  }

  async getEventsForMonth(date: Date): Promise<CalendarData> {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    return this.getEventsForDateRange(monthStart, monthEnd);
  }
}

export const calendarDataService = new CalendarDataService();