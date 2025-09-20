import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WorkerAvailability {
  id: string;
  user_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_hours: number;
  created_at: string;
  updated_at: string;
}

export interface TimeOffRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  request_type: string;
  reason?: string;
  status: string;
  days_requested: number;
  approved_by?: string;
  approved_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityOverride {
  id: string;
  user_id: string;
  override_date: string;
  start_time?: string;
  end_time?: string;
  is_available: boolean;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  approved_by?: string;
  approved_at?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useWorkerAvailability = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch worker's own availability patterns
  const { data: availabilityPatterns, isLoading: loadingPatterns } = useQuery({
    queryKey: ['worker-availability', profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return [];
      
      const { data, error } = await supabase
        .from('worker_availability')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('day_of_week');
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.user_id,
  });

  // Fetch worker's time off requests
  const { data: timeOffRequests, isLoading: loadingTimeOff } = useQuery({
    queryKey: ['time-off-requests', profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return [];
      
      const { data, error } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.user_id,
  });

  // Fetch worker's availability overrides
  const { data: availabilityOverrides, isLoading: loadingOverrides } = useQuery({
    queryKey: ['availability-overrides', profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return [];
      
      const { data, error } = await supabase
        .from('availability_overrides')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('override_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.user_id,
  });

  // Create or update availability pattern
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (availability: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_available: boolean;
      max_hours?: number;
    }) => {
      const { data, error } = await supabase
        .from('worker_availability')
        .upsert({
          ...availability,
          user_id: profile?.user_id!,
          max_hours: availability.max_hours || 8,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-availability'] });
      toast({
        title: "Availability Updated",
        description: "Your availability pattern has been saved.",
      });
    },
    onError: (error) => {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit time off request
  const submitTimeOffMutation = useMutation({
    mutationFn: async (request: {
      start_date: string;
      end_date: string;
      request_type: string;
      reason?: string;
      days_requested: number;
    }) => {
      const { data, error } = await supabase
        .from('time_off_requests')
        .insert({
          ...request,
          user_id: profile?.user_id!,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off-requests'] });
      toast({
        title: "Request Submitted",
        description: "Your time off request has been submitted for approval.",
      });
    },
    onError: (error) => {
      console.error('Error submitting time off request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create availability override
  const createOverrideMutation = useMutation({
    mutationFn: async (override: {
      override_date: string;
      start_time?: string;
      end_time?: string;
      is_available: boolean;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from('availability_overrides')
        .upsert({
          ...override,
          user_id: profile?.user_id!,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-overrides'] });
      queryClient.invalidateQueries({ queryKey: ['team-availability'] });
      toast({
        title: "Override Submitted",
        description: "Your availability override has been submitted for approval.",
      });
    },
    onError: (error) => {
      console.error('Error creating override:', error);
      toast({
        title: "Error",
        description: "Failed to create override. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    availabilityPatterns,
    timeOffRequests,
    availabilityOverrides,
    
    // Loading states
    isLoading: loadingPatterns || loadingTimeOff || loadingOverrides,
    
    // Mutations
    updateAvailability: updateAvailabilityMutation.mutate,
    submitTimeOffRequest: submitTimeOffMutation.mutate,
    createOverride: createOverrideMutation.mutate,
    
    // Mutation states
    isUpdatingAvailability: updateAvailabilityMutation.isPending,
    isSubmittingTimeOff: submitTimeOffMutation.isPending,
    isCreatingOverride: createOverrideMutation.isPending,
  };
};