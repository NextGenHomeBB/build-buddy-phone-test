import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAvailabilityRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to time off requests changes
    const timeOffChannel = supabase
      .channel('time-off-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_off_requests'
        },
        (payload) => {
          console.log('Time off request changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['pending-time-off-requests'] });
          queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
          queryClient.invalidateQueries({ queryKey: ['team-availability'] });
        }
      )
      .subscribe();

    // Subscribe to availability overrides changes
    const overridesChannel = supabase
      .channel('availability-overrides-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability_overrides'
        },
        (payload) => {
          console.log('Availability override changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['pending-availability-overrides'] });
          queryClient.invalidateQueries({ queryKey: ['availability-overrides'] });
          queryClient.invalidateQueries({ queryKey: ['team-availability'] });
        }
      )
      .subscribe();

    // Subscribe to absences changes (for approved time off)
    const absencesChannel = supabase
      .channel('absences-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'absences'
        },
        (payload) => {
          console.log('Absence changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['team-availability'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(timeOffChannel);
      supabase.removeChannel(overridesChannel);
      supabase.removeChannel(absencesChannel);
    };
  }, [queryClient]);
};