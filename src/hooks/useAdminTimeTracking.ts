import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from 'date-fns';

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

interface UserAnalytics {
  user_id: string;
  user_name: string;
  total_hours: number;
  total_shifts: number;
  avg_daily_hours: number;
  attendance_rate: number;
  overtime_hours: number;
  project_breakdown: Array<{
    project_name: string;
    hours: number;
    percentage: number;
  }>;
  daily_hours: Array<{
    date: string;
    hours: number;
  }>;
  weekly_trend: Array<{
    week: string;
    hours: number;
  }>;
  monthly_trend: Array<{
    month: string;
    hours: number;
  }>;
}

interface UserProgress {
  user_id: string;
  user_name: string;
  daily_goal: number;
  weekly_goal: number;
  monthly_goal: number;
  current_daily_hours: number;
  current_weekly_hours: number;
  current_monthly_hours: number;
  streak_days: number;
  total_projects: number;
  completion_rate: number;
}

type ViewPeriod = 'daily' | 'weekly' | 'monthly';

export const useAdminTimeTracking = () => {
  const [activeShifts, setActiveShifts] = useState<ActiveShift[]>([]);
  const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('daily');

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

  const fetchUserAnalytics = async (period: ViewPeriod, userId?: string) => {
    try {
      let startDate: Date;
      let endDate = new Date();

      switch (period) {
        case 'daily':
          startDate = subDays(endDate, 30); // Last 30 days
          break;
        case 'weekly':
          startDate = subDays(endDate, 84); // Last 12 weeks
          break;
        case 'monthly':
          startDate = subDays(endDate, 365); // Last 12 months
          break;
      }

      let query = supabase
        .from('timesheets')
        .select(`
          id,
          user_id,
          project_id,
          start_time,
          end_time,
          duration_generated,
          approved
        `)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .not('end_time', 'is', null)
        .eq('approved', true);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: timesheetData, error } = await query;

      if (error) throw error;

      // Get user names
      const userIds = Array.from(new Set(timesheetData?.map(t => t.user_id) || []));
      const { data: profiles } = userIds.length > 0 
        ? await supabase.from('profiles').select('user_id, name').in('user_id', userIds)
        : { data: [] };

      // Get project names
      const projectIds = Array.from(new Set(timesheetData?.filter(t => t.project_id).map(t => t.project_id) || []));
      const { data: projects } = projectIds.length > 0 
        ? await supabase.from('projects').select('id, name').in('id', projectIds)
        : { data: [] };

      // Group by user and calculate analytics
      const userMap = new Map<string, any>();

      timesheetData?.forEach(entry => {
        const userId = entry.user_id;
        const userName = profiles?.find(p => p.user_id === entry.user_id)?.name || 'Unknown User';
        const hours = entry.duration_generated || 0;
        const projectName = projects?.find(p => p.id === entry.project_id)?.name || 'No Project';

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            user_name: userName,
            total_hours: 0,
            total_shifts: 0,
            project_breakdown: new Map(),
            daily_hours: new Map(),
            weekly_hours: new Map(),
            monthly_hours: new Map(),
          });
        }

        const userData = userMap.get(userId);
        userData.total_hours += hours;
        userData.total_shifts += 1;

        // Project breakdown
        const currentProject = userData.project_breakdown.get(projectName) || 0;
        userData.project_breakdown.set(projectName, currentProject + hours);

        // Time periods
        const date = format(new Date(entry.start_time), 'yyyy-MM-dd');
        const week = format(startOfWeek(new Date(entry.start_time)), 'yyyy-MM-dd');
        const month = format(startOfMonth(new Date(entry.start_time)), 'yyyy-MM');

        userData.daily_hours.set(date, (userData.daily_hours.get(date) || 0) + hours);
        userData.weekly_hours.set(week, (userData.weekly_hours.get(week) || 0) + hours);
        userData.monthly_hours.set(month, (userData.monthly_hours.get(month) || 0) + hours);
      });

      // Convert to final format
      const analytics: UserAnalytics[] = Array.from(userMap.values()).map(user => {
        const workingDays = user.daily_hours.size;
        const avgDailyHours = workingDays > 0 ? user.total_hours / workingDays : 0;
        const overtimeHours = Math.max(0, user.total_hours - (workingDays * 8)); // Assuming 8h standard

        return {
          ...user,
          avg_daily_hours: avgDailyHours,
          attendance_rate: (workingDays / 30) * 100, // Simplified calculation
          overtime_hours: overtimeHours,
          project_breakdown: Array.from(user.project_breakdown.entries()).map(([name, hours]) => ({
            project_name: name,
            hours: hours,
            percentage: user.total_hours > 0 ? (hours / user.total_hours) * 100 : 0
          })),
          daily_hours: Array.from(user.daily_hours.entries()).map(([date, hours]) => ({
            date,
            hours
          })).sort((a, b) => a.date.localeCompare(b.date)),
          weekly_trend: Array.from(user.weekly_hours.entries()).map(([week, hours]) => ({
            week,
            hours
          })).sort((a, b) => a.week.localeCompare(b.week)),
          monthly_trend: Array.from(user.monthly_hours.entries()).map(([month, hours]) => ({
            month,
            hours
          })).sort((a, b) => a.month.localeCompare(b.month)),
        };
      });

      setUserAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user analytics",
        variant: "destructive"
      });
    }
  };

  const fetchUserProgress = async () => {
    try {
      // Get all users
      const { data: users } = await supabase
        .from('profiles')
        .select('user_id, name')
        .eq('role', 'worker');

      if (!users) return;

      const today = new Date();
      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);
      
      const startOfThisWeek = startOfWeek(today);
      const startOfThisMonth = startOfMonth(today);

      const progress: UserProgress[] = await Promise.all(
        users.map(async (user) => {
          // Get daily hours
          const { data: dailyData } = await supabase
            .from('timesheets')
            .select('duration_generated')
            .eq('user_id', user.user_id)
            .gte('start_time', startOfToday.toISOString())
            .not('end_time', 'is', null)
            .eq('approved', true);

          // Get weekly hours
          const { data: weeklyData } = await supabase
            .from('timesheets')
            .select('duration_generated')
            .eq('user_id', user.user_id)
            .gte('start_time', startOfThisWeek.toISOString())
            .not('end_time', 'is', null)
            .eq('approved', true);

          // Get monthly hours
          const { data: monthlyData } = await supabase
            .from('timesheets')
            .select('duration_generated')
            .eq('user_id', user.user_id)
            .gte('start_time', startOfThisMonth.toISOString())
            .not('end_time', 'is', null)
            .eq('approved', true);

          // Calculate streak (simplified)
          const { data: recentData } = await supabase
            .from('timesheets')
            .select('start_time')
            .eq('user_id', user.user_id)
            .gte('start_time', subDays(today, 30).toISOString())
            .not('end_time', 'is', null)
            .eq('approved', true)
            .order('start_time', { ascending: false });

          const currentDaily = dailyData?.reduce((sum, entry) => sum + (entry.duration_generated || 0), 0) || 0;
          const currentWeekly = weeklyData?.reduce((sum, entry) => sum + (entry.duration_generated || 0), 0) || 0;
          const currentMonthly = monthlyData?.reduce((sum, entry) => sum + (entry.duration_generated || 0), 0) || 0;

          // Calculate streak days
          const workDays = new Set();
          recentData?.forEach(entry => {
            workDays.add(format(new Date(entry.start_time), 'yyyy-MM-dd'));
          });

          let streak = 0;
          const currentDate = new Date();
          while (streak < 30) {
            const checkDate = format(subDays(currentDate, streak), 'yyyy-MM-dd');
            if (workDays.has(checkDate)) {
              streak++;
            } else {
              break;
            }
          }

          return {
            user_id: user.user_id,
            user_name: user.name,
            daily_goal: 8, // Default goals
            weekly_goal: 40,
            monthly_goal: 160,
            current_daily_hours: currentDaily,
            current_weekly_hours: currentWeekly,
            current_monthly_hours: currentMonthly,
            streak_days: streak,
            total_projects: 0, // To be calculated separately if needed
            completion_rate: Math.min(100, (currentMonthly / 160) * 100),
          };
        })
      );

      setUserProgress(progress);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user progress",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchActiveShifts(),
        fetchTimesheetEntries(selectedDate),
        fetchUserAnalytics(viewPeriod, selectedUser),
        fetchUserProgress()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [selectedDate, viewPeriod, selectedUser]);

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
    userAnalytics,
    userProgress,
    isLoading,
    selectedDate,
    setSelectedDate,
    selectedUser,
    setSelectedUser,
    viewPeriod,
    setViewPeriod,
    approveTimesheet,
    rejectTimesheet,
    finishShift,
    fetchUserAnalytics,
    fetchUserProgress,
    refetch: () => {
      fetchActiveShifts();
      fetchTimesheetEntries(selectedDate);
      fetchUserAnalytics(viewPeriod, selectedUser);
      fetchUserProgress();
    }
  };
};