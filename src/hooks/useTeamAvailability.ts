import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TimeOffRequest, WorkerAvailability, AvailabilityOverride } from './useWorkerAvailability';

export interface TeamMember {
  user_id: string;
  name: string;
  avatar_url?: string;
  phone?: string;
  role: string;
}

export interface TeamAvailabilityData {
  user: TeamMember;
  availabilityPatterns: WorkerAvailability[];
  timeOffRequests: TimeOffRequest[];
  availabilityOverrides: AvailabilityOverride[];
}

export const useTeamAvailability = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all team members and their availability data
  const { data: teamAvailability, isLoading } = useQuery({
    queryKey: ['team-availability'],
    queryFn: async () => {
      // First get all team members (including admins)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, phone, role')
        .in('role', ['worker', 'manager', 'admin']);
      
      if (profilesError) throw profilesError;

      // Get availability data for each team member
      const teamData = await Promise.all(
        profiles.map(async (profile): Promise<TeamAvailabilityData> => {
          const [
            { data: patterns },
            { data: requests },
            { data: overrides }
          ] = await Promise.all([
            supabase
              .from('worker_availability')
              .select('*')
              .eq('user_id', profile.user_id)
              .order('day_of_week'),
            supabase
              .from('time_off_requests')
              .select('*')
              .eq('user_id', profile.user_id)
              .order('created_at', { ascending: false }),
            supabase
              .from('availability_overrides')
              .select('*')
              .eq('user_id', profile.user_id)
              .order('override_date', { ascending: false })
          ]);

          return {
            user: profile as TeamMember,
            availabilityPatterns: patterns || [],
            timeOffRequests: requests || [],
            availabilityOverrides: overrides?.map(override => ({
              ...override,
              status: override.status as 'pending' | 'approved' | 'denied'
            })) || [],
          };
        })
      );

      return teamData;
    },
  });

  // Fetch pending time off requests for approval
  const { data: pendingRequests, isLoading: loadingPending } = useQuery({
    queryKey: ['pending-time-off-requests'],
    queryFn: async () => {
      console.log('Fetching pending time off requests...');
      const { data: requests, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching time off requests:', error);
        throw error;
      }

      if (!requests || requests.length === 0) {
        console.log('No pending time off requests found');
        return [];
      }

      // Fetch profiles separately
      const userIds = requests.map(r => r.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', userIds);

      if (profileError) {
        console.error('Error fetching profiles for time off requests:', profileError);
        throw profileError;
      }

      // Merge requests with profiles
      const requestsWithProfiles = requests.map(request => ({
        ...request,
        profiles: profiles?.find(p => p.user_id === request.user_id) || { 
          name: 'Unknown User', 
          avatar_url: null 
        }
      }));

      console.log('Pending time off requests with profiles:', requestsWithProfiles);
      return requestsWithProfiles;
    },
  });

  // Fetch pending availability override requests for approval
  const { data: pendingOverrides, isLoading: loadingPendingOverrides } = useQuery({
    queryKey: ['pending-availability-overrides'],
    queryFn: async () => {
      console.log('Fetching pending availability overrides...');
      const { data: overrides, error } = await supabase
        .from('availability_overrides')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching availability overrides:', error);
        throw error;
      }

      if (!overrides || overrides.length === 0) {
        console.log('No pending availability overrides found');
        return [];
      }

      // Fetch profiles separately
      const userIds = overrides.map(o => o.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', userIds);

      if (profileError) {
        console.error('Error fetching profiles for overrides:', profileError);
        throw profileError;
      }

      // Merge overrides with profiles
      const overridesWithProfiles = overrides.map(override => ({
        ...override,
        profiles: profiles?.find(p => p.user_id === override.user_id) || { 
          name: 'Unknown User', 
          avatar_url: null 
        }
      }));

      console.log('Pending availability overrides with profiles:', overridesWithProfiles);
      return overridesWithProfiles;
    },
  });

  // Approve or deny time off request
  const processTimeOffMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      adminNotes 
    }: { 
      requestId: string; 
      status: 'approved' | 'denied'; 
      adminNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from('time_off_requests')
        .update({
          status,
          admin_notes: adminNotes,
          approved_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-time-off-requests'] });
      queryClient.invalidateQueries({ queryKey: ['team-availability'] });
      toast({
        title: status === 'approved' ? "Request Approved" : "Request Denied",
        description: `Time off request has been ${status}.`,
      });
    },
    onError: (error) => {
      console.error('Error processing time off request:', error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Approve or deny availability override request
  const processAvailabilityOverrideMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      adminNotes 
    }: { 
      requestId: string; 
      status: 'approved' | 'denied'; 
      adminNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from('availability_overrides')
        .update({
          status,
          admin_notes: adminNotes,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-availability-overrides'] });
      queryClient.invalidateQueries({ queryKey: ['team-availability'] });
      queryClient.invalidateQueries({ queryKey: ['availability-overrides'] });
      queryClient.invalidateQueries({ queryKey: ['worker-availability'] });
      toast({
        title: status === 'approved' ? "Override Approved" : "Override Denied",
        description: `Availability override has been ${status}.`,
      });
    },
    onError: (error) => {
      console.error('Error processing availability override:', error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check if worker is available for specific date/time
  const checkWorkerAvailability = async (
    workerId: string,
    date: string,
    startTime?: string,
    endTime?: string
  ): Promise<boolean> => {
    // Simplified availability check - can be enhanced later
    return true;
  };

  // Get available workers for a specific date/time
  const getAvailableWorkers = async (
    date: string,
    startTime?: string,
    endTime?: string
  ) => {
    if (!teamAvailability) return [];
    
    const availableWorkers = await Promise.all(
      teamAvailability.map(async (member) => {
        const isAvailable = await checkWorkerAvailability(
          member.user.user_id,
          date,
          startTime,
          endTime
        );
        return { ...member, isAvailable };
      })
    );
    
    return availableWorkers.filter(worker => worker.isAvailable);
  };

  return {
    // Data
    teamAvailability,
    pendingRequests,
    pendingOverrides,
    
    // Loading states
    isLoading,
    isLoadingPending: loadingPending,
    isLoadingPendingOverrides: loadingPendingOverrides,
    
    // Mutations
    processTimeOffRequest: processTimeOffMutation.mutate,
    processAvailabilityOverride: processAvailabilityOverrideMutation.mutate,
    isProcessingRequest: processTimeOffMutation.isPending,
    isProcessingOverride: processAvailabilityOverrideMutation.isPending,
    
    // Helper functions
    checkWorkerAvailability,
    getAvailableWorkers,
  };
};