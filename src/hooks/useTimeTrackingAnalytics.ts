import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TimeTrackingStats {
  totalHours: number;
  totalCost: number;
  avgHourlyRate: number;
  locationVerificationRate: number;
  overtimeHours: number;
  activeWorkers: number;
  pendingApprovals: number;
  approvalRate: number;
}

interface WorkerProductivity {
  user_id: string;
  user_name: string;
  total_hours: number;
  avg_hourly_rate: number;
  shifts_count: number;
  location_verified_rate: number;
  total_earnings: number;
}

interface ProjectTimeAllocation {
  project_id: string;
  project_name: string;
  total_hours: number;
  total_cost: number;
  worker_count: number;
  color: string;
}

interface DailyTrend {
  date: string;
  hours: number;
  cost: number;
  workers: number;
}

export const useTimeTrackingAnalytics = (dateRange: { start: string; end: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timesheetData, setTimesheetData] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any[]>([]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch timesheet data for the date range
      const { data: timesheets, error: timesheetError } = await supabase
        .from('timesheets')
        .select(`
          id,
          user_id,
          project_id,
          start_time,
          end_time,
          duration_generated,
          hourly_rate,
          total_earnings,
          location_verified,
          approved,
          created_at
        `)
        .gte('start_time', dateRange.start)
        .lte('start_time', dateRange.end)
        .not('end_time', 'is', null);

      if (timesheetError) throw timesheetError;

      // Get user profiles
      const userIds = [...new Set(timesheets?.map(t => t.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      // Get project data
      const projectIds = [...new Set(timesheets?.filter(t => t.project_id).map(t => t.project_id) || [])];
      const { data: projects } = projectIds.length > 0 
        ? await supabase.from('projects').select('id, name').in('id', projectIds)
        : { data: [] };

      setTimesheetData(timesheets || []);
      setProfileData(profiles || []);
      setProjectData(projects || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate overall statistics
  const stats: TimeTrackingStats = useMemo(() => {
    const totalHours = timesheetData.reduce((sum, t) => sum + (t.duration_generated || 0), 0);
    const totalCost = timesheetData.reduce((sum, t) => sum + (t.total_earnings || 0), 0);
    const avgHourlyRate = totalHours > 0 ? totalCost / totalHours : 0;
    
    const verifiedShifts = timesheetData.filter(t => t.location_verified).length;
    const locationVerificationRate = timesheetData.length > 0 ? (verifiedShifts / timesheetData.length) * 100 : 0;
    
    const overtimeHours = timesheetData.reduce((sum, t) => {
      const hours = t.duration_generated || 0;
      return sum + (hours > 8 ? hours - 8 : 0);
    }, 0);
    
    const activeWorkers = new Set(timesheetData.map(t => t.user_id)).size;
    const pendingApprovals = timesheetData.filter(t => !t.approved).length;
    const approvedShifts = timesheetData.filter(t => t.approved).length;
    const approvalRate = timesheetData.length > 0 ? (approvedShifts / timesheetData.length) * 100 : 0;

    return {
      totalHours,
      totalCost,
      avgHourlyRate,
      locationVerificationRate,
      overtimeHours,
      activeWorkers,
      pendingApprovals,
      approvalRate
    };
  }, [timesheetData]);

  // Calculate worker productivity
  const workerProductivity: WorkerProductivity[] = useMemo(() => {
    const workerStats = new Map();
    
    timesheetData.forEach(shift => {
      if (!workerStats.has(shift.user_id)) {
        workerStats.set(shift.user_id, {
          user_id: shift.user_id,
          user_name: profileData.find(p => p.user_id === shift.user_id)?.name || 'Unknown',
          total_hours: 0,
          total_earnings: 0,
          shifts_count: 0,
          verified_shifts: 0
        });
      }
      
      const worker = workerStats.get(shift.user_id);
      worker.total_hours += shift.duration_generated || 0;
      worker.total_earnings += shift.total_earnings || 0;
      worker.shifts_count += 1;
      if (shift.location_verified) worker.verified_shifts += 1;
    });

    return Array.from(workerStats.values()).map(worker => ({
      ...worker,
      avg_hourly_rate: worker.total_hours > 0 ? worker.total_earnings / worker.total_hours : 0,
      location_verified_rate: worker.shifts_count > 0 ? (worker.verified_shifts / worker.shifts_count) * 100 : 0
    }));
  }, [timesheetData, profileData]);

  // Calculate project time allocation
  const projectTimeAllocation: ProjectTimeAllocation[] = useMemo(() => {
    const projectStats = new Map();
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];
    
    timesheetData.forEach(shift => {
      const projectId = shift.project_id || 'unassigned';
      if (!projectStats.has(projectId)) {
        projectStats.set(projectId, {
          project_id: projectId,
          project_name: projectId === 'unassigned' 
            ? 'Unassigned' 
            : projectData.find(p => p.id === projectId)?.name || 'Unknown Project',
          total_hours: 0,
          total_cost: 0,
          workers: new Set(),
          color: colors[projectStats.size % colors.length]
        });
      }
      
      const project = projectStats.get(projectId);
      project.total_hours += shift.duration_generated || 0;
      project.total_cost += shift.total_earnings || 0;
      project.workers.add(shift.user_id);
    });

    return Array.from(projectStats.values()).map(project => ({
      ...project,
      worker_count: project.workers.size
    }));
  }, [timesheetData, projectData]);

  // Calculate daily trends
  const dailyTrends: DailyTrend[] = useMemo(() => {
    const dayStats = new Map();
    
    timesheetData.forEach(shift => {
      const date = new Date(shift.start_time).toISOString().split('T')[0];
      if (!dayStats.has(date)) {
        dayStats.set(date, {
          date,
          hours: 0,
          cost: 0,
          workers: new Set()
        });
      }
      
      const day = dayStats.get(date);
      day.hours += shift.duration_generated || 0;
      day.cost += shift.total_earnings || 0;
      day.workers.add(shift.user_id);
    });

    return Array.from(dayStats.values())
      .map(day => ({
        ...day,
        workers: day.workers.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [timesheetData]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange.start, dateRange.end]);

  return {
    isLoading,
    stats,
    workerProductivity,
    projectTimeAllocation,
    dailyTrends,
    refetch: fetchAnalyticsData
  };
};