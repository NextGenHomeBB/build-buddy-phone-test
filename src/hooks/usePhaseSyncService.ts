import { useMutation, useQueryClient } from '@tanstack/react-query';
import { phaseSyncService, SyncReport } from '@/services/phaseSyncService';
import { toast } from '@/hooks/use-toast';

export function useSyncAllPhases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (): Promise<SyncReport> => phaseSyncService.syncAllPhasesWithDefaults(),
    onSuccess: (result) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['default-phases'] });
      queryClient.invalidateQueries({ queryKey: ['phases'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['phase-tasks'] });

      if (result.success) {
        toast({
          title: "Sync Completed",
          description: result.message,
        });
      } else {
        toast({
          title: "Sync Completed with Warnings",
          description: `${result.message}\n${result.errors.length} errors occurred.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: `Failed to sync phases: ${error}`,
        variant: "destructive",
      });
    },
  });
}

export function useSyncSpecificPhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phaseName, defaultChecklist }: { phaseName: string; defaultChecklist: string[] }): Promise<SyncReport> => 
      phaseSyncService.syncPhaseWithDefault(phaseName, defaultChecklist),
    onSuccess: (result) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['default-phases'] });
      queryClient.invalidateQueries({ queryKey: ['phases'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['phase-tasks'] });

      if (result.success) {
        toast({
          title: "Phase Synced",
          description: result.message,
        });
      } else {
        toast({
          title: "Phase Sync Completed with Warnings",
          description: `${result.message}\n${result.errors.length} errors occurred.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Phase Sync Failed",
        description: `Failed to sync phase: ${error}`,
        variant: "destructive",
      });
    },
  });
}

export function useStandardizePhaseName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ currentName, newName }: { currentName: string; newName: string }): Promise<SyncReport> => 
      phaseSyncService.standardizePhaseName(currentName, newName),
    onSuccess: (result) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['default-phases'] });
      queryClient.invalidateQueries({ queryKey: ['phases'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });

      if (result.success) {
        toast({
          title: "Phase Name Standardized",
          description: result.message,
        });
      } else {
        toast({
          title: "Standardization Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Standardization Failed",
        description: `Failed to standardize phase name: ${error}`,
        variant: "destructive",
      });
    },
  });
}