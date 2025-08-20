import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface RealtimeCalendarSyncProps {
  onScheduleUpdate?: () => void;
  onTaskUpdate?: () => void;
}

export function RealtimeCalendarSync({ onScheduleUpdate, onTaskUpdate }: RealtimeCalendarSyncProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Set up real-time subscriptions for schedule changes
    const scheduleChannel = supabase
      .channel('schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedules'
        },
        (payload) => {
          console.log('Schedule change detected:', payload);
          
          // Invalidate calendar queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
          queryClient.invalidateQueries({ queryKey: ['worker-schedule'] });
          
          onScheduleUpdate?.();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Schedule Updated",
              description: "New schedule has been added",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Schedule Changed",
              description: "Schedule has been updated",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_items'
        },
        (payload) => {
          console.log('Schedule item change detected:', payload);
          
          queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
          queryClient.invalidateQueries({ queryKey: ['worker-schedule'] });
          
          onScheduleUpdate?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_item_workers'
        },
        (payload) => {
          console.log('Schedule worker assignment change detected:', payload);
          
          queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
          queryClient.invalidateQueries({ queryKey: ['worker-schedule'] });
          
          onScheduleUpdate?.();
          
          // Notify user if they were assigned or unassigned
          if (payload.eventType === 'INSERT' && payload.new?.user_id === user.id) {
            toast({
              title: "New Assignment",
              description: "You've been assigned to a new schedule item",
            });
          } else if (payload.eventType === 'DELETE' && payload.old?.user_id === user.id) {
            toast({
              title: "Assignment Removed",
              description: "You've been removed from a schedule item",
            });
          }
        }
      )
      .subscribe();

    // Set up real-time subscriptions for task changes
    const taskChannel = supabase
      .channel('task-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Task change detected:', payload);
          
          queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
          queryClient.invalidateQueries({ queryKey: ['worker-schedule'] });
          
          onTaskUpdate?.();
          
          // Notify user if they were assigned a task
          if (payload.eventType === 'INSERT' && payload.new?.assigned_to === user.id) {
            toast({
              title: "New Task Assigned",
              description: `Task "${payload.new.title}" has been assigned to you`,
            });
          } else if (payload.eventType === 'UPDATE' && payload.new?.assigned_to === user.id && payload.old?.assigned_to !== user.id) {
            toast({
              title: "Task Assigned",
              description: `Task "${payload.new.title}" has been assigned to you`,
            });
          }
        }
      )
      .subscribe();

    // Set up subscription for project phase changes
    const phaseChannel = supabase
      .channel('phase-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_phases'
        },
        (payload) => {
          console.log('Phase change detected:', payload);
          
          queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
          queryClient.invalidateQueries({ queryKey: ['worker-schedule'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(scheduleChannel);
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(phaseChannel);
    };
  }, [user?.id, queryClient, onScheduleUpdate, onTaskUpdate]);

  return null; // This is a logic-only component
}