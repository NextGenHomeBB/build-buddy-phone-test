import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ActiveShift {
  id: string;
  user_id: string;
  user_name: string;
  project_id?: string;
  project_name?: string;
  start_time: string;
  start_location?: any;
  start_photo_url?: string;
  location_verified: boolean;
}

interface TimesheetEntry {
  id: string;
  user_id: string;
  user_name: string;
  project_id?: string;
  project_name?: string;
  start_time: string;
  end_time?: string;
  duration_generated?: number;
  start_location?: any;
  end_location?: any;
  start_photo_url?: string;
  end_photo_url?: string;
  location_verified: boolean;
  approved: boolean;
  notes?: string;
  created_at: string;
}

export const useAdminTimeTracking = () => {
  const [activeShifts, setActiveShifts] = useState<ActiveShift[]>([]);
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchActiveShifts = async () => {
    try {
      const { data: timesheetData, error } = await supabase
        .from('timesheets')
        .select(`
          id,
          user_id,
          project_id,
          start_time,
          start_location,
          start_photo_url,
          location_verified
        `)
        .is('end_time', null);

      if (error) throw error;

      // Get user names
      const userIds = timesheetData.map(t => t.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      // Get project names
      const projectIds = timesheetData.filter(t => t.project_id).map(t => t.project_id);
      const { data: projects } = projectIds.length > 0 
        ? await supabase.from('projects').select('id, name').in('id', projectIds)
        : { data: [] };

      const shifts = timesheetData.map(shift => ({
        id: shift.id,
        user_id: shift.user_id,
        user_name: profiles?.find(p => p.user_id === shift.user_id)?.name || 'Unknown User',
        project_id: shift.project_id,
        project_name: projects?.find(p => p.id === shift.project_id)?.name || 'No project',
        start_time: shift.start_time,
        start_location: shift.start_location,
        start_photo_url: shift.start_photo_url,
        location_verified: shift.location_verified
      }));

      setActiveShifts(shifts);
    } catch (error) {
      console.error('Error fetching active shifts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch active shifts",
        variant: "destructive"
      });
    }
  };

  const fetchTimesheetEntries = async (date: string) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: timesheetData, error } = await supabase
        .from('timesheets')
        .select(`
          id,
          user_id,
          project_id,
          start_time,
          end_time,
          duration_generated,
          start_location,
          end_location,
          start_photo_url,
          end_photo_url,
          location_verified,
          approved,
          notes,
          created_at
        `)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: false });

      if (error) throw error;

      // Get user names
      const userIds = timesheetData.map(t => t.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      // Get project names
      const projectIds = timesheetData.filter(t => t.project_id).map(t => t.project_id);
      const { data: projects } = projectIds.length > 0 
        ? await supabase.from('projects').select('id, name').in('id', projectIds)
        : { data: [] };

      const entries = timesheetData.map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        user_name: profiles?.find(p => p.user_id === entry.user_id)?.name || 'Unknown User',
        project_id: entry.project_id,
        project_name: projects?.find(p => p.id === entry.project_id)?.name || 'No project',
        start_time: entry.start_time,
        end_time: entry.end_time,
        duration_generated: entry.duration_generated,
        start_location: entry.start_location,
        end_location: entry.end_location,
        start_photo_url: entry.start_photo_url,
        end_photo_url: entry.end_photo_url,
        location_verified: entry.location_verified,
        approved: entry.approved,
        notes: entry.notes,
        created_at: entry.created_at
      }));

      setTimesheetEntries(entries);
    } catch (error) {
      console.error('Error fetching timesheet entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch timesheet entries",
        variant: "destructive"
      });
    }
  };

  const approveTimesheet = async (timesheetId: string) => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .update({ approved: true })
        .eq('id', timesheetId);

      if (error) throw error;

      setTimesheetEntries(prev => 
        prev.map(entry => 
          entry.id === timesheetId 
            ? { ...entry, approved: true }
            : entry
        )
      );

      toast({
        title: "Success",
        description: "Timesheet approved successfully"
      });
    } catch (error) {
      console.error('Error approving timesheet:', error);
      toast({
        title: "Error",
        description: "Failed to approve timesheet",
        variant: "destructive"
      });
    }
  };

  const rejectTimesheet = async (timesheetId: string) => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .update({ approved: false })
        .eq('id', timesheetId);

      if (error) throw error;

      setTimesheetEntries(prev => 
        prev.map(entry => 
          entry.id === timesheetId 
            ? { ...entry, approved: false }
            : entry
        )
      );

      toast({
        title: "Success",
        description: "Timesheet rejected"
      });
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      toast({
        title: "Error",
        description: "Failed to reject timesheet",
        variant: "destructive"
      });
    }
  };

  const finishShift = async (timesheetId: string) => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .update({ 
          end_time: new Date().toISOString()
        })
        .eq('id', timesheetId);

      if (error) throw error;

      // Remove from active shifts
      setActiveShifts(prev => 
        prev.filter(shift => shift.id !== timesheetId)
      );

      // Refresh timesheet entries for today to show the completed shift
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate === today) {
        fetchTimesheetEntries(selectedDate);
      }

      toast({
        title: "Success",
        description: "Shift finished successfully"
      });
    } catch (error) {
      console.error('Error finishing shift:', error);
      toast({
        title: "Error",
        description: "Failed to finish shift",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchActiveShifts(),
        fetchTimesheetEntries(selectedDate)
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [selectedDate]);

  // Set up real-time subscription for active shifts
  useEffect(() => {
    const channel = supabase
      .channel('admin-timesheets')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'timesheets'
      }, () => {
        fetchActiveShifts();
        fetchTimesheetEntries(selectedDate);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  return {
    activeShifts,
    timesheetEntries,
    isLoading,
    selectedDate,
    setSelectedDate,
    approveTimesheet,
    rejectTimesheet,
    finishShift,
    refetch: () => {
      fetchActiveShifts();
      fetchTimesheetEntries(selectedDate);
    }
  };
};