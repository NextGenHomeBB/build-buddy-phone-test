import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PhaseTaskCounts {
  [phaseId: string]: {
    total: number;
    completed: number;
  };
}

export function usePhaseTasks(projectId: string) {
  return useQuery({
    queryKey: ['phase-tasks', projectId],
    queryFn: async () => {
      if (!projectId) return {};

      const { data, error } = await supabase
        .from('tasks')
        .select('phase_id, status')
        .eq('project_id', projectId);

      if (error) throw error;

      // Group tasks by phase and count them
      const taskCounts: PhaseTaskCounts = {};
      
      data?.forEach(task => {
        if (task.phase_id) {
          if (!taskCounts[task.phase_id]) {
            taskCounts[task.phase_id] = { total: 0, completed: 0 };
          }
          taskCounts[task.phase_id].total++;
          if (task.status === 'completed') {
            taskCounts[task.phase_id].completed++;
          }
        }
      });

      return taskCounts;
    },
    enabled: !!projectId,
  });
}

export function getTaskCountsForPhase(taskCounts: PhaseTaskCounts, phaseId: string) {
  return taskCounts[phaseId] || { total: 0, completed: 0 };
}