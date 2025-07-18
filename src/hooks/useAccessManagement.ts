import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accessService } from '@/services/access.service';
import { useToast } from '@/hooks/use-toast';

export const useAccessManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assignProjectRole = useMutation({
    mutationFn: async ({ userId, projectId, role }: { 
      userId: string; 
      projectId: string; 
      role: 'manager' | 'worker' 
    }) => {
      await accessService.upsertUserProjectRole(userId, projectId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjectRole'] });
      queryClient.invalidateQueries({ queryKey: ['accessible-projects'] });
      toast({
        title: 'Access granted',
        description: 'User has been granted project access.',
      });
    },
    onError: (error: Error) => {
      console.error('Failed to assign project role:', error);
      toast({
        title: 'Failed to grant access',
        description: error.message || 'Unable to grant project access. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const removeProjectRole = useMutation({
    mutationFn: async ({ userId, projectId, role }: { 
      userId: string; 
      projectId: string; 
      role: 'manager' | 'worker' 
    }) => {
      await accessService.removeUserProjectRole(userId, projectId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProjectRole'] });
      queryClient.invalidateQueries({ queryKey: ['accessible-projects'] });
      toast({
        title: 'Access revoked',
        description: 'User project access has been revoked.',
      });
    },
    onError: (error: Error) => {
      console.error('Failed to remove project role:', error);
      toast({
        title: 'Failed to revoke access',
        description: error.message || 'Unable to revoke project access. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const assignPhaseRole = useMutation({
    mutationFn: async ({ userId, phaseId, role }: { 
      userId: string; 
      phaseId: string; 
      role: 'manager' | 'worker' 
    }) => {
      await accessService.upsertUserPhaseRole(userId, phaseId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhaseRole'] });
      toast({
        title: 'Phase access granted',
        description: 'User has been granted phase access.',
      });
    },
    onError: (error: Error) => {
      console.error('Failed to assign phase role:', error);
      toast({
        title: 'Failed to grant phase access',
        description: error.message || 'Unable to grant phase access. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const removePhaseRole = useMutation({
    mutationFn: async ({ userId, phaseId, role }: { 
      userId: string; 
      phaseId: string; 
      role: 'manager' | 'worker' 
    }) => {
      await accessService.removeUserPhaseRole(userId, phaseId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPhaseRole'] });
      toast({
        title: 'Phase access revoked',
        description: 'User phase access has been revoked.',
      });
    },
    onError: (error: Error) => {
      console.error('Failed to remove phase role:', error);
      toast({
        title: 'Failed to revoke phase access',
        description: error.message || 'Unable to revoke phase access. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    assignProjectRole,
    removeProjectRole,
    assignPhaseRole,
    removePhaseRole,
  };
};