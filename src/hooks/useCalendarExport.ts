import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarExportService } from '@/services/calendarExport.service';
import { useToast } from '@/hooks/use-toast';
import { PhaseCalendarData } from '@/hooks/usePhaseCalendar';

export function useCalendarExport(projectId: string) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Get project name for export
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Get phases for export
  const { data: phases } = useQuery({
    queryKey: ['phases', projectId, 'export'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_phases')
        .select('id, name, start_date, end_date, status, progress, material_cost, labour_cost')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as PhaseCalendarData[];
    },
  });

  const exportToAppleCalendar = async () => {
    if (!phases || phases.length === 0) {
      toast({
        title: "No phases to export",
        description: "Add some phases with dates to export to Apple Calendar.",
        variant: "destructive",
      });
      return;
    }

    const phasesWithDates = phases.filter(phase => phase.start_date && phase.end_date);
    
    if (phasesWithDates.length === 0) {
      toast({
        title: "No phases with dates",
        description: "Add start and end dates to phases to export them to Apple Calendar.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const projectName = project?.name || 'Project';
      CalendarExportService.downloadICalendar(phasesWithDates, projectName);
      
      toast({
        title: "Calendar exported",
        description: `Downloaded ${phasesWithDates.length} phases. Import the .ics file into Apple Calendar.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToAppleCalendar,
    isExporting,
    canExport: phases && phases.some(phase => phase.start_date && phase.end_date),
  };
}